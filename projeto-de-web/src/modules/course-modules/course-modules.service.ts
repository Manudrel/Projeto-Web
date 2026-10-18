import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { ListModulesDto } from './dto/list-modules.dto.js';
import { UpdateCourseModuleDto } from './dto/update-course-module.dto.js';
import { CourseModulesRepository } from './course-modules.repository.js';
import { CreateCourseModuleDto } from './dto/create-course-module.dto.js';

@Injectable()
export class CourseModulesService {
  constructor(
    private readonly courseModulesRepository: CourseModulesRepository,
  ) { }

  findAll(filters: ListModulesDto, user: AuthenticatedUser) {
    const role = user.profile.role;
    return this.courseModulesRepository.findAll(filters, {
      instructorId: role === 'INSTRUCTOR' ? user.id : undefined,
      publishedOnly: role === 'STUDENT',
      activeOnly: role === 'STUDENT',
    });
  }

  async findById(id: number, user: AuthenticatedUser) {
    const courseModule = await this.courseModulesRepository.findById(id);

    if (!courseModule) {
      throw new NotFoundException('Módulo não encontrado');
    }

    const course = await this.courseModulesRepository.findCourseById(
      courseModule.courseId,
    );

    if (!course) {
      throw new NotFoundException('Curso nao encontrado.');
    }

    this.ensureCanRead(course, user);
    if (user.profile.role === 'STUDENT' && courseModule.status !== 'ACTIVE') {
      throw new ForbiddenException('Aluno nao pode acessar modulo inativo.');
    }
    return courseModule;
  }

  async create(courseId: number, data: CreateCourseModuleDto, user: AuthenticatedUser) {
    
    const course = await this.courseModulesRepository.findCourseById(courseId);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    if (user.profile.role !== 'ADMIN' && user.profile.role !== 'INSTRUCTOR') {
      throw new ForbiddenException(
        'Apenas administradores e instrutores podem criar módulos',
      );
    }

    if (user.profile.role === 'INSTRUCTOR' && course.instructorId !== user.id) {
      throw new ForbiddenException(
        'Apenas o instrutor dono do curso ou um administrador pode criar módulos neste curso',
      );
    }
//[Falar Regra de negocio 8]
    const total = await this.courseModulesRepository.countByCourse(courseId);
    const order = data.order ?? total + 1;

    if (order > total + 1) {
      throw new UnprocessableEntityException(
        `A ordem não pode ser maior que a próxima posição disponível (${total + 1})`,
      );
    }

    return this.courseModulesRepository.create(courseId, data, order);

  }



  async update(id: number, data: UpdateCourseModuleDto, user: AuthenticatedUser) {
    const courseModule = await this.findById(id, user);

    await this.ensureCanManage(courseModule.courseId, user);

    if (data.order !== undefined && data.order !== courseModule.order) {

      const total = await this.courseModulesRepository.countByCourse(
        courseModule.courseId,
      );

      if (data.order > total) {
        throw new UnprocessableEntityException(
          `A ordem não pode ser maior que a quantidade de módulos do curso (${total})`,
        );
      }
    }

    return this.courseModulesRepository.update(id, courseModule.courseId, courseModule.order, data);
  }

  async delete(id: number, user: AuthenticatedUser) {
    const courseModule = await this.findById(id, user);

    await this.ensureCanManage(courseModule.courseId, user);

    await this.courseModulesRepository.delete(id, courseModule.courseId, courseModule.order);
  }

  private async ensureCanManage(courseId: number, user: AuthenticatedUser) {
    const course = await this.courseModulesRepository.findCourseById(courseId);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    if (user.profile.role === 'ADMIN') return;

    if (user.profile.role !== 'INSTRUCTOR' || course.instructorId !== user.id) {
      throw new ForbiddenException(
        'Apenas o instrutor dono do curso ou um administrador pode alterar este módulo',
      );
    }
  }

  private ensureCanRead(
    course: { instructorId: number; isPublished: boolean },
    user: AuthenticatedUser,
  ) {
    const role = user.profile.role;
    const allowed =
      role === 'ADMIN' ||
      (role === 'INSTRUCTOR' && course.instructorId === user.id) ||
      (role === 'STUDENT' && course.isPublished);

    if (!allowed) {
      throw new ForbiddenException('Voce nao tem acesso a este modulo.');
    }
  }
}
