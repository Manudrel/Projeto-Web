import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { ListModulesDto } from './dto/list-modules.dto.js';

const moduleColumns = [
  'id',
  'course_id as courseId',
  'title',
  'description',
  'order',
  'status',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'deleted_at as deletedAt',
];

@Injectable()
export class CourseModulesRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  findAll(filters: ListModulesDto) {
    const query = this.db('modules').whereNull('deleted_at');

    if (filters.courseId) query.where('course_id', filters.courseId);
    if (filters.status) query.where('status', filters.status);

    return query
      .select(moduleColumns)
      .orderBy(['course_id', 'order'])
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  findById(id: number) {
    return this.db('modules')
      .where('id', id)
      .whereNull('deleted_at')
      .select(moduleColumns)
      .first();
  }
}
