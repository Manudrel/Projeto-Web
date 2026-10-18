import type { Knex } from 'knex';

const lessons = [
  {
    id: 1,
    courseTitle: 'NestJS do Zero',
    moduleTitle: 'Introdução ao NestJS',
    order: 1,
    title: 'Bem-vindo ao curso',
    content: 'https://example.com/videos/bem-vindo.mp4',
    type: 'VIDEO',
  },
  {
    id: 2,
    courseTitle: 'NestJS do Zero',
    moduleTitle: 'Introdução ao NestJS',
    order: 2,
    title: 'Como o NestJS organiza uma aplicação',
    content:
      '# Módulos, controllers e providers\n\nUm módulo agrupa controllers e providers relacionados...',
    type: 'ARTICLE',
  },
  {
    id: 3,
    courseTitle: 'NestJS do Zero',
    moduleTitle: 'Introdução ao NestJS',
    order: 3,
    title: 'Quiz: fundamentos do NestJS',
    content: JSON.stringify({
      questions: [
        {
          question: 'Qual decorator define um controller no NestJS?',
          options: ['@Injectable()', '@Controller()', '@Module()', '@Get()'],
          answer: 1,
        },
      ],
    }),
    type: 'QUIZ',
  },
  {
    id: 4,
    courseTitle: 'NestJS do Zero',
    moduleTitle: 'Banco de Dados',
    order: 1,
    title: 'Criando tabelas com migrations',
    content: 'https://example.com/videos/migrations.mp4',
    type: 'VIDEO',
  },
 
  {
    id: 5,
    courseTitle: 'Docker na Prática',
    moduleTitle: 'Fundamentos de Containers',
    order: 1,
    title: 'Containers e imagens',
    content: 'https://example.com/videos/docker-intro.mp4',
    type: 'VIDEO',
  },
  {
    id: 6,
    courseTitle: 'Docker na Prática',
    moduleTitle: 'Fundamentos de Containers',
    order: 2,
    title: 'Quiz: Docker básico',
    content: JSON.stringify({
      questions: [
        {
          question: 'Qual comando lista os containers em execução?',
          options: ['docker ps', 'docker images', 'docker run', 'docker rm'],
          answer: 0,
        },
      ],
    }),
    type: 'QUIZ',
  },
];

export async function seed(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    for (const lesson of lessons) {
      const module = await trx('modules')
        .join('courses', 'courses.id', 'modules.course_id')
        .where('courses.title', lesson.courseTitle)
        .where('modules.title', lesson.moduleTitle)
        .whereNull('courses.deleted_at')
        .whereNull('modules.deleted_at')
        .first('modules.id');

      if (!module) continue;

      await trx('lessons')
        .insert({
          id: lesson.id,
          module_id: module.id,
          order: lesson.order,
          title: lesson.title,
          content: lesson.content,
          type: lesson.type,
        })
        .onConflict('id')
        .merge(['module_id', 'order', 'title', 'content', 'type']);
    }

    await trx.raw(
      `SELECT setval(pg_get_serial_sequence('lessons', 'id'), (SELECT COALESCE(MAX(id), 1) FROM lessons))`,
    );
  });
}
