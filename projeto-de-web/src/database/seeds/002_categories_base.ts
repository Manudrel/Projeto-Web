import type { Knex } from 'knex';

const categories = [
  {
    name: 'Programação',
    description: 'Cursos de lógica, linguagens de programação, frontend e backend',
    status: 'ACTIVE',
  },
  {
    name: 'DevOps',
    description: 'Cursos de infraestrutura, Docker, CI/CD e computação em nuvem',
    status: 'ACTIVE',
  },
  {
    name: 'Data Science',
    description: 'Cursos de análise de dados, machine learning e estatística',
    status: 'ACTIVE',
  },
];

export async function seed(knex: Knex): Promise<void> {
  for (const category of categories) {
    await knex('categories')
      .insert(category)
      .onConflict('name')
      .ignore();
  }
}
