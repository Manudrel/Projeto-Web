import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasEnrollments = await knex.schema.hasTable('enrollments');

  await knex.schema.createTable('assessment_attempts', (table) => {
    table.increments('id').primary();
    const enrollmentCol = table.integer('enrollment_id').notNullable();
    if (hasEnrollments) {
      enrollmentCol.references('id').inTable('enrollments').onDelete('CASCADE');
    }
    table
      .integer('assessment_id')
      .notNullable()
      .references('id')
      .inTable('assessments')
      .onDelete('CASCADE');
    table.decimal('score', 5, 2).notNullable();
    table.boolean('is_approved').notNullable().defaultTo(false);
    table.integer('attempt_number').notNullable();
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index(['assessment_id']);
    table.index(['enrollment_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('assessment_attempts');
}
