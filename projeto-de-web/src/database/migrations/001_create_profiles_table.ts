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
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('profiles');
}
