import type { Knex } from 'knex';

interface IdRow {
  id: number;
}

export async function seed(knex: Knex): Promise<void> {
  const students = (await knex('users')
    .join('profiles', 'profiles.id', 'users.profile_id')
    .where('profiles.role', 'STUDENT')
    .where('users.status', 'ACTIVE')
    .whereNull('users.deleted_at')
    .orderBy('users.id')
    .limit(3)
    .select('users.id')) as IdRow[];

  const courses = (await knex('courses')
    .where('is_published', true)
    .whereNull('deleted_at')
    .orderBy('id')
    .select('id')) as IdRow[];

  for (const student of students) {
    for (const course of courses) {
      const existingOpenEnrollment = await knex('enrollments')
        .where('user_id', student.id)
        .where('course_id', course.id)
        .whereIn('status', ['ACTIVE', 'COMPLETED'])
        .whereNull('deleted_at')
        .first('id');

      if (existingOpenEnrollment) continue;

      await knex('enrollments').insert({
        user_id: student.id,
        course_id: course.id,
        status: 'ACTIVE',
        progress: 0,
      });
    }
  }
}
