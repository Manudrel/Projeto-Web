import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique');
  await knex.raw('DROP INDEX IF EXISTS users_email_lower_unique');
  await knex.raw(
    'CREATE UNIQUE INDEX users_email_lower_unique ON users (LOWER(email)) WHERE deleted_at IS NULL',
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP INDEX IF EXISTS users_email_lower_unique');
  await knex.raw('ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email)');
  await knex.raw('CREATE UNIQUE INDEX users_email_lower_unique ON users (LOWER(email))');
}
