import type { Knex } from 'knex';

const lessons = [
  {
    id: 1,
    module_id: 1,
    title: 'Bem-vindo ao curso',
    content: 'https://example.com/videos/bem-vindo.mp4',
    type: 'VIDEO',
  },
  {
    id: 2,
    module_id: 1,
    title: 'Como o NestJS organiza uma aplicação',
    content:
      '# Módulos, controllers e providers\n\nUm módulo agrupa controllers e providers relacionados...',
    type: 'ARTICLE',
  },
  {
    id: 3,
    module_id: 1,
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
    module_id: 1,
    title: 'Criando tabelas com migrations',
    content: 'https://example.com/videos/migrations.mp4',
    type: 'VIDEO',
  },
  {
    id: 5,
    module_id: 1,
    title: 'Índices e performance no PostgreSQL',
    content:
      '# Índices\n\nUm índice acelera leituras, mas tem custo em escrita e espaço...',
    type: 'ARTICLE',
  },
  {
    id: 6,
    module_id: 1,
    title: 'Containers e imagens',
    content: 'https://example.com/videos/docker-intro.mp4',
    type: 'VIDEO',
  },
  {
    id: 7,
    module_id: 1,
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
    await trx('lessons')
      .insert(lessons)
      .onConflict('id')
      .merge(['module_id', 'title', 'content', 'type']);

    await trx.raw(
      `SELECT setval(pg_get_serial_sequence('lessons', 'id'), (SELECT COALESCE(MAX(id), 1) FROM lessons))`,
    );
  });
}