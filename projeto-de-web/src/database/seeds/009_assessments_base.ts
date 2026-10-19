import type { Knex } from 'knex';

const assessmentsData = [
  {
    courseTitle: 'NestJS do Zero',
    moduleTitle: 'Introdução ao NestJS',
    title: 'Quiz: Fundamentos do NestJS',
    type: 'MODULE',
    minScoreToPass: 70.0,
    maxAttempts: 3,
  },
  {
    courseTitle: 'NestJS do Zero',
    moduleTitle: 'Banco de Dados',
    title: 'Quiz: Knex e Migrations',
    type: 'MODULE',
    minScoreToPass: 70.0,
    maxAttempts: 3,
  },
  {
    courseTitle: 'NestJS do Zero',
    moduleTitle: null,
    title: 'Avaliação Final: NestJS do Zero',
    type: 'FINAL',
    minScoreToPass: 70.0,
    maxAttempts: 3,
  },
  {
    courseTitle: 'TypeScript Avançado',
    moduleTitle: 'Generics e Tipagem',
    title: 'Quiz: Generics e Tipagem Avançada',
    type: 'MODULE',
    minScoreToPass: 75.0,
    maxAttempts: 3,
  },
  {
    courseTitle: 'TypeScript Avançado',
    moduleTitle: null,
    title: 'Avaliação Final: TypeScript Avançado',
    type: 'FINAL',
    minScoreToPass: 80.0,
    maxAttempts: 3,
  },
];

export async function seed(knex: Knex): Promise<void> {
  const hasAssessments = await knex.schema.hasTable('assessments');
  if (!hasAssessments) return;

  for (const item of assessmentsData) {
    const course = await knex('courses')
      .where('title', item.courseTitle)
      .whereNull('deleted_at')
      .first('id');

    if (!course) continue;

    let moduleId: number | null = null;
    if (item.moduleTitle) {
      const moduleRecord = await knex('modules')
        .where('course_id', course.id)
        .where('title', item.moduleTitle)
        .whereNull('deleted_at')
        .first('id');

      if (moduleRecord) {
        moduleId = moduleRecord.id;
      }
    }

    const existing = await knex('assessments')
      .where('course_id', course.id)
      .where('title', item.title)
      .whereNull('deleted_at')
      .first('id');

    if (existing) continue;

    await knex('assessments').insert({
      course_id: course.id,
      module_id: moduleId,
      title: item.title,
      type: item.type,
      min_score_to_pass: item.minScoreToPass,
      max_attempts: item.maxAttempts,
    });
  }
}
