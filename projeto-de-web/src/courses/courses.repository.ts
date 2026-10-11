import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { CreateCourseDto } from './dto/create-course.dto.js';
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
}
