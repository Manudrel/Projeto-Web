import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { LessonsRepository } from './lessons.repository.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { ListLessonsDto } from './dto/list-lessons.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';

@Injectable()
export class LessonsService {
  constructor(private readonly lessonsRepository: LessonsRepository) {}

  findAll(filters: ListLessonsDto, user: AuthenticatedUser) {
    return this.lessonsRepository.findAll(filters, {
      role: user.profile.role,
      userId: user.id,
    });
  }

  async findById(id: number, user: AuthenticatedUser) {
    const lesson = await this.lessonsRepository.findById(id);

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    await this.ensureCanRead(lesson.id, user);
    return lesson;
  }

  async create(data: CreateLessonDto, user: AuthenticatedUser) {
    await this.ensureCanManageModule(data.moduleId, user);
    const module = await this.lessonsRepository.findModuleById(data.moduleId);

    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }

    if (module.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Não é possível criar aula em um módulo inativo',
      );
    }
    // Regra de negócio -> Verifica se já existe uma aula com o mesmo título no mesmo módulo
    const lessonWithSameTitle =
      await this.lessonsRepository.findByTitleAndModule(
        data.title,
        data.moduleId,
      );

    if (lessonWithSameTitle) {
      throw new ConflictException(
        'Já existe uma aula com esse título nesse módulo',
      );
    }

    return this.lessonsRepository.create(data);
  }

  async update(
    id: number,
    data: UpdateLessonDto,
    user: AuthenticatedUser,
  ) {
    const lesson = await this.lessonsRepository.findById(id);

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    await this.ensureCanManageModule(lesson.moduleId, user);

    const moduleChanged =
      data.moduleId !== undefined && data.moduleId !== lesson.moduleId;
    const titleChanged =
      data.title !== undefined && data.title !== lesson.title;

    if (moduleChanged) {
      await this.ensureCanManageModule(data.moduleId!, user);
      const module = await this.lessonsRepository.findModuleById(
        data.moduleId!,
      );

      if (!module) {
        throw new NotFoundException('Módulo não encontrado');
      }

      if (module.status !== 'ACTIVE') {
        throw new BadRequestException(
          'Não é possível mover a aula para um módulo inativo',
        );
      }
    }

    if (moduleChanged || titleChanged) {
      const lessonWithSameTitle =
        await this.lessonsRepository.findByTitleAndModule(
          data.title ?? lesson.title,
          data.moduleId ?? lesson.moduleId,
          id,
        );

      if (lessonWithSameTitle) {
        throw new ConflictException(
          'Já existe uma aula com esse título nesse módulo',
        );
      }
    }

    return this.lessonsRepository.update(id, data);
  }

  async delete(id: number, user: AuthenticatedUser) {
    const lesson = await this.lessonsRepository.findById(id);

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }
    
    await this.ensureCanManageModule(lesson.moduleId, user);
    await this.lessonsRepository.delete(id);
  }

  private async ensureCanRead(id: number, user: AuthenticatedUser) {
    if (user.profile.role === 'ADMIN') return;

    const lesson = await this.lessonsRepository.findLessonAccessById(id);
    if (!lesson) throw new NotFoundException('Aula nao encontrada.');

    if (
      user.profile.role === 'INSTRUCTOR' &&
      lesson.instructorId === user.id
    ) {
      return;
    }

    if (user.profile.role === 'STUDENT') {
      const enrollment = await this.lessonsRepository.findEnrollmentForCourse(
        lesson.courseId,
        user.id,
      );
      if (enrollment) return;
    }

    throw new ForbiddenException('Voce nao tem acesso a esta aula.');
  }

  private async ensureCanManageModule(
    moduleId: number,
    user: AuthenticatedUser,
  ) {
    if (user.profile.role === 'ADMIN') return;

    const course = await this.lessonsRepository.findModuleAccessById(moduleId);
    if (!course) throw new NotFoundException('Modulo nao encontrado.');

    if (
      user.profile.role !== 'INSTRUCTOR' ||
      course.instructorId !== user.id
    ) {
      throw new ForbiddenException(
        'Apenas o instrutor dono do curso ou um administrador pode alterar esta aula.',
      );
    }
  }
}
