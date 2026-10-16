import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { ListModulesDto } from './dto/list-modules.dto.js';
import { UpdateCourseModuleDto } from './dto/update-course-module.dto.js';
import { CourseModulesRepository } from './course-modules.repository.js';

@Injectable()
export class CourseModulesService {
  constructor(
    private readonly courseModulesRepository: CourseModulesRepository,
  ) { }

  findAll(filters: ListModulesDto) {
    return this.courseModulesRepository.findAll(filters);
  }

  async findById(id: number) {
    const courseModule = await this.courseModulesRepository.findById(id);

    if (!courseModule) {
      throw new NotFoundException('Módulo não encontrado');
    }

    return courseModule;
  }

  async update(id: number, data: UpdateCourseModuleDto, user: AuthenticatedUser) {
    const courseModule = await this.findById(id);

    await this.ensureCanManage(courseModule.courseId, user);

    if (data.order !== undefined && data.order !== courseModule.order) {

      const total = await this.courseModulesRepository.countByCourse(
        courseModule.courseId,
      );

      if (data.order > total) {
        throw new BadRequestException(
          `A ordem não pode ser maior que a quantidade de módulos do curso (${total})`,
        );
      }
    }

    return this.courseModulesRepository.update(id, courseModule.courseId, courseModule.order, data);
  }

  async delete(id: number, user: AuthenticatedUser) {
    const courseModule = await this.findById(id);

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
}
