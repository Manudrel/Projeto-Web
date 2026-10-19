import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { ListLessonsDto } from './dto/list-lessons.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { ListLessonProgressDto } from './dto/list-lesson-progress.dto.js';

@Injectable()
export class LessonsRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  async findAll(
    filters: ListLessonsDto,
    visibility: {
      role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
      userId: number;
    },
  ) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const query = this.db('lessons')
      .join('modules', 'modules.id', 'lessons.module_id')
      .join('courses', 'courses.id', 'modules.course_id')
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

    if (filters.moduleId !== undefined) {
      query.where('lessons.module_id', filters.moduleId);
    }
    if (filters.type) query.where('lessons.type', filters.type);

    const countResult = await query
      .clone()
      .countDistinct<{ total: string | number }>('lessons.id as total')
      .first();
    const total = Number(countResult?.total ?? 0);
    const data = await query
      .clone()
      .distinct('lessons.*')
      .orderBy('lessons.module_id')
      .orderBy('lessons.order')
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
    return this.db('lessons')
      .where('id', id)
      .select(
        'id',
        'module_id as moduleId',
        'order',
        'title',
        'content',
        'type',
        'created_at as createdAt',
        'updated_at as updatedAt',
      )
      .first();
  }

  findLessonAccessById(id: number) {
    return this.db('lessons')
      .join('modules', 'modules.id', 'lessons.module_id')
      .join('courses', 'courses.id', 'modules.course_id')
      .where('lessons.id', id)
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

  async countByModule(moduleId: number) {
    const result = await this.db('lessons')
      .where('module_id', moduleId)
      .count<{ total: string }>('id as total')
      .first();

    return Number(result?.total ?? 0);
  }

  findByTitleAndModule(
    title: string,
    moduleId: number,
    ignoreLessonId?: number,
  ) {
    const query = this.db('lessons')
      .whereRaw('LOWER(title) = LOWER(?)', [title])
      .where('module_id', moduleId);

    if (ignoreLessonId) query.whereNot('id', ignoreLessonId);

    return query.first();
  }

  async create(data: CreateLessonDto, order: number) {
    return this.db.transaction(async (trx) => {
      await this.shiftOrders(trx, data.moduleId, order, undefined, 1);

      const [lesson] = await trx('lessons')
        .insert({
          module_id: data.moduleId,
          order,
          title: data.title,
          content: data.content,
          type: data.type,
        })
        .returning([
          'id',
          'module_id as moduleId',
          'order',
          'title',
          'content',
          'type',
          'created_at as createdAt',
          'updated_at as updatedAt',
        ]);

      return lesson;
    });
  }

  async update(
    id: number,
    currentModuleId: number,
    currentOrder: number,
    targetModuleId: number,
    targetOrder: number,
    data: UpdateLessonDto,
  ) {
    return this.db.transaction(async (trx) => {
      const moduleChanged = targetModuleId !== currentModuleId;
      const orderChanged = targetOrder !== currentOrder;

      if (moduleChanged || orderChanged) {
        await trx('lessons').where('id', id).update({ order: 0 });

        if (moduleChanged) {
          await this.shiftOrders(
            trx,
            currentModuleId,
            currentOrder + 1,
            undefined,
            -1,
          );
          await this.shiftOrders(trx, targetModuleId, targetOrder, undefined, 1);
        } else if (targetOrder < currentOrder) {
          await this.shiftOrders(
            trx,
            currentModuleId,
            targetOrder,
            currentOrder - 1,
            1,
          );
        } else {
          await this.shiftOrders(
            trx,
            currentModuleId,
            currentOrder + 1,
            targetOrder,
            -1,
          );
        }
      }

      const changes: Record<string, unknown> = {
        order: targetOrder,
        updated_at: trx.fn.now(),
      };
      if (moduleChanged) changes.module_id = targetModuleId;
      if (data.title !== undefined) changes.title = data.title;
      if (data.content !== undefined) changes.content = data.content;
      if (data.type !== undefined) changes.type = data.type;

      const [lesson] = await trx('lessons')
        .where('id', id)
        .update(changes)
        .returning([
          'id',
          'module_id as moduleId',
          'order',
          'title',
          'content',
          'type',
          'created_at as createdAt',
          'updated_at as updatedAt',
        ]);

      return lesson;
    });
  }

  async delete(id: number, moduleId: number, order: number) {
    await this.db.transaction(async (trx) => {
      await trx('lessons').where('id', id).delete();

      await this.shiftOrders(trx, moduleId, order + 1, undefined, -1);
    });
  }

  private async shiftOrders(
    trx: Knex.Transaction,
    moduleId: number,
    from: number,
    to: number | undefined,
    offset: number,
  ) {
    const affected = trx('lessons')
      .where('module_id', moduleId)
      .where('order', '>=', from);

    if (to !== undefined) affected.where('order', '<=', to);

    await affected.update({ order: trx.raw('-"order"') });

    const shifted = trx('lessons')
      .where('module_id', moduleId)
      .where('order', '<', 0);

    if (to !== undefined) {
      shifted.where('order', '>=', -to).where('order', '<=', -from);
    }

    await shifted.update({ order: trx.raw('-"order" + ?', [offset]) });
  }
}
