
import type { Knex } from 'knex';

const enrollments = [
  {
    id: 1,
    user_id: 1,
    course_id: 1,
    status: 'ACTIVE',
    progress: 0,
  },
  {
    id: 2,
    user_id: 1,
    course_id: 2,
    status: 'COMPLETED',
    progress: 100,
  },
  {
    id: 3,
    user_id: 1,
    course_id: 4,
    status: 'CANCELLED',
    progress: 45,
  },
  
];

export async function seed(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    for (const enrollment of enrollments) {
      const existingById = await trx('enrollments')
        .where({ id: enrollment.id })
        .first();

      if (existingById) {
        await trx('enrollments')
          .where({ id: enrollment.id })
          .update({
            user_id: enrollment.user_id,
            course_id: enrollment.course_id,
            status: enrollment.status,
            progress: enrollment.progress,
            updated_at: trx.fn.now(),
          });

        continue;
      }

      const isOpenEnrollment =
        enrollment.status === 'ACTIVE' ||
        enrollment.status === 'COMPLETED';

      if (isOpenEnrollment) {
        const existingOpenEnrollment = await trx('enrollments')
          .where({
            user_id: enrollment.user_id,
            course_id: enrollment.course_id,
          })
          .whereIn('status', ['ACTIVE', 'COMPLETED'])
          .whereNull('deleted_at')
          .first();

        if (existingOpenEnrollment) {
          continue;
        }
      }

      await trx('enrollments').insert(enrollment);
    }

    await trx.raw(`
      SELECT setval(
        pg_get_serial_sequence('enrollments', 'id'),
        COALESCE((SELECT MAX(id) FROM enrollments), 1),
        EXISTS (SELECT 1 FROM enrollments)
      )
    `);
  });
}
