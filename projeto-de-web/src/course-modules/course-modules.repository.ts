import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { ListModulesDto } from './dto/list-modules.dto.js';

@Injectable()
export class CourseModulesRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  findAll(filters: ListModulesDto) {
    const query = this.db('modules').whereNull('deletedAt');

    if (filters.courseId) query.where('courseId', filters.courseId);
    if (filters.status) query.where('status', filters.status);

    return query
      .select('*')
      .orderBy(['courseId', 'order'])
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  findById(id: number) {
    return this.db('modules').where('id', id).whereNull('deletedAt').first();
  }
}
