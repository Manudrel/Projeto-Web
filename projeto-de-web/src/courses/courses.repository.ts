import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { ListCourseModulesDto } from './dto/list-course-modules.dto.js';
import { ListCourseProgressDto } from './dto/list-course-progress.dto.js';
import { ListCourseStudentsDto } from './dto/list-course-students.dto.js';
import { ListCoursesDto } from './dto/list-courses.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';

@Injectable()
export class CoursesRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  findAll(filters: ListCoursesDto) {
    const query = this.db('courses').whereNull('deletedAt');

    if (filters.categoryId) query.where('categoryId', filters.categoryId);
    if (filters.level) query.where('level', filters.level);

    return query
      .select('*')
      .orderBy('id')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  findById(id: number) {
    return this.db('courses').where('id', id).whereNull('deletedAt').first();
  }

  findCategoryById(id: number) {
    return this.db('categories').where('id', id).first();
  }

  findByTitleAndCategory(
    title: string,
    categoryId: number,
    ignoreCourseId?: number,
  ) {
    const query = this.db('courses')
      .whereRaw('LOWER(title) = LOWER(?)', [title])
      .where('categoryId', categoryId)
      .whereNull('deletedAt');

    if (ignoreCourseId) query.whereNot('id', ignoreCourseId);

    return query.first();
  }

  async create(data: CreateCourseDto) {
    const [course] = await this.db('courses')
      .insert({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        instructorId: data.instructorId,
        level: data.level,
      })
      .returning('*');

    return course;
  }

  async update(id: number, data: UpdateCourseDto) {
    const [course] = await this.db('courses')
      .where('id', id)
      .update({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        instructorId: data.instructorId,
        level: data.level,
        updatedAt: this.db.fn.now(),
      })
      .returning('*');

    return course;
  }

  findActiveEnrollmentByCourse(courseId: number) {
    return this.db('enrollments')
      .where('courseId', courseId)
      .where('status', 'ACTIVE')
      .whereNull('deletedAt')
      .first();
  }

  async delete(id: number) {
    await this.db('courses')
      .where('id', id)
      .update({ deletedAt: this.db.fn.now() });
  }

  findLessonByCourse(courseId: number) {
    return this.db('lessons')
      .join('modules', 'modules.id', 'lessons.moduleId')
      .where('modules.courseId', courseId)
      .whereNull('modules.deletedAt')
      .whereNull('lessons.deletedAt')
      .first('lessons.id');
  }

  async publish(id: number) {
    const [course] = await this.db('courses')
      .where('id', id)
      .update({ isPublished: true, updatedAt: this.db.fn.now() })
      .returning('*');

    return course;
  }

  async unpublish(id: number) {
    const [course] = await this.db('courses')
      .where('id', id)
      .update({ isPublished: false, updatedAt: this.db.fn.now() })
      .returning('*');

    return course;
  }

  findModulesByCourse(courseId: number, filters: ListCourseModulesDto) {
    const query = this.db('modules')
      .where('courseId', courseId)
      .whereNull('deletedAt');

    if (filters.status) query.where('status', filters.status);
    if (filters.order) query.where('order', filters.order);

    return query
      .select('*')
      .orderBy('order')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  findStudentsByCourse(courseId: number, filters: ListCourseStudentsDto) {
    const query = this.db('enrollments')
      .join('users', 'users.id', 'enrollments.userId')
      .where('enrollments.courseId', courseId)
      .whereNull('enrollments.deletedAt')
      .whereNull('users.deletedAt');

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
        'enrollments.createdAt as enrolledAt',
      )
      .orderBy('users.name')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  findProgressByCourse(courseId: number, filters: ListCourseProgressDto) {
    const query = this.db('progress')
      .join('enrollments', 'enrollments.id', 'progress.enrollmentId')
      .join('users', 'users.id', 'enrollments.userId')
      .join('lessons', 'lessons.id', 'progress.lessonId')
      .where('enrollments.courseId', courseId)
      .whereNull('enrollments.deletedAt')
      .whereNull('users.deletedAt')
      .whereNull('lessons.deletedAt');

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
        'progress.completedAt',
      )
      .orderBy(['users.name', 'lessons.order'])
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }
}
