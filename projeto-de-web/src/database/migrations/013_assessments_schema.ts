import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('assessments', (table) => {
    table.increments('id').primary();
    table
      .integer('course_id')
      .notNullable()
      .references('id')
      .inTable('courses')
      .onDelete('CASCADE');
    table
      .integer('module_id')
      .nullable()
      .references('id')
      .inTable('modules')
      .onDelete('SET NULL');
    table.string('title', 300).notNullable();
    table.string('type', 10).notNullable();
    table.decimal('min_score_to_pass', 5, 2).notNullable();
    table.integer('max_attempts').notNullable().defaultTo(3);
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();

    table.index(['course_id']);
    table.index(['module_id']);
    table.index(['type']);
    table.index(['deleted_at']);
  });

  await knex.raw(
    "ALTER TABLE assessments ADD CONSTRAINT assessments_type_check CHECK (type IN ('MODULE', 'FINAL'))",
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('assessments');
}
