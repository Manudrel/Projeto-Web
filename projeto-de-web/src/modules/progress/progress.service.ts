import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CreateProgressDto } from './dto/create-progress.dto.js';
import { ListProgressDto } from './dto/list-progress.dto.js';
import { UpdateProgressDto } from './dto/update-progress.dto.js';
import { ProgressRepository } from './progress.repository.js';

@Injectable()
export class ProgressService {
  constructor(private readonly progressRepository: ProgressRepository) { }

  findAll(filters: ListProgressDto, user: AuthenticatedUser) {
    const role = user.profile.role;

    if (role === 'STUDENT') filters.userId = user.id;

    return this.progressRepository.findAll(filters, role === 'INSTRUCTOR' ? user.id : undefined);
  }

  async findById(id: number, user: AuthenticatedUser) {
    const progress = await this.progressRepository.findById(id);

    if (!progress) {
      throw new NotFoundException('Progresso não encontrado');
    }

    const role = user.profile.role;
    const canView =
      role === 'ADMIN' ||
      (role === 'STUDENT' && progress.userId === user.id) ||
      (role === 'INSTRUCTOR' && progress.instructorId === user.id);

    if (!canView) {
      throw new ForbiddenException('Você não tem acesso a este progresso');
    }

    return progress;
  }

  async create(data: CreateProgressDto, user: AuthenticatedUser) {
    const enrollment = await this.progressRepository.findEnrollmentById(data.enrollmentId);

    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    this.ensureCanRegister(enrollment.userId, user);

    if (enrollment.status !== 'ACTIVE') {
      throw new UnprocessableEntityException('A matrícula precisa estar ativa para registrar progresso');
    }

    const lesson = await this.progressRepository.findLessonCourseId(data.lessonId);

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    if (lesson.courseId !== enrollment.courseId) {
      throw new UnprocessableEntityException('A aula não pertence ao curso da matrícula');
    }

    const existing = await this.progressRepository.findByEnrollmentAndLesson(data.enrollmentId, data.lessonId);

    if (existing) {
      throw new ConflictException('Esta aula já foi registrada nesta matrícula');
    }

    const id = await this.progressRepository.create(data.enrollmentId, data.lessonId, enrollment.courseId);

    return this.findById(id, user);
  }

  async update(id: number, data: UpdateProgressDto, user: AuthenticatedUser) {
    const progress = await this.progressRepository.findById(id);

    if (!progress) {
      throw new NotFoundException('Progresso não encontrado');
    }

    this.ensureCanRegister(progress.userId, user);

    if (progress.enrollmentStatus !== 'ACTIVE') {
      throw new UnprocessableEntityException('A matrícula precisa estar ativa para alterar o progresso');
    }

    await this.progressRepository.update(id, progress.enrollmentId, progress.courseId, data.completed);

    return this.findById(id, user);
  }

  private ensureCanRegister(ownerId: number, user: AuthenticatedUser) {
    const role = user.profile.role;

    if (role === 'ADMIN') return;

    if (role !== 'STUDENT' || ownerId !== user.id) {
      throw new ForbiddenException('Apenas o aluno dono da matrícula ou um administrador pode registrar progresso');
    }
  }
}
