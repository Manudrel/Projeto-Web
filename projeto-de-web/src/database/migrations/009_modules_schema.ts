import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('modules', (table) => {
    table.increments('id').primary();
    table
      .integer('course_id')
      .notNullable()
      .references('id')
      .inTable('courses');
    table.string('title', 200).notNullable();
    table.string('description', 300).notNullable();
    table.integer('order').notNullable();
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

    table.index(['course_id', 'order']);
    table.index(['status', 'deleted_at']);
  });

  await knex.raw(
    "ALTER TABLE modules ADD CONSTRAINT modules_status_check CHECK (status IN ('ACTIVE', 'INACTIVE'))",
  );

  await knex.raw(
    'CREATE UNIQUE INDEX modules_course_id_order_unique ON modules (course_id, "order") WHERE deleted_at IS NULL',
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('modules');
}
