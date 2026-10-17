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
    const query = this.db('lessons').whereNull('deletedAt');

    if (filters.moduleId) query.where('moduleId', filters.moduleId);
    if (filters.type) query.where('type', filters.type);

    return query
      .select('*')
      .orderBy('id')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

    hasProgressByLesson(lessonId: number) {
    return this.db('progress').where('lessonId', lessonId).first('id');
  }

  findProgressByLesson(lessonId: number, filters: ListLessonProgressDto) {
    const query = this.db('progress')
      .join('enrollments', 'enrollments.id', 'progress.enrollmentId')
      .join('users', 'users.id', 'enrollments.userId')
      .where('progress.lessonId', lessonId)
      .whereNull('enrollments.deletedAt')
      .whereNull('users.deletedAt');

    if (filters.status) query.where('enrollments.status', filters.status);
    if (filters.completed !== undefined) {
      query.where('progress.completed', filters.completed);
    }

    return query
      .select(
        'progress.id',
        'users.id as userId',
        'users.name as userName',
        'enrollments.id as enrollmentId',
        'enrollments.status',
        'progress.completed',
        'progress.completedAt',
      )
      .orderBy('users.name')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  findById(id: number) {
    return this.db('lessons').where('id', id).whereNull('deletedAt').first();
  }

  findModuleById(id: number) {
    return this.db('modules').where('id', id).whereNull('deletedAt').first();
  }

  findByTitleAndModule(
    title: string,
    moduleId: number,
    ignoreLessonId?: number,
  ) {
    const query = this.db('lessons')
      .whereRaw('LOWER(title) = LOWER(?)', [title])
      .where('moduleId', moduleId)
      .whereNull('deletedAt');

    if (ignoreLessonId) query.whereNot('id', ignoreLessonId);

    return query.first();
  }

  async create(data: CreateLessonDto) {
    const [lesson] = await this.db('lessons')
      .insert({
        moduleId: data.moduleId,
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
      .whereNull('deletedAt')
      .update({
        moduleId: data.moduleId,
        title: data.title,
        content: data.content,
        type: data.type,
        updatedAt: this.db.fn.now(),
      })
      .returning('*');

    return lesson;
  }

  async delete(id: number) {
    await this.db('lessons')
      .where('id', id)
      .update({ deletedAt: this.db.fn.now() });
  }
}