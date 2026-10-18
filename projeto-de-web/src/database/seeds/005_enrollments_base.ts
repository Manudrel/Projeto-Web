import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const student = await knex('users')
    .join('profiles', 'profiles.id', 'users.profile_id')
    .where('profiles.role', 'STUDENT')
    .where('users.status', 'ACTIVE')
    .whereNull('users.deleted_at')
    .orderBy('users.id')
    .first('users.id');

  if (!student) return;

  const courses = await knex('courses')
    .where('is_published', true)
    .whereNull('deleted_at')
    .orderBy('id')
    .select('id');

  if (courses.length === 0) return;

  await knex('enrollments')
    .insert(
      courses.map((course) => ({
        user_id: student.id,
        course_id: course.id,
        status: 'ACTIVE',
        progress: 0,
      })),
    )
    .onConflict(['user_id', 'course_id'])
    .ignore();
}
