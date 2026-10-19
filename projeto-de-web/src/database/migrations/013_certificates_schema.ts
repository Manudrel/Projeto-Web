import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('certificates', (table) => {
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
    table.string('code', 32).notNullable().unique();
    table.string('status', 10).notNullable().defaultTo('VALID');
    table
      .timestamp('issued_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index(['user_id', 'course_id']);
    table.index(['status']);
  });

  await knex.raw(
    "ALTER TABLE certificates ADD CONSTRAINT certificates_status_check CHECK (status IN ('VALID', 'REVOKED'))",
  );
  await knex.raw(
    "CREATE UNIQUE INDEX certificates_valid_user_course_unique ON certificates (user_id, course_id) WHERE status = 'VALID'",
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('certificates');
}
