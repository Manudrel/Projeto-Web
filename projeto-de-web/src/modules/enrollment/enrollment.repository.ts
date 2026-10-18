import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import type { Enrollment } from './enrollment.entity.js';
import { ListEnrollmentsDto } from './dto/list-enrollments.dto.js';

type NewEnrollment = Pick<Enrollment, 'userId' | 'courseId'>;
type EnrollmentChanges = Partial<Pick<Enrollment, 'status' | 'progress'>>;

const enrollmentColumns = [
  'id',
  'user_id as userId',
  'course_id as courseId',
  'status',
  'progress',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'deleted_at as deletedAt',
];

@Injectable()
export class EnrollmentRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  findAll(filters: ListEnrollmentsDto) {
    const query = this.db('enrollments').whereNull('deleted_at');

    if (filters.userId !== undefined) query.where('user_id', filters.userId);
    if (filters.courseId !== undefined) query.where('course_id', filters.courseId);
    if (filters.status) query.where('status', filters.status);

    return query
      .select(enrollmentColumns)
      .orderBy('id', 'desc')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  findById(id: number) {
    return this.db('enrollments')
      .where('id', id)
      .whereNull('deleted_at')
      .select(enrollmentColumns)
      .first<Enrollment>();
  }

  async create(data: NewEnrollment) {
    const [enrollment] = await this.db('enrollments')
      .insert({
        user_id: data.userId,
        course_id: data.courseId,
      })
      .returning(enrollmentColumns);

    return enrollment as Enrollment;
  }

  async update(id: number, data: EnrollmentChanges) {
    const changes: Record<string, unknown> = {
      updated_at: this.db.fn.now(),
    };

    if (data.status !== undefined) changes.status = data.status;
    if (data.progress !== undefined) changes.progress = data.progress;

    const [enrollment] = await this.db('enrollments')
      .where('id', id)
      .whereNull('deleted_at')
      .update(changes)
      .returning(enrollmentColumns);

    return enrollment as Enrollment | undefined;
  }

  async delete(id: number): Promise<void> {
    await this.db('enrollments')
      .where('id', id)
      .whereNull('deleted_at')
      .update({
        deleted_at: this.db.fn.now(),
        updated_at: this.db.fn.now(),
      });
  }
}
