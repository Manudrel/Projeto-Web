import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from './auth.types.js';
import { AuthService } from './auth.service.js';
import {
  AuthMessageResponseDto,
  AuthSessionResponseDto,
  AuthUserResponseDto,
} from './dto/auth-response.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Criar conta de estudante' })
  @ApiCreatedResponse({ type: AuthUserResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({ description: 'E-mail já cadastrado' })
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Entrar e receber tokens JWT' })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'E-mail ou senha inválidos' })
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotacionar refresh token' })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({
    description: 'Refresh token inválido ou expirado',
  })
  refresh(@Body() data: RefreshTokenDto) {
    return this.authService.refresh(data.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revogar um refresh token' })
  @ApiNoContentResponse({ description: 'Token revogado' })
  @ApiUnauthorizedResponse({ description: 'Access token inválido ou expirado' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: RefreshTokenDto,
  ): Promise<void> {
    await this.authService.logout(user, data.refreshToken);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar instruções para redefinir a senha' })
  @ApiOkResponse({ type: AuthMessageResponseDto })
  @ApiBadRequestResponse({ description: 'E-mail inválido' })
  forgotPassword(@Body() data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefinir a senha com token de uso único' })
  @ApiOkResponse({ type: AuthMessageResponseDto })
  @ApiBadRequestResponse({
    description: 'Token inválido, expirado ou já usado',
  })
  resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar usuário, perfil e permissões atuais' })
  @ApiOkResponse({ type: AuthUserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Access token inválido ou expirado' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
