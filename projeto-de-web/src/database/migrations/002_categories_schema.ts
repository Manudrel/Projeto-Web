import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.string('name', 150).notNullable().unique();
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

    table.index(['status', 'deleted_at']);
  });

  await knex.raw(
    "ALTER TABLE categories ADD CONSTRAINT categories_status_check CHECK (status IN ('ACTIVE', 'INACTIVE'))",
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('categories');
}
