import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { ListUsersDto } from './dto/list-users.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { User, UserRole, UserStatus } from './user.entity.js';

@Injectable()
export class UsersRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  async findAll(filters: ListUsersDto): Promise<User[]> {
    const query = this.usersQuery(this.db);
    if (filters.status) query.where('u.status', filters.status);
    if (filters.profileId) query.where('u.profile_id', filters.profileId);

    let orderColumn = 'u.id';
    switch (filters.sortBy) {
      case 'name':
        orderColumn = 'u.name';
        break;
      case 'email':
        orderColumn = 'u.email';
        break;
      case 'status':
        orderColumn = 'u.status';
        break;
      case 'createdAt':
        orderColumn = 'u.created_at';
        break;
    }

    const rows = await query
      .select(
        'u.id',
        'u.name',
        'u.email',
        'u.status',
        'p.id as profileId',
        'p.name as profileName',
        'p.role as profileRole',
        'u.created_at as createdAt',
        'u.updated_at as updatedAt',
      )
      .orderBy(orderColumn, filters.order)
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      status: row.status,
      profile: {
        id: row.profileId,
        name: row.profileName,
        role: row.profileRole,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async findById(id: number): Promise<User | null> {
    const row = await this.usersQuery(this.db)
      .where('u.id', id)
      .select(
        'u.id',
        'u.name',
        'u.email',
        'u.status',
        'p.id as profileId',
        'p.name as profileName',
        'p.role as profileRole',
        'u.created_at as createdAt',
        'u.updated_at as updatedAt',
      )
      .first();
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      status: row.status,
      profile: {
        id: row.profileId,
        name: row.profileName,
        role: row.profileRole,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findEmailOwner(email: string, ignoreUserId?: number): Promise<number | null> {
    const query = this.db('users')
      .whereRaw('LOWER(email) = ?', [email.toLowerCase()])
      .whereNull('deleted_at');
    if (ignoreUserId !== undefined) query.whereNot('id', ignoreUserId);
    const row = await query.first('id');
    return row?.id ?? null;
  }

  async findProfile(profileId: number): Promise<{
    id: number;
    status: UserStatus;
    role: UserRole;
  } | null> {
    const row = await this.db('profiles')
      .where('id', profileId)
      .whereNull('deleted_at')
      .first('id', 'status', 'role');
    return row ?? null;
  }

  async create(data: CreateUserDto, email: string, passwordHash: string): Promise<number> {
    const rows = await this.db('users')
      .insert({
        name: data.name.trim(),
        email,
        password_hash: passwordHash,
        profile_id: data.profileId,
      })
      .returning('id');
    return rows[0].id;
  }

  async updateUser(
    id: number,
    data: UpdateUserDto & { email?: string },
  ): Promise<'not_found' | 'last_admin' | 'updated'> {
    return this.db.transaction(async (transaction) => {
      const current = await this.usersQuery(transaction)
        .where('u.id', id)
        .select(
          'u.id',
          'u.status',
          'p.role as profileRole',
          'p.status as profileStatus',
        )
        .forUpdate('u')
        .first();
      if (!current) return 'not_found';

      if (
        data.profileId !== undefined &&
        current.status === 'ACTIVE' &&
        current.profileRole === 'ADMIN' &&
        current.profileStatus === 'ACTIVE'
      ) {
        const targetProfile = await transaction('profiles')
          .where('id', data.profileId)
          .whereNull('deleted_at')
          .first('role');
        if (targetProfile?.role !== 'ADMIN') {
          await this.lockAdminProfile(transaction);
          if (!(await this.hasOtherActiveAdmins(transaction, id))) return 'last_admin';
        }
      }

      const updates: {
        name?: string;
        email?: string;
        profile_id?: number;
        updated_at: Knex.Raw;
      } = { updated_at: transaction.fn.now() };
      if (data.name !== undefined) updates.name = data.name.trim();
      if (data.email !== undefined) updates.email = data.email;
      if (data.profileId !== undefined) updates.profile_id = data.profileId;

      await transaction('users')
        .where('id', id)
        .whereNull('deleted_at')
        .update(updates);
      return 'updated';
    });
  }

  async findPasswordHash(id: number): Promise<string | null> {
    const row = await this.db('users')
      .where('id', id)
      .whereNull('deleted_at')
      .first('password_hash as passwordHash');
    return row?.passwordHash ?? null;
  }

  async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    return this.db.transaction(async (transaction) => {
      const user = await transaction('users')
        .where('id', id)
        .whereNull('deleted_at')
        .select('id')
        .forUpdate()
        .first();
      if (!user) return false;

      await transaction('users')
        .where('id', id)
        .update({ password_hash: passwordHash, updated_at: transaction.fn.now() });
      await this.revokeRefreshTokens(transaction, id);
      return true;
    });
  }

  async changeStatus(
    id: number,
    status: UserStatus,
  ): Promise<'not_found' | 'last_admin' | 'updated'> {
    return this.db.transaction(async (transaction) => {
      const user = await this.usersQuery(transaction)
        .where('u.id', id)
        .select(
          'u.id',
          'u.status',
          'p.role as profileRole',
          'p.status as profileStatus',
        )
        .forUpdate('u')
        .first();
      if (!user) return 'not_found';
      if (user.status === status) return 'updated';

      if (
        status === 'INACTIVE' &&
        user.status === 'ACTIVE' &&
        user.profileRole === 'ADMIN' &&
        user.profileStatus === 'ACTIVE'
      ) {
        await this.lockAdminProfile(transaction);
        if (!(await this.hasOtherActiveAdmins(transaction, id))) return 'last_admin';
      }

      await transaction('users')
        .where('id', id)
        .update({ status, updated_at: transaction.fn.now() });
      if (status === 'INACTIVE') await this.revokeRefreshTokens(transaction, id);
      return 'updated';
    });
  }

  async softDelete(id: number): Promise<'not_found' | 'last_admin' | 'deleted'> {
    return this.db.transaction(async (transaction) => {
      const user = await this.usersQuery(transaction)
        .where('u.id', id)
        .select(
          'u.id',
          'u.status',
          'p.role as profileRole',
          'p.status as profileStatus',
        )
        .forUpdate('u')
        .first();
      if (!user) return 'not_found';

      if (
        user.status === 'ACTIVE' &&
        user.profileRole === 'ADMIN' &&
        user.profileStatus === 'ACTIVE'
      ) {
        await this.lockAdminProfile(transaction);
        if (!(await this.hasOtherActiveAdmins(transaction, id))) return 'last_admin';
      }

      await transaction('users')
        .where('id', id)
        .update({ deleted_at: transaction.fn.now(), updated_at: transaction.fn.now() });
      await this.revokeRefreshTokens(transaction, id);
      return 'deleted';
    });
  }

  private usersQuery(db: Knex) {
    return db('users as u')
      .innerJoin('profiles as p', 'p.id', 'u.profile_id')
      .whereNull('u.deleted_at')
      .whereNull('p.deleted_at');
  }

  private async lockAdminProfile(transaction: Knex.Transaction): Promise<void> {
    await transaction('profiles').where('role', 'ADMIN').forUpdate().first('id');
  }

  private async hasOtherActiveAdmins(
    transaction: Knex.Transaction,
    excludedUserId: number,
  ): Promise<boolean> {
    const rows = await transaction('users as u')
      .innerJoin('profiles as p', 'p.id', 'u.profile_id')
      .where('p.role', 'ADMIN')
      .where('p.status', 'ACTIVE')
      .where('u.status', 'ACTIVE')
      .whereNull('u.deleted_at')
      .whereNull('p.deleted_at')
      .whereNot('u.id', excludedUserId)
      .count({ total: 'u.id' });
    return Number(rows[0]?.total ?? 0) > 0;
  }

  private async revokeRefreshTokens(
    transaction: Knex.Transaction,
    userId: number,
  ): Promise<void> {
    await transaction('refresh_tokens')
      .where('user_id', userId)
      .whereNull('revoked_at')
      .update({ revoked_at: transaction.fn.now() });
  }
}
