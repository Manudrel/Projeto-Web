import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { ListCourseModulesDto } from './dto/list-course-modules.dto.js';
import { ListCourseProgressDto } from './dto/list-course-progress.dto.js';
import { ListCourseStudentsDto } from './dto/list-course-students.dto.js';
import { ListCoursesDto } from './dto/list-courses.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';

const courseColumns = [
  'id',
  'title',
  'description',
  'category_id as categoryId',
  'instructor_id as instructorId',
  'level',
  'is_published as isPublished',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'deleted_at as deletedAt',
];

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
export class CoursesRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  findAll(filters: ListCoursesDto) {
    const query = this.db('courses').whereNull('deleted_at');

    if (filters.categoryId) query.where('category_id', filters.categoryId);
    if (filters.level) query.where('level', filters.level);

    return query
      .select(courseColumns)
      .orderBy('id')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  findById(id: number) {
    return this.db('courses')
      .where('id', id)
      .whereNull('deleted_at')
      .select(courseColumns)
      .first();
  }

  findCategoryById(id: number) {
    return this.db('categories')
      .where('id', id)
      .whereNull('deleted_at')
      .first();
  }

  findUserWithRole(id: number) {
    return this.db('users')
      .join('profiles', 'profiles.id', 'users.profile_id')
      .where('users.id', id)
      .whereNull('users.deleted_at')
      .first('users.id', 'users.status', 'profiles.role');
  }

  findByTitleAndCategory(
    title: string,
    categoryId: number,
    ignoreCourseId?: number,
  ) {
    const query = this.db('courses')
      .whereRaw('LOWER(title) = LOWER(?)', [title])
      .where('category_id', categoryId)
      .whereNull('deleted_at')
      .select(courseColumns);

    if (ignoreCourseId) query.whereNot('id', ignoreCourseId);

    return query.first();
  }

  async create(data: CreateCourseDto) {
    const [course] = await this.db('courses')
      .insert({
        title: data.title,
        description: data.description,
        category_id: data.categoryId,
        instructor_id: data.instructorId,
        level: data.level,
      })
      .returning(courseColumns);

    return course;
  }

  async update(id: number, data: UpdateCourseDto) {
    const [course] = await this.db('courses')
      .where('id', id)
      .update({
        title: data.title,
        description: data.description,
        category_id: data.categoryId,
        instructor_id: data.instructorId,
        level: data.level,
        updated_at: this.db.fn.now(),
      })
      .returning(courseColumns);

    return course;
  }

  findActiveEnrollmentByCourse(courseId: number) {
    return this.db('enrollments')
      .where('course_id', courseId)
      .where('status', 'ACTIVE')
      .whereNull('deleted_at')
      .first();
  }

  async delete(id: number) {
    await this.db.transaction(async (trx) => {
      const moduleIds = trx('modules').where('course_id', id).select('id');

      await trx('lessons')
        .whereIn('module_id', moduleIds)
        .whereNull('deleted_at')
        .update({ deleted_at: trx.fn.now() });

      await trx('modules')
        .where('course_id', id)
        .whereNull('deleted_at')
        .update({ deleted_at: trx.fn.now() });

      await trx('courses').where('id', id).update({ deleted_at: trx.fn.now() });
    });
  }

  findActiveLessonByCourse(courseId: number) {
    return this.db('lessons')
      .join('modules', 'modules.id', 'lessons.module_id')
      .where('modules.course_id', courseId)
      .where('modules.status', 'ACTIVE')
      .where('lessons.status', 'ACTIVE')
      .whereNull('modules.deleted_at')
      .whereNull('lessons.deleted_at')
      .first('lessons.id');
  }

  async publish(id: number) {
    const [course] = await this.db('courses')
      .where('id', id)
      .update({ is_published: true, updated_at: this.db.fn.now() })
      .returning(courseColumns);

    return course;
  }

  async unpublish(id: number) {
    const [course] = await this.db('courses')
      .where('id', id)
      .update({ is_published: false, updated_at: this.db.fn.now() })
      .returning(courseColumns);

    return course;
  }

  findModulesByCourse(courseId: number, filters: ListCourseModulesDto) {
    const query = this.db('modules')
      .where('course_id', courseId)
      .whereNull('deleted_at');

    if (filters.status) query.where('status', filters.status);
    if (filters.order) query.where('order', filters.order);

    return query
      .select(moduleColumns)
      .orderBy('order')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  findStudentsByCourse(courseId: number, filters: ListCourseStudentsDto) {
    const query = this.db('enrollments')
      .join('users', 'users.id', 'enrollments.user_id')
      .where('enrollments.course_id', courseId)
      .whereNull('enrollments.deleted_at')
      .whereNull('users.deleted_at');

    if (filters.status) query.where('enrollments.status', filters.status);
    if (filters.progress !== undefined) {
      query.where('enrollments.progress', '>=', filters.progress);
    }

    return query
      .select(
        'users.id',
        'users.name',
        'users.email',
        'enrollments.id as enrollmentId',
        'enrollments.status',
        'enrollments.progress',
        'enrollments.created_at as enrolledAt',
      )
      .orderBy('users.name')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  findProgressByCourse(courseId: number, filters: ListCourseProgressDto) {
    const query = this.db('progress')
      .join('enrollments', 'enrollments.id', 'progress.enrollment_id')
      .join('users', 'users.id', 'enrollments.user_id')
      .join('lessons', 'lessons.id', 'progress.lesson_id')
      .where('enrollments.course_id', courseId)
      .whereNull('enrollments.deleted_at')
      .whereNull('users.deleted_at')
      .whereNull('lessons.deleted_at');

    if (filters.status) query.where('enrollments.status', filters.status);
    if (filters.completed !== undefined) {
      query.where('progress.completed', filters.completed);
    }

    return query
      .select(
        'progress.id',
        'users.id as userId',
        'users.name as userName',
        'enrollments.status',
        'lessons.id as lessonId',
        'lessons.title as lessonTitle',
        'progress.completed',
        'progress.completed_at as completedAt',
      )
      .orderBy(['users.name', 'lessons.id'])
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }
}
