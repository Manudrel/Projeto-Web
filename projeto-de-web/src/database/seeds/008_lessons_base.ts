import type { Knex } from 'knex';
import { TypeLesson } from '../../modules/lessons/lessons.entity.js';


// UUIDs fixos de módulos de exemplo.
// Troque por IDs reais quando chegar em dev
const MODULE_1 = '11111111-1111-4111-8111-111111111111';
const MODULE_2 = '22222222-2222-4222-8222-222222222222';
const MODULE_3 = '33333333-3333-4333-8333-333333333333';

const lessons = [
  {
    id: 1,
    module_id: MODULE_1,
    title: 'Bem-vindo ao curso',
    content: 'https://example.com/videos/bem-vindo.mp4',
    type: TypeLesson.VIDEO,
  },
  {
    id: 2,
    module_id: MODULE_1,
    title: 'Como o NestJS organiza uma aplicação',
    content:
      '# Módulos, controllers e providers\n\nUm módulo agrupa controllers e providers relacionados...',
    type: TypeLesson.ARTICLE,
  },
  {
    id: 3,
    module_id: MODULE_1,
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
    type: TypeLesson.QUIZ,
  },
  {
    id: 4,
    module_id: MODULE_2,
    title: 'Criando tabelas com migrations',
    content: 'https://example.com/videos/migrations.mp4',
    type: TypeLesson.VIDEO,
  },
  {
    id: 5,
    module_id: MODULE_2,
    title: 'Índices e performance no PostgreSQL',
    content:
      '# Índices\n\nUm índice acelera leituras, mas tem custo em escrita e espaço...',
    type: TypeLesson.ARTICLE,
  },
  {
    id: 6,
    module_id: MODULE_3,
    title: 'Containers e imagens',
    content: 'https://example.com/videos/docker-intro.mp4',
    type: TypeLesson.VIDEO,
  },
  {
    id: 7,
    module_id: MODULE_3,
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
    type: TypeLesson.QUIZ,
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