import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { CreateAssessmentDto } from './dto/create-assessment.dto.js';
import { ListAssessmentsDto } from './dto/list-assessments.dto.js';
import { UpdateAssessmentDto } from './dto/update-assessment.dto.js';

const assessmentColumns = [
  'id',
  'course_id as courseId',
  'module_id as moduleId',
  'title',
  'type',
  'min_score_to_pass as minScoreToPass',
  'max_attempts as maxAttempts',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'deleted_at as deletedAt',
];

@Injectable()
export class AssessmentsRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) { }

  findAll(filters: ListAssessmentsDto) {
    const query = this.db('assessments').whereNull('deleted_at');

    if (filters.courseId) query.where('course_id', filters.courseId);
    if (filters.type) query.where('type', filters.type);

    return query
      .select(assessmentColumns)
      .orderBy('id', 'asc')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);
  }

  findById(id: number) {
    return this.db('assessments')
      .where('id', id)
      .whereNull('deleted_at')
      .select(assessmentColumns)
      .first();
  }

  findCourseById(courseId: number) {
    return this.db('courses')
      .where('id', courseId)
      .whereNull('deleted_at')
      .select('id', 'instructor_id as instructorId')
      .first();
  }

  findModuleById(moduleId: number) {
    return this.db('modules')
      .where('id', moduleId)
      .whereNull('deleted_at')
      .select('id', 'course_id as courseId')
      .first();
  }

  async create(data: CreateAssessmentDto) {
    const [assessment] = await this.db('assessments')
      .insert({
        course_id: data.courseId,
        module_id: data.moduleId ?? null,
        title: data.title,
        type: data.type,
        min_score_to_pass: data.minScoreToPass,
        max_attempts: data.maxAttempts ?? 3,
      })
      .returning(assessmentColumns);

    return assessment;
  }

  async update(id: number, data: UpdateAssessmentDto) {
    const updatePayload: Record<string, any> = {
      updated_at: this.db.fn.now(),
    };

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.moduleId !== undefined) updatePayload.module_id = data.moduleId;
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.minScoreToPass !== undefined) updatePayload.min_score_to_pass = data.minScoreToPass;
    if (data.maxAttempts !== undefined) updatePayload.max_attempts = data.maxAttempts;

    const [assessment] = await this.db('assessments')
      .where('id', id)
      .update(updatePayload)
      .returning(assessmentColumns);

    return assessment;
  }

  findEnrollmentById(id: number) {
    return this.db('enrollments')
      .where('id', id)
      .whereNull('deleted_at')
      .select('id', 'user_id as userId', 'course_id as courseId', 'status')
      .first();
  }

  findEnrollmentByUserAndCourse(userId: number, courseId: number) {
    return this.db('enrollments')
      .where({ user_id: userId, course_id: courseId })
      .whereIn('status', ['ACTIVE', 'COMPLETED'])
      .whereNull('deleted_at')
      .first();
  }

  findAttempts(assessmentId: number, enrollmentId?: number) {
    const query = this.db('assessment_attempts')
      .where('assessment_id', assessmentId);

    if (enrollmentId) query.where('enrollment_id', enrollmentId);

    return query
      .select([
        'id',
        'enrollment_id as enrollmentId',
        'assessment_id as assessmentId',
        'score',
        'is_approved as isApproved',
        'attempt_number as attemptNumber',
        'created_at as createdAt',
      ])
      .orderBy('attempt_number', 'asc');
  }

  findAttemptsByUser(assessmentId: number, userId: number) {
    return this.db('assessment_attempts')
      .join('enrollments', 'enrollments.id', 'assessment_attempts.enrollment_id')
      .where('assessment_attempts.assessment_id', assessmentId)
      .where('enrollments.user_id', userId)
      .select([
        'assessment_attempts.id',
        'assessment_attempts.enrollment_id as enrollmentId',
        'assessment_attempts.assessment_id as assessmentId',
        'assessment_attempts.score',
        'assessment_attempts.is_approved as isApproved',
        'assessment_attempts.attempt_number as attemptNumber',
        'assessment_attempts.created_at as createdAt',
      ])
      .orderBy('assessment_attempts.attempt_number', 'asc');
  }

  async createAttempt(data: {
    assessmentId: number;
    enrollmentId: number;
    score: number;
    isApproved: boolean;
    attemptNumber: number;
  }) {
    const [attempt] = await this.db('assessment_attempts')
      .insert({
        assessment_id: data.assessmentId,
        enrollment_id: data.enrollmentId,
        score: data.score,
        is_approved: data.isApproved,
        attempt_number: data.attemptNumber,
      })
      .returning([
        'id',
        'enrollment_id as enrollmentId',
        'assessment_id as assessmentId',
        'score',
        'is_approved as isApproved',
        'attempt_number as attemptNumber',
        'created_at as createdAt',
      ]);

    return attempt;
  }
}
