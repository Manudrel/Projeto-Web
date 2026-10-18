import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { ListPermissionsDto } from './dto/list-permissions.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';

const permissionColumns = [
  'id',
  'name',
  'resource',
  'description',
  'created_at as createdAt',
];

@Injectable()
export class PermissionsRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  async findAll(filters: ListPermissionsDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const offset = (page - 1) * limit;

    const query = this.db('permissions');

    if (filters.name) {
      query.whereRaw('LOWER(name) LIKE LOWER(?)', [`%${filters.name}%`]);
    }

    if (filters.resource) {
      query.where('resource', filters.resource);
    }

    const sortColumnMap: Record<string, string> = {
      id: 'id',
      name: 'name',
      resource: 'resource',
      createdAt: 'created_at',
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
      .select(permissionColumns)
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
    return this.db('permissions')
      .where('id', id)
      .select(permissionColumns)
      .first();
  }

  findByName(name: string, ignoreId?: number) {
    const query = this.db('permissions')
      .whereRaw('LOWER(name) = LOWER(?)', [name])
      .select(permissionColumns);

    if (ignoreId) query.whereNot('id', ignoreId);

    return query.first();
  }

  async countProfilesUsingPermission(permissionId: number): Promise<number> {
    const hasProfilePermissions = await this.db.schema.hasTable('profile_permissions');
    if (!hasProfilePermissions) return 0;

    const result = await this.db('profile_permissions')
      .where('permission_id', permissionId)
      .count<{ count: string | number }>('permission_id as count')
      .first();

    return Number(result?.count ?? 0);
  }

  async create(data: CreatePermissionDto) {
    const [permission] = await this.db('permissions')
      .insert({
        name: data.name,
        resource: data.resource,
        description: data.description,
      })
      .returning(permissionColumns);

    return permission;
  }

  async update(id: number, data: UpdatePermissionDto) {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.resource !== undefined) updateData.resource = data.resource;
    if (data.description !== undefined) updateData.description = data.description;

    const [permission] = await this.db('permissions')
      .where('id', id)
      .update(updateData)
      .returning(permissionColumns);

    return permission;
  }

  async delete(id: number) {
    await this.db('permissions').where('id', id).delete();
  }
}

