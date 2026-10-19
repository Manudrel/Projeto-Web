import { ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { ListPermissionsDto } from './dto/list-permissions.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { PermissionsRepository } from './permissions.repository.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  findAll(filters: ListPermissionsDto) {
    return this.permissionsRepository.findAll(filters);
  }

  async findById(id: number) {
    const permission = await this.permissionsRepository.findById(id);

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    return permission;
  }

  async create(data: CreatePermissionDto) {
    const existing = await this.permissionsRepository.findByName(data.name);
    if (existing) {
      throw new ConflictException('Já existe uma permissão com esse nome');
    }

    return this.permissionsRepository.create(data);
  }

  async update(id: number, data: UpdatePermissionDto) {
    const permission = await this.permissionsRepository.findById(id);

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    if (data.name !== undefined && data.name !== permission.name) {
      const existingWithName = await this.permissionsRepository.findByName(
        data.name,
        id,
      );
      if (existingWithName) {
        throw new ConflictException('Já existe uma permissão com esse nome');
      }
    }

    return this.permissionsRepository.update(id, data);
  }

  async delete(id: number) {
    const permission = await this.permissionsRepository.findById(id);

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    const profilesCount =
      await this.permissionsRepository.countProfilesUsingPermission(id);
    if (profilesCount > 0) {
      throw new ConflictException(
        'Não é possível excluir uma permissão vinculada a algum perfil',
      );
    }

    await this.permissionsRepository.delete(id);
  }
}

