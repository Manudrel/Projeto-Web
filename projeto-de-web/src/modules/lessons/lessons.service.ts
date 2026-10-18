import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LessonsRepository } from './lessons.repository.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { ListLessonsDto } from './dto/list-lessons.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';

@Injectable()
export class LessonsService {
  constructor(private readonly lessonsRepository: LessonsRepository) {}

  findAll(filters: ListLessonsDto) {
    return this.lessonsRepository.findAll(filters);
  }

  async findById(id: number) {
    const lesson = await this.lessonsRepository.findById(id);

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    return lesson;
  }

  async create(data: CreateLessonDto) {
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

  async update(id: number, data: UpdateLessonDto) {
    const lesson = await this.lessonsRepository.findById(id);

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    const moduleChanged =
      data.moduleId !== undefined && data.moduleId !== lesson.moduleId;
    const titleChanged =
      data.title !== undefined && data.title !== lesson.title;

    if (moduleChanged) {
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

  async delete(id: number) {
    const lesson = await this.lessonsRepository.findById(id);

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }
    
    await this.lessonsRepository.delete(id);
  }
}