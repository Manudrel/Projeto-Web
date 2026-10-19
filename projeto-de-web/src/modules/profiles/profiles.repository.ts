import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { CreateProfileDto } from './dto/create-profile.dto.js';
import { ListProfilesDto } from './dto/list-profiles.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ProfileRole, ProfileStatus, ProfileWithPermissions } from './profile.entity.js';

const profileColumns = [
  'id',
  'name',
  'role',
  'description',
  'status',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'deleted_at as deletedAt',
];

@Injectable()
export class ProfilesRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  async findAll(filters: ListProfilesDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const offset = (page - 1) * limit;

    const query = this.db('profiles').whereNull('deleted_at');

    if (filters.name) {
      query.whereRaw('LOWER(name) LIKE LOWER(?)', [`%${filters.name}%`]);
    }

    if (filters.role) {
      query.where('role', filters.role);
    }

    if (filters.status) {
      query.where('status', filters.status);
    }

    const sortColumnMap: Record<string, string> = {
      id: 'id',
      name: 'name',
      role: 'role',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    const sortColumn =
      (filters.sortBy && sortColumnMap[filters.sortBy]) || 'id';
    const sortDirection = filters.order === 'desc' ? 'desc' : 'asc';

    const countResult = await query
      .clone()
      .count<{ count: string | number }>('id as count')
      .first();

    const total = Number(countResult?.count ?? 0);

    const data = await query
      .select(profileColumns)
      .orderBy(sortColumn, sortDirection)
      .limit(limit)
      .offset(offset);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  findById(id: number) {
    return this.db('profiles')
      .where('id', id)
      .whereNull('deleted_at')
      .select(profileColumns)
      .first();
  }

  async findByIdWithPermissions(id: number): Promise<ProfileWithPermissions | null> {
    const profile = await this.findById(id);
    if (!profile) return null;

    const hasProfilePermissions = await this.db.schema.hasTable('profile_permissions');
    let permissions: string[] = [];

    if (hasProfilePermissions) {
      permissions = (await this.db('profile_permissions')
        .join('permissions', 'profile_permissions.permission_id', 'permissions.id')
        .where('profile_permissions.profile_id', id)
        .pluck('permissions.name')) as string[];
    }

    return {
      ...profile,
      permissions,
    };
  }

  findByRole(role: ProfileRole, ignoreId?: number) {
    const query = this.db('profiles')
      .where('role', role)
      .whereNull('deleted_at')
      .select(profileColumns);

    if (ignoreId) query.whereNot('id', ignoreId);

    return query.first();
  }

  findByName(name: string, ignoreId?: number) {
    const query = this.db('profiles')
      .whereRaw('LOWER(name) = LOWER(?)', [name])
      .whereNull('deleted_at')
      .select(profileColumns);

    if (ignoreId) query.whereNot('id', ignoreId);

    return query.first();
  }

  async countActiveAdminProfiles(ignoreId?: number): Promise<number> {
    const query = this.db('profiles')
      .where('role', ProfileRole.ADMIN)
      .where('status', ProfileStatus.ACTIVE)
      .whereNull('deleted_at');

    if (ignoreId) query.whereNot('id', ignoreId);

    const result = await query.count<{ count: string | number }>('id as count').first();
    return Number(result?.count ?? 0);
  }

  async countUsersByProfileId(profileId: number): Promise<number> {
    const hasUsersTable = await this.db.schema.hasTable('users');
    if (!hasUsersTable) return 0;

    const result = await this.db('users')
      .where('profile_id', profileId)
      .whereNull('deleted_at')
      .count<{ count: string | number }>('id as count')
      .first();

    return Number(result?.count ?? 0);
  }

  async findValidPermissionIds(permissionIds: number[]): Promise<number[]> {
    if (!permissionIds.length) return [];
    const hasPermissionsTable = await this.db.schema.hasTable('permissions');
    if (!hasPermissionsTable) return [];

    const rows = await this.db('permissions')
      .whereIn('id', permissionIds)
      .select('id');

    return rows.map((r) => Number(r.id));
  }

  async create(data: CreateProfileDto) {
    return this.db.transaction(async (trx) => {
      const [profile] = await trx('profiles')
        .insert({
          name: data.name,
          role: data.role,
          description: data.description,
          status: ProfileStatus.ACTIVE,
        })
        .returning(profileColumns);

      if (data.permissionIds && data.permissionIds.length > 0) {
        const hasProfilePermissions = await trx.schema.hasTable('profile_permissions');
        if (hasProfilePermissions) {
          const rows = data.permissionIds.map((permissionId) => ({
            profile_id: profile.id,
            permission_id: permissionId,
          }));
          await trx('profile_permissions').insert(rows);
        }
      }

      return profile;
    });
  }

  async update(id: number, data: UpdateProfileDto) {
    return this.db.transaction(async (trx) => {
      const updateData: Record<string, unknown> = {
        updated_at: trx.fn.now(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;

      const [updatedProfile] = await trx('profiles')
        .where('id', id)
        .update(updateData)
        .returning(profileColumns);

      if (data.permissionIds !== undefined) {
        const hasProfilePermissions = await trx.schema.hasTable('profile_permissions');
        if (hasProfilePermissions) {
          await trx('profile_permissions').where('profile_id', id).delete();

          if (data.permissionIds.length > 0) {
            const rows = data.permissionIds.map((permissionId) => ({
              profile_id: id,
              permission_id: permissionId,
            }));
            await trx('profile_permissions').insert(rows);
          }
        }
      }

      return updatedProfile;
    });
  }

  async delete(id: number) {
    await this.db('profiles')
      .where('id', id)
      .update({
        deleted_at: this.db.fn.now(),
        updated_at: this.db.fn.now(),
      });
  }
}