import { BadRequestException, ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto.js';
import { ListProfilesDto } from './dto/list-profiles.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ProfileRole, ProfileStatus } from './profile.entity.js';
import { ProfilesRepository } from './profiles.repository.js';

@Injectable()
export class ProfilesService {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  findAll(filters: ListProfilesDto) {
    return this.profilesRepository.findAll(filters);
  }

  async findById(id: number) {
    const profile = await this.profilesRepository.findByIdWithPermissions(id);

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    return profile;
  }

  async create(data: CreateProfileDto) {
    const profileWithSameName = await this.profilesRepository.findByName(data.name);
    if (profileWithSameName) {
      throw new ConflictException('Já existe um perfil com esse nome');
    }

    const profileWithSameRole = await this.profilesRepository.findByRole(data.role);
    if (profileWithSameRole) {
      throw new ConflictException('Já existe um perfil cadastrado com este papel');
    }

    if (data.permissionIds && data.permissionIds.length > 0) {
      await this.validatePermissionIds(data.permissionIds);
    }

    const created = await this.profilesRepository.create(data);
    return this.findById(created.id);
  }

  async update(id: number, data: UpdateProfileDto) {
    const profile = await this.profilesRepository.findById(id);

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    if (data.name !== undefined && data.name !== profile.name) {
      const profileWithSameName = await this.profilesRepository.findByName(data.name, id);
      if (profileWithSameName) {
        throw new ConflictException('Já existe um perfil com esse nome');
      }
    }

    if (data.role !== undefined && data.role !== profile.role) {
      const profileWithSameRole = await this.profilesRepository.findByRole(data.role, id);
      if (profileWithSameRole) {
        throw new ConflictException('Já existe um perfil cadastrado com este papel');
      }
    }

    if (
      profile.role === ProfileRole.ADMIN &&
      profile.status === ProfileStatus.ACTIVE &&
      data.status === ProfileStatus.INACTIVE
    ) {
      const activeAdminCount = await this.profilesRepository.countActiveAdminProfiles(id);
      if (activeAdminCount <= 0) {
        throw new ConflictException('Não é possível inativar o último perfil de administrador ativo');
      }
    }

    if (data.permissionIds !== undefined && data.permissionIds.length > 0) {
      await this.validatePermissionIds(data.permissionIds);
    }

    await this.profilesRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    const profile = await this.profilesRepository.findById(id);

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    const usersCount = await this.profilesRepository.countUsersByProfileId(id);
    if (usersCount > 0) {
      throw new ConflictException('Não é possível excluir um perfil que possui usuários vinculados');
    }

    if (profile.role === ProfileRole.ADMIN && profile.status === ProfileStatus.ACTIVE) {
      const activeAdminCount = await this.profilesRepository.countActiveAdminProfiles(id);
      if (activeAdminCount <= 0) {
        throw new ConflictException('Não é possível excluir o último perfil de administrador ativo');
      }
    }

    await this.profilesRepository.delete(id);
  }

  private async validatePermissionIds(permissionIds: number[]) {
    const validIds = await this.profilesRepository.findValidPermissionIds(permissionIds);
    if (validIds.length !== permissionIds.length) {
      throw new BadRequestException('Uma ou mais permissões informadas não existem');
    }
  }
}

