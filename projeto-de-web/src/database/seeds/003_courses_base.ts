import type { Knex } from 'knex';

const courses = [
  {
    title: 'NestJS do Zero',
    description:
      'Construa APIs REST com NestJS, TypeScript e arquitetura em camadas',
    category: 'Programação',
    level: 'BEGINNER',
    is_published: true,
  },
  {
    title: 'TypeScript Avançado',
    description:
      'Tipos genéricos, decorators e boas práticas em projetos grandes',
    category: 'Programação',
    level: 'ADVANCED',
    is_published: false,
  },
  {
    title: 'Docker na Prática',
    description:
      'Containers, imagens e docker-compose para ambientes de desenvolvimento',
    category: 'DevOps',
    level: 'INTERMEDIATE',
    is_published: true,
  },
  {
    title: 'CI/CD com GitHub Actions',
    description: 'Automatize testes e deploys com pipelines no GitHub',
    category: 'DevOps',
    level: 'INTERMEDIATE',
    is_published: false,
  },
  {
    title: 'Introdução à Análise de Dados',
    description:
      'Primeiros passos com estatística, planilhas e visualização de dados',
    category: 'Data Science',
    level: 'BEGINNER',
    is_published: true,
  },
];

export async function seed(knex: Knex): Promise<void> {
  const instructor =
    (await findUserByRole(knex, 'INSTRUCTOR')) ??
    (await findUserByRole(knex, 'ADMIN'));

  if (!instructor) {
    throw new Error(
      'Nenhum usuário INSTRUCTOR ou ADMIN encontrado para os cursos.',
    );
  }

  for (const course of courses) {
    const category = await knex('categories')
      .where('name', course.category)
      .first('id');

    if (!category) {
      throw new Error(`Categoria "${course.category}" não encontrada.`);
    }

    const existingCourse = await knex('courses')
      .where('title', course.title)
      .where('category_id', category.id)
      .first('id');

    if (existingCourse) continue;

    await knex('courses').insert({
      title: course.title,
      description: course.description,
      category_id: category.id,
      instructor_id: instructor.id,
      level: course.level,
      is_published: course.is_published,
    });
  }
}

function findUserByRole(knex: Knex, role: string) {
  return knex('users')
    .join('profiles', 'profiles.id', 'users.profile_id')
    .where('profiles.role', role)
    .whereNull('users.deleted_at')
    .orderBy('users.id')
    .first('users.id');
}
