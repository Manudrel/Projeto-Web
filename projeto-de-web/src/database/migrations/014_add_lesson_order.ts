import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasOrderColumn = await knex.schema.hasColumn('lessons', 'order');

  if (!hasOrderColumn) {
    await knex.schema.alterTable('lessons', (table) => {
      table.integer('order').nullable();
    });

    await knex.raw(`
      WITH ordered_lessons AS (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY module_id ORDER BY id) AS position
        FROM lessons
      )
      UPDATE lessons
      SET "order" = ordered_lessons.position
      FROM ordered_lessons
      WHERE lessons.id = ordered_lessons.id
    `);

    await knex.schema.alterTable('lessons', (table) => {
      table.integer('order').notNullable().alter();
    });
  }

  await knex.raw(
    'CREATE UNIQUE INDEX IF NOT EXISTS lessons_module_order_unique ON lessons (module_id, "order") WHERE deleted_at IS NULL',
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP INDEX IF EXISTS lessons_module_order_unique');

  const hasOrderColumn = await knex.schema.hasColumn('lessons', 'order');
  if (hasOrderColumn) {
    await knex.schema.alterTable('lessons', (table) => {
      table.dropColumn('order');
    });
  }
}
