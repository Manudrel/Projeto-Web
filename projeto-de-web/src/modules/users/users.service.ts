import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ListUsersDto } from './dto/list-users.dto.js';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import type { UserStatus } from './user.entity.js';
import { UsersRepository } from './users.repository.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findAll(filters: ListUsersDto) {
    return this.usersRepository.findAll(filters);
  }

  async findById(id: number, actor: AuthenticatedUser) {
    this.assertAdministratorOrOwner(actor, id);
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async create(data: CreateUserDto, actor: AuthenticatedUser) {
    this.assertAdministrator(actor);
    const profile = await this.usersRepository.findProfile(data.profileId);
    if (!profile) throw new NotFoundException('Perfil não encontrado.');
    if (profile.status !== 'ACTIVE') {
      throw new BadRequestException('Não é possível associar um perfil inativo.');
    }

    const email = data.email.trim().toLowerCase();
    if (await this.usersRepository.findEmailOwner(email)) {
      throw new ConflictException('Já existe um usuário com esse e-mail.');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const id = await this.usersRepository.create(data, email, passwordHash);

    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário criado não foi encontrado.');
    return user;
  }

  async update(id: number, data: UpdateUserDto, actor: AuthenticatedUser) {
    this.assertAdministratorWithPermissionOrOwner(actor, id, 'users:update');
    const current = await this.usersRepository.findById(id);
    if (!current) throw new NotFoundException('Usuário não encontrado.');
    if (data.name === undefined && data.email === undefined && data.profileId === undefined) {
      throw new BadRequestException('Informe ao menos um campo para atualizar.');
    }
    if (
      data.profileId !== undefined &&
      (actor.profile.role !== 'ADMIN' ||
        !actor.permissions.includes('users:update'))
    ) {
      throw new ForbiddenException('Você não pode alterar o perfil do usuário.');
    }

    const email = data.email?.trim().toLowerCase();
    if (email !== undefined && await this.usersRepository.findEmailOwner(email, id)) {
      throw new ConflictException('Já existe um usuário com esse e-mail.');
    }
    if (data.profileId !== undefined) {
      const profile = await this.usersRepository.findProfile(data.profileId);
      if (!profile) throw new NotFoundException('Perfil não encontrado.');
      if (profile.status !== 'ACTIVE') {
        throw new BadRequestException('Não é possível associar um perfil inativo.');
      }
    }

    const result = await this.usersRepository.updateUser(id, {
      name: data.name,
      email,
      profileId: data.profileId,
    });
    if (result === 'not_found') throw new NotFoundException('Usuário não encontrado.');
    if (result === 'last_admin') {
      throw new ConflictException('Não é possível remover o último ADMIN ativo.');
    }

    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async delete(id: number, actor: AuthenticatedUser): Promise<void> {
    this.assertAdministrator(actor);
    if (actor.id === id) {
      throw new ForbiddenException('Você não pode excluir o próprio usuário.');
    }
    const result = await this.usersRepository.softDelete(id);
    if (result === 'not_found') throw new NotFoundException('Usuário não encontrado.');
    if (result === 'last_admin') {
      throw new ConflictException('Não é possível excluir o último ADMIN ativo.');
    }
  }

  async updateStatus(id: number, status: UserStatus, actor: AuthenticatedUser) {
    this.assertAdministrator(actor);
    if (actor.id === id && status === 'INACTIVE') {
      throw new ForbiddenException('Você não pode inativar o próprio usuário.');
    }
    const result = await this.usersRepository.changeStatus(id, status);
    if (result === 'not_found') throw new NotFoundException('Usuário não encontrado.');
    if (result === 'last_admin') {
      throw new ConflictException('Não é possível inativar o último ADMIN ativo.');
    }
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async updatePassword(
    id: number,
    data: UpdateUserPasswordDto,
    actor: AuthenticatedUser,
  ): Promise<{ message: string }> {
    this.assertAdministratorWithPermissionOrOwner(actor, id, 'users:password');
    const passwordHash = await this.usersRepository.findPasswordHash(id);
    if (!passwordHash) throw new NotFoundException('Usuário não encontrado.');

    if (actor.id === id) {
      if (!data.currentPassword) {
        throw new BadRequestException('A senha atual é obrigatória.');
      }
      if (!(await bcrypt.compare(data.currentPassword, passwordHash))) {
        throw new BadRequestException('A senha atual está incorreta.');
      }
    }
    if (await bcrypt.compare(data.newPassword, passwordHash)) {
      throw new BadRequestException('A nova senha deve ser diferente da senha atual.');
    }

    const updated = await this.usersRepository.updatePassword(
      id,
      await bcrypt.hash(data.newPassword, 12),
    );
    if (!updated) throw new NotFoundException('Usuário não encontrado.');
    return { message: 'Senha atualizada com sucesso.' };
  }

  private assertAdministrator(actor: AuthenticatedUser): void {
    if (actor.profile.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas ADMIN pode executar esta operação.');
    }
  }

  private assertAdministratorOrOwner(actor: AuthenticatedUser, userId: number): void {
    if (actor.profile.role !== 'ADMIN' && actor.id !== userId) {
      throw new ForbiddenException('Você só pode acessar o próprio usuário.');
    }
  }

  private assertAdministratorWithPermissionOrOwner(
    actor: AuthenticatedUser,
    userId: number,
    permission: string,
  ): void {
    if (
      actor.id !== userId &&
      (actor.profile.role !== 'ADMIN' || !actor.permissions.includes(permission))
    ) {
      throw new ForbiddenException('Você não tem permissão para alterar este usuário.');
    }
  }
}
