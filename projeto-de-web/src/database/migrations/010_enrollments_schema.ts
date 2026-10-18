import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('enrollments', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');
    table
      .integer('course_id')
      .notNullable()
      .references('id')
      .inTable('courses')
      .onDelete('RESTRICT');
    table.string('status', 10).notNullable().defaultTo('ACTIVE');
    table.decimal('progress', 5, 2).notNullable().defaultTo(0);
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();

    table.index(['user_id', 'status']);
    table.index(['course_id', 'status']);
    table.index(['deleted_at']);
  });

  await knex.raw(
    "ALTER TABLE enrollments ADD CONSTRAINT enrollments_status_check CHECK (status IN ('ACTIVE', 'CANCELLED', 'COMPLETED'))",
  );
  await knex.raw(
    'ALTER TABLE enrollments ADD CONSTRAINT enrollments_progress_check CHECK (progress >= 0 AND progress <= 100)',
  );
  await knex.raw(
    "CREATE UNIQUE INDEX enrollments_user_course_open_unique ON enrollments (user_id, course_id) WHERE status IN ('ACTIVE', 'COMPLETED') AND deleted_at IS NULL",
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('enrollments');
}