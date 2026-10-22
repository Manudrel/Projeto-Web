import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { ListProgressDto } from './dto/list-progress.dto.js';

const progressColumns = [
  'progress.id',
  'progress.enrollment_id as enrollmentId',
  'progress.lesson_id as lessonId',
  'progress.completed',
  'progress.completed_at as completedAt',
  'progress.created_at as createdAt',
];

@Injectable()
export class ProgressRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) { }

  findAll(filters: ListProgressDto, instructorId?: number) {
    const query = this.db('progress')
      .join('enrollments', 'enrollments.id', 'progress.enrollment_id')
      .join('courses', 'courses.id', 'enrollments.course_id');

    if (filters.userId) query.where('enrollments.user_id', filters.userId);
    if (filters.courseId) query.where('enrollments.course_id', filters.courseId);
    if (instructorId) query.where('courses.instructor_id', instructorId);

    return query
      .select(progressColumns)
      .orderBy('progress.id', 'desc')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  findById(id: number) {
    return this.db('progress')
      .join('enrollments', 'enrollments.id', 'progress.enrollment_id')
      .join('courses', 'courses.id', 'enrollments.course_id')
      .where('progress.id', id)
      .select([
        ...progressColumns,
        'enrollments.user_id as userId',
        'enrollments.course_id as courseId',
        'enrollments.status as enrollmentStatus',
        'courses.instructor_id as instructorId',
      ])
      .first();
  }

  findEnrollmentById(id: number) {
    return this.db('enrollments')
      .where('id', id)
      .whereNull('deleted_at')
      .select('id', 'user_id as userId', 'course_id as courseId', 'status')
      .first();
  }

  findLessonCourseId(lessonId: number) {
    return this.db('lessons')
      .join('modules', 'modules.id', 'lessons.module_id')
      .where('lessons.id', lessonId)
      .select('modules.course_id as courseId')
      .first();
  }

  findByEnrollmentAndLesson(enrollmentId: number, lessonId: number) {
    return this.db('progress')
      .where({ enrollment_id: enrollmentId, lesson_id: lessonId })
      .select('id')
      .first();
  }

  create(enrollmentId: number, lessonId: number, courseId: number) {
    return this.db.transaction(async (trx) => {
      const [created] = await trx('progress')
        .insert({
          enrollment_id: enrollmentId,
          lesson_id: lessonId,
          completed: true,
          completed_at: trx.fn.now(),
        })
        .returning('id');

      await this.recalculate(trx, enrollmentId, courseId);

      return Number(created.id);
    });
  }

  update(id: number, enrollmentId: number, courseId: number, completed: boolean) {
    return this.db.transaction(async (trx) => {
      await trx('progress')
        .where('id', id)
        .update({ completed, completed_at: completed ? trx.fn.now() : null });

      await this.recalculate(trx, enrollmentId, courseId);
    });
  }

  private async recalculate(trx: Knex.Transaction, enrollmentId: number, courseId: number) {
    const totalRow = await trx('lessons')
      .join('modules', 'modules.id', 'lessons.module_id')
      .where('modules.course_id', courseId)
      .whereNull('modules.deleted_at')
      .count<{ total: string | number }>('lessons.id as total')
      .first();

    const doneRow = await trx('lessons')
      .join('modules', 'modules.id', 'lessons.module_id')
      .join('progress', 'progress.lesson_id', 'lessons.id')
      .where('modules.course_id', courseId)
      .whereNull('modules.deleted_at')
      .where('progress.enrollment_id', enrollmentId)
      .where('progress.completed', true)
      .count<{ total: string | number }>('lessons.id as total')
      .first();

    const total = Number(totalRow?.total ?? 0);
    const done = Number(doneRow?.total ?? 0);
    const isCompleted = total > 0 && done === total;
    const percentage = total > 0 ? Math.min(100, Number(((done / total) * 100).toFixed(2))) : 0;

    await trx('enrollments')
      .where('id', enrollmentId)
      .update({
        progress: percentage,
        status: isCompleted ? 'COMPLETED' : 'ACTIVE',
        updated_at: trx.fn.now(),
      });
  }
}
