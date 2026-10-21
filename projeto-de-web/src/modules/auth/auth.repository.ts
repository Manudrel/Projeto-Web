import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import type { AuthAccount } from './auth.types.js';

@Injectable()
export class AuthRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  async emailExists(email: string): Promise<boolean> {
    const user = await this.db('users')
      .whereRaw('LOWER(email) = ?', [email.toLowerCase()])
      .whereNull('deleted_at')
      .first('id');
    return Boolean(user);
  }

  async findAccountByEmail(email: string): Promise<AuthAccount | null> {
    const result = await this.db('users as u')
      .innerJoin('profiles as p', 'p.id', 'u.profile_id')
      .leftJoin('profile_permissions as pp', 'pp.profile_id', 'p.id')
      .leftJoin('permissions as perm', 'perm.id', 'pp.permission_id')
      .whereRaw('LOWER(u.email) = ?', [email.toLowerCase()])
      .whereNull('u.deleted_at')
      .whereNull('p.deleted_at')
      .where('p.status', 'ACTIVE')
      .select(
        'u.id',
        'u.name',
        'u.email',
        'u.password_hash',
        'u.status',
        'p.id as profile_id',
        'p.name as profile_name',
        'p.role',
        'perm.name as permission_name',
      );

    const row = result[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      status: row.status,
      profile: {
        id: row.profile_id,
        name: row.profile_name,
        role: row.role,
      },
      permissions: [
        ...new Set(result.flatMap((item) => item.permission_name ?? [])),
      ],
    };
  }

  async findAccountById(id: number): Promise<AuthAccount | null> {
    const result = await this.db('users as u')
      .innerJoin('profiles as p', 'p.id', 'u.profile_id')
      .leftJoin('profile_permissions as pp', 'pp.profile_id', 'p.id')
      .leftJoin('permissions as perm', 'perm.id', 'pp.permission_id')
      .where('u.id', id)
      .whereNull('u.deleted_at')
      .whereNull('p.deleted_at')
      .where('p.status', 'ACTIVE')
      .select(
        'u.id',
        'u.name',
        'u.email',
        'u.password_hash',
        'u.status',
        'p.id as profile_id',
        'p.name as profile_name',
        'p.role',
        'perm.name as permission_name',
      );

    const row = result[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      status: row.status,
      profile: {
        id: row.profile_id,
        name: row.profile_name,
        role: row.role,
      },
      permissions: [
        ...new Set(result.flatMap((item) => item.permission_name ?? [])),
      ],
    };
  }

  async createStudentUser(
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<number | null> {
    return this.db.transaction(async (transaction) => {
      const profile = await transaction('profiles')
        .where('role', 'STUDENT')
        .where('status', 'ACTIVE')
        .whereNull('deleted_at')
        .first('id');

      if (!profile) return null;

      const [user] = await transaction('users')
        .insert({
          name,
          email,
          password_hash: passwordHash,
          status: 'ACTIVE',
          profile_id: profile.id,
        })
        .returning('id');
      return user.id;
    });
  }

  async saveRefreshToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.db('refresh_tokens').insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
  }

  async rotateRefreshToken(
    userId: number,
    currentHash: string,
    nextHash: string,
    nextExpiresAt: Date,
  ): Promise<boolean> {
    return this.db.transaction(async (transaction) => {
      const current = await transaction('refresh_tokens as rt')
        .join('users as u', 'u.id', 'rt.user_id')
        .where('rt.user_id', userId)
        .where('rt.token_hash', currentHash)
        .whereNull('rt.revoked_at')
        .where('rt.expires_at', '>', transaction.fn.now())
        .where('u.status', 'ACTIVE')
        .whereNull('u.deleted_at')
        .select('rt.id', 'rt.user_id')
        .forUpdate()
        .first();

      if (!current) return false;

      const revokedCount = await transaction('refresh_tokens')
        .where('id', current.id)
        .whereNull('revoked_at')
        .update({ revoked_at: transaction.fn.now() });

      if (revokedCount !== 1) return false;

      await transaction('refresh_tokens').insert({
        user_id: userId,
        token_hash: nextHash,
        expires_at: nextExpiresAt,
      });

      return true;
    });
  }

  async revokeRefreshToken(userId: number, tokenHash: string): Promise<void> {
    await this.db('refresh_tokens')
      .where('user_id', userId)
      .where('token_hash', tokenHash)
      .whereNull('revoked_at')
      .update({ revoked_at: this.db.fn.now() });
  }

  async createPasswordResetToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.db('password_reset_tokens').insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
  }

  async resetPassword(
    tokenHash: string,
    passwordHash: string,
  ): Promise<boolean> {
    return this.db.transaction(async (transaction) => {
      const token = await transaction('password_reset_tokens')
        .where('token_hash', tokenHash)
        .whereNull('used_at')
        .where('expires_at', '>', transaction.fn.now())
        .select('id', 'user_id')
        .forUpdate()
        .first();

      if (!token) return false;

      const [user] = await transaction('users')
        .where('id', token.user_id)
        .where('status', 'ACTIVE')
        .whereNull('deleted_at')
        .update({
          password_hash: passwordHash,
          updated_at: transaction.fn.now(),
        })
        .returning('id');

      if (!user) return false;

      await transaction('password_reset_tokens')
        .where('id', token.id)
        .update({ used_at: transaction.fn.now() });

      await transaction('refresh_tokens')
        .where('user_id', token.user_id)
        .whereNull('revoked_at')
        .update({ revoked_at: transaction.fn.now() });

      return true;
    });
  }
}
