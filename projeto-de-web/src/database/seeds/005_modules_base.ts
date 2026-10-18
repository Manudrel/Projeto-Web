import type { Knex } from 'knex';

const courseModulesData = [
  {
    courseTitle: 'NestJS do Zero',
    modules: [
      {
        title: 'Introdução ao NestJS',
        description: 'Conceitos básicos, controllers, services e injeção de dependências',
        order: 1,
        status: 'ACTIVE',
      },
      {
        title: 'Banco de Dados',
        description: 'Integração com Knex, migrations e queries',
        order: 2,
        status: 'ACTIVE',
      },
      {
        title: 'Autenticação',
        description: 'Autenticação JWT e proteção de rotas com Guards',
        order: 3,
        status: 'ACTIVE',
      },
    ],
  },
  {
    courseTitle: 'TypeScript Avançado',
    modules: [
      {
        title: 'Generics e Tipagem',
        description: 'Generics e utility types sla',
        order: 1,
        status: 'ACTIVE',
      },
      {
        title: 'Decorators',
        description: 'Decorators e reflect-metadata',
        order: 2,
        status: 'ACTIVE',
      },
    ],
  },
  {
    courseTitle: 'Docker na Prática',
    modules: [
      {
        title: 'Fundamentos de Containers',
        description: 'Comandos básicos, Dockerfile e build de imagens',
        order: 1,
        status: 'ACTIVE',
      },
      {
        title: 'Docker Compose',
        description: 'Compose multi-container, volumes e redes',
        order: 2,
        status: 'ACTIVE',
      },
    ],
  },
  {
    courseTitle: 'Introdução à Análise de Dados',
    modules: [
      {
        title: 'Fundamentos de Estatística',
        description: 'Estatística básica, médias e desvio padrão',
        order: 1,
        status: 'ACTIVE',
      },
      {
        title: 'Visualização de Dados',
        description: 'Gráficos e dashboards simples',
        order: 2,
        status: 'ACTIVE',
      },
    ],
  },
];

export async function seed(knex: Knex): Promise<void> {
  for (const group of courseModulesData) {
    const course = await knex('courses')
      .where('title', group.courseTitle)
      .whereNull('deleted_at')
      .first('id');

    if (!course) {
      continue;
    }

    for (const mod of group.modules) {
      const existing = await knex('modules')
        .where('course_id', course.id)
        .where('order', mod.order)
        .whereNull('deleted_at')
        .first('id');

      if (existing) continue;

      await knex('modules').insert({
        course_id: course.id,
        title: mod.title,
        description: mod.description,
        order: mod.order,
        status: mod.status,
      });
    }
  }
}
