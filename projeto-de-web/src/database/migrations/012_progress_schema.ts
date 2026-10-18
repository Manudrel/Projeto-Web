import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('progress', (table) => {
    table.increments('id').primary();
    table
      .integer('enrollment_id')
      .notNullable()
      .references('id')
      .inTable('enrollments')
      .onDelete('CASCADE');
    table
      .integer('lesson_id')
      .notNullable()
      .references('id')
      .inTable('lessons')
      .onDelete('CASCADE');
    table.boolean('completed').notNullable().defaultTo(false);
    table.timestamp('completed_at', { useTz: true }).nullable();
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.unique(['enrollment_id', 'lesson_id']);
    table.index(['enrollment_id']);
    table.index(['lesson_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('progress');
}