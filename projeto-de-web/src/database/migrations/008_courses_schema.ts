import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('courses', (table) => {
    table.increments('id').primary();
    table.string('title', 150).notNullable();
    table.string('description', 200).notNullable();
    table
      .integer('category_id')
      .notNullable()
      .references('id')
      .inTable('categories');
    table
      .integer('instructor_id')
      .notNullable()
      .references('id')
      .inTable('users');
    table.string('level', 20).notNullable();
    table.boolean('is_published').notNullable().defaultTo(false);
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();

    table.index(['category_id', 'level']);
    table.index(['instructor_id']);
    table.index(['is_published', 'deleted_at']);
  });

  await knex.raw(
    "ALTER TABLE courses ADD CONSTRAINT courses_level_check CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED'))",
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('courses');
}
