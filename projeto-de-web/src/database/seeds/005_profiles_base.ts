import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('profiles')
    .insert([
      {
        name: 'Administrator',
        role: 'ADMIN',
        description: 'Acesso completo à plataforma',
        status: 'ACTIVE',
      },
      {
        name: 'Instructor',
        role: 'INSTRUCTOR',
        description: 'Gerencia cursos próprios',
        status: 'ACTIVE',
      },
      {
        name: 'Student',
        role: 'STUDENT',
        description: 'Estuda e acompanha o progresso dos cursos',
        status: 'ACTIVE',
      },
    ])
    .onConflict('role')
    .merge(['name', 'description', 'status']);
}
