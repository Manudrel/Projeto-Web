import { randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { CertificateStatus } from './certificate.entity.js';
import { ListCertificatesDto } from './dto/list-certificates.dto.js';

const certificateColumns = [
  'id',
  'user_id as userId',
  'course_id as courseId',
  'code',
  'status',
  'issued_at as issuedAt',
];

@Injectable()
export class CertificatesRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  async findAll(filters: ListCertificatesDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const query = this.db('certificates');
    if (filters.userId) query.where('user_id', filters.userId);
    if (filters.courseId) query.where('course_id', filters.courseId);
    if (filters.status) query.where('status', filters.status);

    const sortColumnMap: Record<string, string> = {
      id: 'id',
      userId: 'user_id',
      courseId: 'course_id',
      issuedAt: 'issued_at',
    };
    const sortColumn = sortColumnMap[filters.sortBy] ?? 'id';
    const sortDirection = filters.order === 'desc' ? 'desc' : 'asc';
    const countResult = await query.clone().count<{ count: string | number }>('id as count').first();
    const total = Number(countResult?.count ?? 0);
    const data = await query
      .clone()
      .select(certificateColumns)
      .orderBy(sortColumn, sortDirection)
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data,
      meta: { 
        total,
        page, 
        limit, 
        totalPages: Math.ceil(total / limit) || 1 
      },
    };
  }

  findById(id: number) {
    return this.db('certificates').where('id', id).select(certificateColumns).first();
  }

  findUser(userId: number) {
    return this.db('users')
      .where('id', userId)
      .whereNull('deleted_at')
      .select('id', 'status')
      .first();
  }

  findCourse(courseId: number) {
    return this.db('courses')
      .where('id', courseId)
      .whereNull('deleted_at')
      .select('id')
      .first();
  }

  findCompletedEnrollment(userId: number, courseId: number) {
    return this.db('enrollments')
      .where({ user_id: userId, course_id: courseId, status: 'COMPLETED' })
      .where('progress', '>=', 100)
      .whereNull('deleted_at')
      .select('id')
      .first();
  }

  hasValidCertificate(userId: number, courseId: number) {
    return this.db('certificates')
      .where({ user_id: userId, course_id: courseId, status: CertificateStatus.VALID })
      .first()
      .then(Boolean);
  }

  async hasFinalAssessment(courseId: number): Promise<boolean> {
    if (!(await this.db.schema.hasTable('assessments'))) return false;
    return Boolean(
      await this.db('assessments')
        .where({ course_id: courseId, type: 'FINAL' })
        .first(),
    );
  }

  async hasApprovedFinalAttempt(userId: number, courseId: number): Promise<boolean> {
    if (
      !(await this.db.schema.hasTable('assessments')) ||
      !(await this.db.schema.hasTable('assessment_attempts'))
    ) {
      return false;
    }

    return Boolean(
      await this.db('assessment_attempts')
        .join('assessments', 'assessments.id', 'assessment_attempts.assessment_id')
        .join('enrollments', 'enrollments.id', 'assessment_attempts.enrollment_id')
        .where('assessments.course_id', courseId)
        .where('assessments.type', 'FINAL')
        .where('enrollments.user_id', userId)
        .where('enrollments.course_id', courseId)
        .where('assessment_attempts.is_approved', true)
        .first(),
    );
  }

  async create(userId: number, courseId: number) {
    const code = this.generateCode();
    const [certificate] = await this.db('certificates')
      .insert({ user_id: userId, course_id: courseId, code, status: CertificateStatus.VALID })
      .returning(certificateColumns);
    return certificate;
  }

  async findByCode(code: string) {
    const certificate = await this.db('certificates')
      .join('users', 'users.id', 'certificates.user_id')
      .join('courses', 'courses.id', 'certificates.course_id')
      .where('certificates.code', code)
      .select([
        'certificates.status as status',
        'certificates.issued_at as issuedAt',
        'certificates.user_id as userId',
        'certificates.course_id as courseId',
        'users.name as studentName',
        'users.status as userStatus',
        'courses.title as courseTitle',
      ])
      .first();
    if (!certificate) return undefined;

    const enrollment = await this.db('enrollments')
      .where({ user_id: certificate.userId, course_id: certificate.courseId })
      .whereNull('deleted_at')
      .where('status', 'COMPLETED')
      .first();

    return { ...certificate, hasCompletedEnrollment: Boolean(enrollment) };
  }

  isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
  }

  private generateCode() {
    const part = (bytes: number) => randomBytes(bytes).toString('hex').toUpperCase();
    return `CERT-${part(2)}-${part(2)}`;
  }

}
