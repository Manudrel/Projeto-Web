import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const hasEnrollments = await knex.schema.hasTable('enrollments');
  const hasLessons = await knex.schema.hasTable('lessons');

  if (!hasEnrollments || !hasLessons) return;

  const enrollment = await knex('enrollments')
    .where('status', 'ACTIVE')
    .first('id', 'course_id');

  if (!enrollment) return;

  const lessons = await knex('lessons')
    .join('modules', 'modules.id', 'lessons.module_id')
    .where('modules.course_id', enrollment.course_id)
    .select('lessons.id')
    .limit(2);

  for (const lesson of lessons) {
    const existing = await knex('progress')
      .where({ enrollment_id: enrollment.id, lesson_id: lesson.id })
      .first('id');

    if (existing) continue;

    await knex('progress').insert({
      enrollment_id: enrollment.id,
      lesson_id: lesson.id,
      completed: true,
      completed_at: knex.fn.now(),
    });
  }
}