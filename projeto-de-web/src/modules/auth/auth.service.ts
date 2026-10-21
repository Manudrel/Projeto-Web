import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { AuthRepository } from './auth.repository.js';
import type {
  AccessTokenPayload,
  AuthenticatedUser,
  RefreshTokenPayload,
} from './auth.types.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly repository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(data: RegisterDto): Promise<AuthenticatedUser> {
    const email = data.email.trim().toLowerCase();
    if (await this.repository.emailExists(email)) {
      throw new ConflictException('Já existe uma conta com esse e-mail.');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const userId = await this.repository.createStudentUser(
      data.name.trim(),
      email,
      passwordHash,
    );

    if (userId === null) {
      throw new InternalServerErrorException(
        'O perfil STUDENT ativo não está cadastrado. Execute as migrations e seeds de autenticação.',
      );
    }

    const account = await this.repository.findAccountById(userId);
    if (!account) {
      throw new InternalServerErrorException(
        'Não foi possível carregar o usuário criado.',
      );
    }

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      status: account.status,
      profile: account.profile,
      permissions: account.permissions,
    };
  }

  async login(data: LoginDto) {
    const account = await this.repository.findAccountByEmail(
      data.email.trim().toLowerCase(),
    );
    const passwordMatches = account
      ? await bcrypt.compare(data.password, account.passwordHash)
      : false;

    if (!account || account.status !== 'ACTIVE' || !passwordMatches) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const session = await this.createSession(account);
    await this.repository.saveRefreshToken(
      account.id,
      session.refresh.hash,
      session.refresh.expiresAt,
    );

    return session.response;
  }

  async refresh(refreshToken: string) {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }

    if (
      payload.typ !== 'refresh' ||
      !Number.isInteger(payload.sub) ||
      !payload.jti
    ) {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }

    const account = await this.repository.findAccountById(payload.sub);
    if (!account || account.status !== 'ACTIVE') {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }

    const session = await this.createSession(account);
    const rotated = await this.repository.rotateRefreshToken(
      account.id,
      this.hashToken(refreshToken),
      session.refresh.hash,
      session.refresh.expiresAt,
    );

    if (!rotated) {
      throw new UnauthorizedException(
        'Refresh token inválido ou já utilizado.',
      );
    }

    return session.response;
  }

  async logout(user: AuthenticatedUser, refreshToken: string): Promise<void> {
    await this.repository.revokeRefreshToken(
      user.id,
      this.hashToken(refreshToken),
    );
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    const genericResponse = {
      message:
        'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.',
    };
    const account = await this.repository.findAccountByEmail(
      data.email.trim().toLowerCase(),
    );

    if (!account || account.status !== 'ACTIVE') return genericResponse;

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(
      Date.now() +
        this.durationToMilliseconds(
          this.config.get<string>('RESET_PASSWORD_EXPIRES_IN') ?? '1h',
        ),
    );

    await this.repository.createPasswordResetToken(
      account.id,
      this.hashToken(token),
      expiresAt,
    );

    if (this.config.get<string>('NODE_ENV') === 'development') {
      const baseUrl =
        this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
      this.logger.log(
        `Link de redefinição de senha (somente desenvolvimento): ${baseUrl}/reset-password?token=${token}`,
      );
    }

    return genericResponse;
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const updated = await this.repository.resetPassword(
      this.hashToken(data.token),
      await bcrypt.hash(data.newPassword, 12),
    );

    if (!updated) {
      throw new BadRequestException(
        'Token de redefinição inválido, expirado ou já utilizado.',
      );
    }

    return { message: 'Senha redefinida com sucesso.' };
  }

  async validateAccessToken(userId: number): Promise<AuthenticatedUser> {
    const account = await this.repository.findAccountById(userId);
    if (!account || account.status !== 'ACTIVE') {
      throw new UnauthorizedException('A conta não está ativa.');
    }

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      status: account.status,
      profile: account.profile,
      permissions: account.permissions,
    };
  }

  private async createSession(account: {
    id: number;
    email: string;
    profile: { id: number; role: string };
    permissions: string[];
  }) {
    const accessExpiresIn =
      this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    const refreshExpiresIn =
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
    const accessPayload: AccessTokenPayload = {
      sub: account.id,
      email: account.email,
      profileId: account.profile.id,
      role: account.profile.role as AccessTokenPayload['role'],
      permissions: account.permissions,
    };
    const accessToken = await this.jwtService.signAsync(accessPayload, {
      expiresIn: accessExpiresIn as JwtSignOptions['expiresIn'],
    });
    const refreshExpiresAt = new Date(
      Date.now() + this.durationToMilliseconds(refreshExpiresIn),
    );
    const refreshPayload: RefreshTokenPayload = {
      sub: account.id,
      typ: 'refresh',
      jti: randomUUID(),
    };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiresIn as JwtSignOptions['expiresIn'],
    });

    return {
      response: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: Math.floor(
          this.durationToMilliseconds(accessExpiresIn) / 1000,
        ),
      },
      refresh: {
        token: refreshToken,
        hash: this.hashToken(refreshToken),
        expiresAt: refreshExpiresAt,
      }
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private durationToMilliseconds(duration: string): number {
    const match = /^(\d+)(s|m|h|d)?$/.exec(duration);
    if (!match) {
      throw new InternalServerErrorException(
        'Configuração de expiração de token inválida.',
      );
    }

    const value = Number(match[1]);
    const unit = match[2] ?? 's';
    const multiplier: Record<string, number> = {
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return value * multiplier[unit];
  }
}
