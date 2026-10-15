import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('profiles', (table) => {
    table.increments('id').primary();
    table.string('name', 150).notNullable();
    table.string('role', 20).notNullable().unique();
    table.string('description', 200).notNullable();
    table.string('status', 10).notNullable().defaultTo('ACTIVE');
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();
  });
  await knex.raw(
    "ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('ADMIN', 'INSTRUCTOR', 'STUDENT'))",
  );
  await knex.raw(
    "ALTER TABLE profiles ADD CONSTRAINT profiles_status_check CHECK (status IN ('ACTIVE', 'INACTIVE'))",
  );

  await knex.schema.createTable('permissions', (table) => {
    table.increments('id').primary();
    table.string('name', 150).notNullable().unique();
    table.string('resource', 30).notNullable();
    table.string('description', 300).notNullable();
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });
  await knex.raw(
    "ALTER TABLE permissions ADD CONSTRAINT permissions_resource_check CHECK (resource IN ('USERS', 'PROFILES', 'PERMISSIONS', 'CATEGORIES', 'COURSES', 'MODULES', 'LESSONS', 'ENROLLMENTS', 'PROGRESS', 'ASSESSMENTS', 'CERTIFICATES'))",
  );

  await knex.schema.createTable('profile_permissions', (table) => {
    table
      .integer('profile_id')
      .notNullable()
      .references('id')
      .inTable('profiles')
      .onDelete('CASCADE');
    table
      .integer('permission_id')
      .notNullable()
      .references('id')
      .inTable('permissions')
      .onDelete('CASCADE');
    table.primary(['profile_id', 'permission_id']);
    table.index('permission_id');
  });

  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 150).notNullable();
    table.string('email', 200).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('status', 10).notNullable().defaultTo('ACTIVE');
    table
      .integer('profile_id')
      .notNullable()
      .references('id')
      .inTable('profiles')
      .onDelete('RESTRICT');
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.index(['status', 'profile_id']);
  });
  await knex.raw(
    "ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('ACTIVE', 'INACTIVE'))",
  );
  await knex.raw(
    'CREATE UNIQUE INDEX users_email_lower_unique ON users (LOWER(email))',
  );

  await knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('token_hash', 64).notNullable().unique();
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.timestamp('revoked_at', { useTz: true }).nullable();
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.index(['user_id', 'revoked_at']);
  });

  await knex.schema.createTable('password_reset_tokens', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('token_hash', 64).notNullable().unique();
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.timestamp('used_at', { useTz: true }).nullable();
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.index(['user_id', 'used_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('password_reset_tokens');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('profile_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('profiles');
}
