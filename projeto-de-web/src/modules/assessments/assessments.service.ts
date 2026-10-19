import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException, } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { AssessmentType } from './assessment.entity.js';
import { AssessmentsRepository } from './assessments.repository.js';
import { CreateAssessmentDto } from './dto/create-assessment.dto.js';
import { CreateAssessmentAttemptDto } from './dto/create-assessment-attempt.dto.js';
import { ListAssessmentsDto } from './dto/list-assessments.dto.js';
import { UpdateAssessmentDto } from './dto/update-assessment.dto.js';

@Injectable()
export class AssessmentsService {
  constructor(
    private readonly assessmentsRepository: AssessmentsRepository,
  ) { }

  findAll(filters: ListAssessmentsDto) {
    return this.assessmentsRepository.findAll(filters);
  }

  async findById(id: number) {
    const assessment = await this.assessmentsRepository.findById(id);

    if (!assessment) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    return assessment;
  }

  async create(data: CreateAssessmentDto, user: AuthenticatedUser) {
    if (data.type === AssessmentType.MODULE && !data.moduleId) {
      throw new BadRequestException('Avaliações do tipo MODULE exigem um moduleId');
    }

    const course = await this.assessmentsRepository.findCourseById(data.courseId);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    this.ensureCanManage(course.instructorId, user);

    if (data.moduleId) {
      const courseModule = await this.assessmentsRepository.findModuleById(data.moduleId);

      if (!courseModule) {
        throw new NotFoundException('Módulo não encontrado');
      }

      if (courseModule.courseId !== data.courseId) {
        throw new BadRequestException('O módulo não pertence ao curso informado');
      }
    }

    return this.assessmentsRepository.create(data);
  }

  async update(id: number, data: UpdateAssessmentDto, user: AuthenticatedUser) {
    const assessment = await this.findById(id);
    const course = await this.assessmentsRepository.findCourseById(assessment.courseId);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    this.ensureCanManage(course.instructorId, user);

    const targetModuleId = data.moduleId !== undefined ? data.moduleId : assessment.moduleId;
    const targetType = data.type !== undefined ? data.type : assessment.type;

    if (targetType === AssessmentType.MODULE && !targetModuleId) {
      throw new BadRequestException('Avaliações do tipo MODULE exigem um moduleId');
    }

    if (data.moduleId) {
      const courseModule = await this.assessmentsRepository.findModuleById(data.moduleId);

      if (!courseModule) {
        throw new NotFoundException('Módulo não encontrado');
      }

      if (courseModule.courseId !== assessment.courseId) {
        throw new BadRequestException('O módulo não pertence ao curso informado');
      }
    }

    return this.assessmentsRepository.update(id, data);
  }

  async createAttempt(
    assessmentId: number,
    data: CreateAssessmentAttemptDto,
    user: AuthenticatedUser,
  ) {
    const assessment = await this.findById(assessmentId);
    const enrollment = await this.assessmentsRepository.findEnrollmentById(data.enrollmentId);

    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    if (user.profile.role === 'STUDENT' && enrollment.userId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para realizar tentativa nesta matrícula');
    }

    // RN-06 -> Tentativa exige matrícula ativa no curso da avaliação
    if (enrollment.courseId !== assessment.courseId) {
      throw new UnprocessableEntityException(
        'A matrícula informada não pertence ao curso desta avaliação',
      );
    }

    if (enrollment.status !== 'ACTIVE') {
      throw new UnprocessableEntityException('Apenas alunos com matrícula ativa podem realizar tentativas de avaliação');
    }

    const attempts = await this.assessmentsRepository.findAttempts(assessmentId, data.enrollmentId);

    const alreadyApproved = attempts.some((attempt) => attempt.isApproved);
    if (alreadyApproved) {
      throw new ConflictException('Esta avaliação já foi aprovada anteriormente nesta matrícula');
    }

    const nextAttemptNumber = attempts.length + 1;
    if (nextAttemptNumber > assessment.maxAttempts) {
      throw new UnprocessableEntityException(
        `Limite de tentativas atingido para esta avaliação (${assessment.maxAttempts})`,
      );
    }

    const isApproved = data.score >= assessment.minScoreToPass;

    return this.assessmentsRepository.createAttempt({
      assessmentId,
      enrollmentId: data.enrollmentId,
      score: data.score,
      isApproved,
      attemptNumber: nextAttemptNumber,
    });
  }

  async findAttempts(assessmentId: number, user: AuthenticatedUser) {
    const assessment = await this.findById(assessmentId);
    const course = await this.assessmentsRepository.findCourseById(assessment.courseId);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    // RN-09 -> Apenas o instrutor dono do curso consulta tentativas
    if (user.profile.role === 'INSTRUCTOR' && course.instructorId !== user.id) {
      throw new ForbiddenException(
        'Apenas o instrutor dono do curso ou administrador pode consultar as tentativas',
      );
    }

    // RN-10 -> Aluno consulta apenas tentativas de cursos em que está matriculado
    if (user.profile.role === 'STUDENT') {
      const enrollment = await this.assessmentsRepository.findEnrollmentByUserAndCourse(
        user.id,
        assessment.courseId,
      );

      if (!enrollment) {
        throw new ForbiddenException(
          'Você não tem acesso às tentativas de avaliação deste curso',
        );
      }

      return this.assessmentsRepository.findAttemptsByUser(assessmentId, user.id);
    }

    return this.assessmentsRepository.findAttempts(assessmentId);
  }

  private ensureCanManage(instructorId: number, user: AuthenticatedUser) {
    const role = user.profile.role;

    if (role === 'ADMIN') return;

    if (role !== 'INSTRUCTOR' || instructorId !== user.id) {
      throw new ForbiddenException(
        'Apenas o instrutor dono do curso ou um administrador pode gerenciar esta avaliação',
      );
    }
  }
}
