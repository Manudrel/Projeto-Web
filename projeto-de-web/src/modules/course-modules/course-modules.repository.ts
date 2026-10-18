import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { ListModulesDto } from './dto/list-modules.dto.js';
import { UpdateCourseModuleDto } from './dto/update-course-module.dto.js';
import { CreateCourseModuleDto } from './dto/create-course-module.dto.js';

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
  constructor(@Inject('KNEX') private readonly db: Knex) { }

  findAll(
    filters: ListModulesDto,
    visibility: {
      instructorId?: number;
      publishedOnly?: boolean;
      activeOnly?: boolean;
    } = {},
  ) {
    const query = this.db('modules').whereNull('deleted_at');

    if (filters.courseId) query.where('course_id', filters.courseId);
    if (filters.status) query.where('status', filters.status);
    if (visibility.instructorId !== undefined) {
      query.whereIn(
        'course_id',
        this.db('courses')
          .select('id')
          .where('instructor_id', visibility.instructorId)
          .whereNull('deleted_at'),
      );
    }
    if (visibility.publishedOnly) {
      query.whereIn(
        'course_id',
        this.db('courses')
          .select('id')
          .where('is_published', true)
          .whereNull('deleted_at'),
      );
    }
    if (visibility.activeOnly) query.where('status', 'ACTIVE');

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

  findCourseById(courseId: number) {
    return this.db('courses')
      .where('id', courseId)
      .whereNull('deleted_at')
      .select(
        'id',
        'instructor_id as instructorId',
        'is_published as isPublished',
      )
      .first();
  }

  async countByCourse(courseId: number) {
    const result = await this.db('modules')
      .where('course_id', courseId)
      .whereNull('deleted_at')
      .count<{ total: string }>('id as total')
      .first();

    return Number(result?.total ?? 0);
  }

  async create(courseId: number, data: CreateCourseModuleDto) {
    const order = await this.countByCourse(courseId) + 1;

    const [courseModule] = await this.db('modules')
      .insert({
        course_id: courseId,
        title: data.title,
        description: data.description,
        order,
        status: data.status,
      })
      .returning(moduleColumns);

    return courseModule;
  }


  async update(id: number, courseId: number, currentOrder: number, data: UpdateCourseModuleDto) {
    return this.db.transaction(async (trx) => {
      const newOrder = data.order;

      if (newOrder !== undefined && newOrder !== currentOrder) {
        await trx('modules').where('id', id).update({ order: 0 });

        if (newOrder < currentOrder) {
          await this.shiftOrders(trx, courseId, newOrder, currentOrder - 1, 1);
        } else {
          await this.shiftOrders(trx, courseId, currentOrder + 1, newOrder, -1);
        }
      }

      const [courseModule] = await trx('modules')
        .where('id', id)
        .update({
          title: data.title,
          description: data.description,
          order: newOrder ?? currentOrder,
          status: data.status,
          updated_at: trx.fn.now(),
        })
        .returning(moduleColumns);

      return courseModule;
    });
  }

  async delete(id: number, courseId: number, currentOrder: number) {
    await this.db.transaction(async (trx) => {
      await trx('modules')
        .where('id', id)
        .update({ deleted_at: trx.fn.now() });

      await this.shiftOrders(trx, courseId, currentOrder + 1, undefined, -1);
    });
  }

  private async shiftOrders(trx: Knex.Transaction, courseId: number, from: number, to: number | undefined, offset: number) {
    const affected = trx('modules')
      .where('course_id', courseId)
      .whereNull('deleted_at')
      .where('order', '>=', from);

    if (to !== undefined) affected.where('order', '<=', to);

    await affected.update({ order: trx.raw('-"order"') });

    await trx('modules')
      .where('course_id', courseId)
      .whereNull('deleted_at')
      .where('order', '<', 0)
      .update({ order: trx.raw('-"order" + ?', [offset]) });
  }
}
