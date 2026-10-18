import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
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
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('permissions');
}
