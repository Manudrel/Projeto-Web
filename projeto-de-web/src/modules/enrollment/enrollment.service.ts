import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { ListEnrollmentsDto } from './dto/list-enrollments.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';
import { statusEnrollment } from './enrollment.entity.js';
import { EnrollmentRepository } from './enrollment.repository.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';

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

  async create(data: CreateEnrollmentDto, actor: AuthenticatedUser) {
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
    //RN 1 -> Usuário ativo FEITO
    if (user.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Não é possível matricular um usuário inativo',
      );
    }
    //RN 1 -> Curso publicado FEITO
    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    this.ensureCanManage(course.instructorId, actor);

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

  async update(
    id: number,
    data: UpdateEnrollmentDto,
    actor: AuthenticatedUser,
  ) {
    if (data.status !== undefined && data.status !== statusEnrollment.ACTIVE && data.status !== statusEnrollment.COMPLETED) 
      {
        throw new BadRequestException(
          'Status inválido; deve ser ACTIVE ou COMPLETED',
        );
      }

      
    const enrollmentToUpdate = await this.findById(id);
    await this.ensureCanManage(enrollmentToUpdate.courseId, actor);

    const enrollment = await this.enrollmentRepository.update(id, data);

    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    return enrollment;
  }


//Regra de negocio 7 cancelamento de matricula FEITO
  async cancel(id: number, actor: AuthenticatedUser) {
    const enrollment = await this.findById(id);
    await this.ensureCanManage(enrollment.courseId, actor);

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

  async delete(id: number, actor: AuthenticatedUser): Promise<void> {
    const enrollment = await this.findById(id);
    await this.ensureCanManage(enrollment.courseId, actor);

    if (enrollment.status !== statusEnrollment.CANCELLED) {
      throw new BadRequestException(
        'A matrícula só pode ser excluída quando estiver com status CANCELLED',
      );
    }

    const deleted = await this.enrollmentRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Matrícula não encontrada');
    }
  }

//RN 9 -> Propriedade do instrutor FEITO
// oque isso faz é fazer que só o instrutor dono do curso e o admins possar criar deletar e atualizar
  private async ensureCanManage(courseId: number, actor: AuthenticatedUser) {
    if (actor.profile.role === 'ADMIN') return;

    const course = await this.enrollmentRepository.findCoursePublication(courseId);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    if (actor.profile.role !== 'INSTRUCTOR' || course.instructorId !== actor.id) {
      throw new ForbiddenException(
        'Apenas o instrutor responsável pelo curso ou um administrador pode gerenciar matrículas',
      );
    }
  }
} 
