import type { Knex } from 'knex';

type LessonSeed = {
  id: number;
  coursePrefix: 'NestJS' | 'Docker';
  moduleOrder: number;
  title: string;
  content: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ';
};

const lessons: LessonSeed[] = [
  {
    id: 1,
    coursePrefix: 'NestJS',
    moduleOrder: 1,
    title: 'Bem-vindo ao curso',
    content: 'https://example.com/videos/bem-vindo.mp4',
    type: 'VIDEO',
  },
  {
    id: 2,
    coursePrefix: 'NestJS',
    moduleOrder: 1,
    title: 'Como o NestJS organiza uma aplica\u00e7\u00e3o',
    content:
      '# M\u00f3dulos, controllers e providers\n\nUm m\u00f3dulo agrupa controllers e providers relacionados...',
    type: 'ARTICLE',
  },
  {
    id: 3,
    coursePrefix: 'NestJS',
    moduleOrder: 1,
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
    coursePrefix: 'NestJS',
    moduleOrder: 2,
    title: 'Criando tabelas com migrations',
    content: 'https://example.com/videos/migrations.mp4',
    type: 'VIDEO',
  },
  {
    id: 5,
    coursePrefix: 'NestJS',
    moduleOrder: 2,
    title: '\u00cdndices e performance no PostgreSQL',
    content:
      '# \u00cdndices\n\nUm \u00edndice acelera leituras, mas tem custo em escrita e espa\u00e7o...',
    type: 'ARTICLE',
  },
  {
    id: 6,
    coursePrefix: 'Docker',
    moduleOrder: 1,
    title: 'Containers e imagens',
    content: 'https://example.com/videos/docker-intro.mp4',
    type: 'VIDEO',
  },
  {
    id: 7,
    coursePrefix: 'Docker',
    moduleOrder: 1,
    title: 'Quiz: Docker b\u00e1sico',
    content: JSON.stringify({
      questions: [
        {
          question: 'Qual comando lista os containers em execu\u00e7\u00e3o?',
          options: ['docker ps', 'docker images', 'docker run', 'docker rm'],
          answer: 0,
        },
      ],
    }),
    type: 'QUIZ',
  },
];

export async function seed(knex: Knex): Promise<void> {
  const modules = await knex('modules')
    .join('courses', 'courses.id', 'modules.course_id')
    .whereNull('modules.deleted_at')
    .select('modules.id', 'modules.order', 'courses.title as courseTitle');

  const moduleIds = new Map<string, number>();
  for (const module of modules) {
    const coursePrefix = module.courseTitle.startsWith('NestJS')
      ? 'NestJS'
      : module.courseTitle.startsWith('Docker')
        ? 'Docker'
        : undefined;

    if (coursePrefix) {
      moduleIds.set(`${coursePrefix}:${module.order}`, Number(module.id));
    }
  }

  const lessonRows = lessons.map(({ coursePrefix, moduleOrder, ...lesson }) => {
    const moduleId = moduleIds.get(`${coursePrefix}:${moduleOrder}`);

    if (moduleId === undefined) {
      throw new Error(
        `Module ${moduleOrder} for course prefix "${coursePrefix}" was not found. Run the module seed first.`,
      );
    }

    return { ...lesson, module_id: moduleId, status: 'ACTIVE' };
  });

  await knex.transaction(async (trx) => {
    await trx('lessons')
      .insert(lessonRows)
      .onConflict('id')
      .merge(['module_id', 'title', 'content', 'type', 'status']);

    await trx.raw(
      `SELECT setval(pg_get_serial_sequence('lessons', 'id'), (SELECT COALESCE(MAX(id), 1) FROM lessons))`,
    );
  });
}
