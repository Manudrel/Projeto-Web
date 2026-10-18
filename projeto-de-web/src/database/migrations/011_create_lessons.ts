import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('lessons', (table) => {
    table.increments('id').primary();
    table.integer('module_id').notNullable();
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table
      .enu('type', ['VIDEO', 'ARTICLE', 'QUIZ'], {
        useNative: true,
        enumName: 'lesson_type_enum',
      })
      .notNullable();
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();

    table.index('module_id', 'idx_lessons_module_id');
    table.index('type', 'idx_lessons_type');
    
    /**
     * 
        
        modules -> precisa esperar a tabela existir 
        table
        .foreign('module_id', 'fk_lessons_module')
        .references('id')
        .inTable('modules')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    */
});

  await knex.raw(
    `CREATE INDEX idx_lessons_module_active ON lessons (module_id) WHERE deleted_at IS NULL`,
  );

  await knex.raw(`
    CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);
  await knex.raw(`
    CREATE TRIGGER trg_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS trg_lessons_updated_at ON lessons');
  await knex.schema.dropTableIfExists('lessons');
  await knex.raw('DROP TYPE IF EXISTS lesson_type_enum');
}