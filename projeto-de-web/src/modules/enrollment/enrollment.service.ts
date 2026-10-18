import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { ListEnrollmentsDto } from './dto/list-enrollments.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';
import { statusEnrollment } from './enrollment.entity.js';
import { EnrollmentRepository } from './enrollment.repository.js';

@Injectable()
export class EnrollmentService {
  constructor(private readonly enrollmentRepository: EnrollmentRepository) {}

  findAll(filters: ListEnrollmentsDto) {
    return this.enrollmentRepository.findAll(filters);
  }

  async findById(id: number) {
    const enrollment = await this.enrollmentRepository.findById(id);

    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    return enrollment;
  }

  async create(data: CreateEnrollmentDto) {
    const [user, course, existingEnrollment] = await Promise.all([
      this.enrollmentRepository.findUserStatus(data.userId),
      this.enrollmentRepository.findCoursePublication(data.courseId),
      this.enrollmentRepository.findOpenEnrollmentByUserAndCourse(
        data.userId,
        data.courseId,
      ),
    ]);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Não é possível matricular um usuário inativo',
      );
    }

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    if (!course.isPublished) {
      throw new BadRequestException(
        'Não é possível matricular em um curso não publicado',
      );
    }

    if (existingEnrollment) {
      throw new ConflictException(
        'O usuário já possui uma matrícula ativa ou concluída neste curso',
      );
    }

    return this.enrollmentRepository.create(data);
  }

  async update(id: number, data: UpdateEnrollmentDto) {
    if (data.status === statusEnrollment.CANCELLED) {
      throw new BadRequestException(
        'CANCELLED só pode ser definido pela função de cancelamento da matrícula',
      );
    }

    await this.findById(id);

    const enrollment = await this.enrollmentRepository.update(id, data);

    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    return enrollment;
  }


//Regra de negocio 7 cancelamento de matricula FEITO
  async cancel(id: number) {
    const enrollment = await this.findById(id);

    if (enrollment.status !== statusEnrollment.ACTIVE) {
      throw new BadRequestException(
        'Somente matrículas ACTIVE podem ser canceladas',
      );
    }

    const canceledEnrollment = await this.enrollmentRepository.cancel(id);

    if (!canceledEnrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    return canceledEnrollment;
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.enrollmentRepository.delete(id);
  }
}
