import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { ListLessonsDto } from './dto/list-lessons.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { ListLessonProgressDto } from './dto/list-lesson-progress.dto.js';

@Injectable()
export class LessonsRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  findAll(filters: ListLessonsDto) {
    const query = this.db('lessons').whereNull('deleted_at');

    if (filters.moduleId) query.where('module_id', filters.moduleId);
    if (filters.type) query.where('type', filters.type);

    return query
      .select('*')
      .orderBy('id')
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