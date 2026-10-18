import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { ListLessonsDto } from './dto/list-lessons.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { ListLessonProgressDto } from './dto/list-lesson-progress.dto.js';

@Injectable()
export class LessonsRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  findAll(
    filters: ListLessonsDto,
    visibility: {
      role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
      userId: number;
    },
  ) {
    const query = this.db('lessons')
      .join('modules', 'modules.id', 'lessons.module_id')
      .join('courses', 'courses.id', 'modules.course_id')
      .whereNull('lessons.deleted_at')
      .whereNull('modules.deleted_at')
      .whereNull('courses.deleted_at');

    if (visibility.role === 'INSTRUCTOR') {
      query.where('courses.instructor_id', visibility.userId);
    }

    if (visibility.role === 'STUDENT') {
      query
        .join('enrollments', 'enrollments.course_id', 'courses.id')
        .where('enrollments.user_id', visibility.userId)
        .whereIn('enrollments.status', ['ACTIVE', 'COMPLETED'])
        .whereNull('enrollments.deleted_at');
    }

    if (filters.moduleId) query.where('lessons.module_id', filters.moduleId);
    if (filters.type) query.where('lessons.type', filters.type);

    return query
      .distinct('lessons.*')
      .orderBy('lessons.id')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  hasProgressByLesson(lessonId: number) {
    return this.db('progress').where('lesson_id', lessonId).first('id');
  }

  findProgressByLesson(lessonId: number, filters: ListLessonProgressDto) {
    const query = this.db('progress')
      .join('enrollments', 'enrollments.id', 'progress.enrollment_id')
      .join('users', 'users.id', 'enrollments.user_id')
      .where('progress.lesson_id', lessonId)
      .whereNull('enrollments.deleted_at')
      .whereNull('users.deleted_at');

    if (filters.status) query.where('enrollments.status', filters.status);
    if (filters.completed !== undefined) {
      query.where('progress.completed', filters.completed);
    }

    return query
      .select(
        'progress.id',
        'users.id as user_id',
        'users.name as userName',
        'enrollments.id as enrollmentId',
        'enrollments.status',
        'progress.completed',
        'progress.completed_at as completedAt',
      )
      .orderBy('users.name')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  findById(id: number) {
    return this.db('lessons').where('id', id).whereNull('deleted_at').first();
  }

  findLessonAccessById(id: number) {
    return this.db('lessons')
      .join('modules', 'modules.id', 'lessons.module_id')
      .join('courses', 'courses.id', 'modules.course_id')
      .where('lessons.id', id)
      .whereNull('lessons.deleted_at')
      .whereNull('modules.deleted_at')
      .whereNull('courses.deleted_at')
      .select(
        'courses.instructor_id as instructorId',
        'courses.is_published as isPublished',
        'courses.id as courseId',
      )
      .first();
  }

  findModuleAccessById(id: number) {
    return this.db('modules')
      .join('courses', 'courses.id', 'modules.course_id')
      .where('modules.id', id)
      .whereNull('modules.deleted_at')
      .whereNull('courses.deleted_at')
      .select(
        'courses.instructor_id as instructorId',
        'courses.id as courseId',
      )
      .first();
  }

  findEnrollmentForCourse(courseId: number, userId: number) {
    return this.db('enrollments')
      .where('course_id', courseId)
      .where('user_id', userId)
      .whereIn('status', ['ACTIVE', 'COMPLETED'])
      .whereNull('deleted_at')
      .first('id');
  }

  findModuleById(id: number) {
    return this.db('modules').where('id', id).whereNull('deleted_at').first();
  }


  findByTitleAndModule(
    title: string,
    moduleId: number,
    ignoreLessonId?: number,
  ) {
    const query = this.db('lessons')
      .whereRaw('LOWER(title) = LOWER(?)', [title])
      .where('module_id', moduleId)
      .whereNull('deleted_at');

    if (ignoreLessonId) query.whereNot('id', ignoreLessonId);

    return query.first();
  }

  async create(data: CreateLessonDto) {
    const [lesson] = await this.db('lessons')
      .insert({
        module_id: data.moduleId,
        title: data.title,
        content: data.content,
        type: data.type,
      })
      .returning('*');

    return lesson;
  }

  async update(id: number, data: UpdateLessonDto) {
    const [lesson] = await this.db('lessons')
      .where('id', id)
      .whereNull('deleted_at')
      .update({
        module_id: data.moduleId,
        title: data.title,
        content: data.content,
        type: data.type,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return lesson;
  }

  async delete(id: number) {
    await this.db('lessons')
      .where('id', id)
      .update({ deleted_at: this.db.fn.now() });
  }
}
