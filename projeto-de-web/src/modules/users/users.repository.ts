import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import type { UserRole, UserStatus } from '../auth/auth.types.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { ListUsersDto } from './dto/list-users.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  profile: { id: number; name: string; role: UserRole };
  createdAt: string;
  updatedAt: string;
}

interface UserQueryRow {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  profileId: number;
  profileName: string;
  profileRole: UserRole;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface UserPasswordHashRow {
  passwordHash: string;
}

interface UserSecurityRow {
  id: number;
  status: UserStatus;
  profileRole: UserRole;
  profileStatus: UserStatus;
}

@Injectable()
export class UsersRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  async findAll(filters: ListUsersDto) {
    const query = this.usersQuery(this.db);
    if (filters.status) query.where('u.status', filters.status);
    if (filters.profileId) query.where('u.profile_id', filters.profileId);

    const countRows = (await query.clone().count({ total: 'u.id' })) as unknown as Array<{
      total: number | string;
    }>;
    const total = Number(countRows[0]?.total ?? 0);

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

    const rows = (await query
      .select(
        'u.id as id',
        'u.name as name',
        'u.email as email',
        'u.status as status',
        'p.id as profileId',
        'p.name as profileName',
        'p.role as profileRole',
        'u.created_at as createdAt',
        'u.updated_at as updatedAt',
      )
      .orderBy(orderColumn, filters.order)
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit)) as unknown as UserQueryRow[];

    return {
      data: rows.map((row) => this.toUserResponse(row)),
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async findById(id: number): Promise<UserResponse | null> {
    const row = (await this.usersQuery(this.db)
      .where('u.id', id)
      .select(
        'u.id as id',
        'u.name as name',
        'u.email as email',
        'u.status as status',
        'p.id as profileId',
        'p.name as profileName',
        'p.role as profileRole',
        'u.created_at as createdAt',
        'u.updated_at as updatedAt',
      )
      .first()) as unknown as UserQueryRow | undefined;
    return row ? this.toUserResponse(row) : null;
  }

  async findEmailOwner(email: string, ignoreUserId?: number): Promise<number | null> {
    const query = this.db('users')
      .whereRaw('LOWER(email) = ?', [email.toLowerCase()])
      .whereNull('deleted_at');
    if (ignoreUserId !== undefined) query.whereNot('id', ignoreUserId);
    const row = (await query.first('id')) as { id: number } | undefined;
    return row?.id ?? null;
  }

  async findProfile(profileId: number): Promise<{
    id: number;
    status: UserStatus;
    role: UserRole;
  } | null> {
    const row = (await this.db('profiles')
      .where('id', profileId)
      .whereNull('deleted_at')
      .first('id', 'status', 'role')) as { id: number; status: UserStatus; role: UserRole } | undefined;
    return row ?? null;
  }

  async create(data: CreateUserDto, email: string, passwordHash: string): Promise<number> {
    const rows = (await this.db('users')
      .insert({
        name: data.name.trim(),
        email,
        password_hash: passwordHash,
        profile_id: data.profileId,
      })
      .returning('id')) as unknown as Array<{ id: number }>;
    return rows[0].id;
  }

  async updateUser(
    id: number,
    data: UpdateUserDto & { email?: string },
  ): Promise<'not_found' | 'last_admin' | 'updated'> {
    return this.db.transaction(async (transaction) => {
      const current = (await this.usersQuery(transaction)
        .where('u.id', id)
        .select(
          'u.id as id',
          'u.status as status',
          'p.role as profileRole',
          'p.status as profileStatus',
        )
        .forUpdate('u')
        .first()) as unknown as UserSecurityRow | undefined;
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
    const row = (await this.db('users')
      .where('id', id)
      .whereNull('deleted_at')
      .first('password_hash as passwordHash')) as
      | UserPasswordHashRow
      | undefined;
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
      const user = (await this.usersQuery(transaction)
        .where('u.id', id)
        .select(
          'u.id as id',
          'u.status as status',
          'p.role as profileRole',
          'p.status as profileStatus',
        )
        .forUpdate('u')
        .first()) as unknown as UserSecurityRow | undefined;
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
      const user = (await this.usersQuery(transaction)
        .where('u.id', id)
        .select(
          'u.id as id',
          'u.status as status',
          'p.role as profileRole',
          'p.status as profileStatus',
        )
        .forUpdate('u')
        .first()) as unknown as UserSecurityRow | undefined;
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

  private toUserResponse(row: UserQueryRow): UserResponse {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      status: row.status,
      profile: { id: row.profileId, name: row.profileName, role: row.profileRole },
      createdAt: this.toIsoString(row.createdAt),
      updatedAt: this.toIsoString(row.updatedAt),
    };
  }

  private toIsoString(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }

  private async lockAdminProfile(transaction: Knex.Transaction): Promise<void> {
    await transaction('profiles').where('role', 'ADMIN').forUpdate().first('id');
  }

  private async hasOtherActiveAdmins(
    transaction: Knex.Transaction,
    excludedUserId: number,
  ): Promise<boolean> {
    const rows = (await transaction('users as u')
      .innerJoin('profiles as p', 'p.id', 'u.profile_id')
      .where('p.role', 'ADMIN')
      .where('p.status', 'ACTIVE')
      .where('u.status', 'ACTIVE')
      .whereNull('u.deleted_at')
      .whereNull('p.deleted_at')
      .whereNot('u.id', excludedUserId)
      .count({ total: 'u.id' })) as unknown as Array<{ total: number | string }>;
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
