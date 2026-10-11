import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoursesRepository } from './courses.repository.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { ListCoursesDto } from './dto/list-courses.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  findAll(filters: ListCoursesDto) {
    return this.coursesRepository.findAll(filters);
  }

  async findById(id: number) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    return course;
  }

  async create(data: CreateCourseDto) {
    const category = await this.coursesRepository.findCategoryById(
      data.categoryId,
    );

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (category.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Não é possível criar curso em uma categoria inativa',
      );
    }

    const courseWithSameTitle =
      await this.coursesRepository.findByTitleAndCategory(
        data.title,
        data.categoryId,
      );

    if (courseWithSameTitle) {
      throw new ConflictException(
        'Já existe um curso com esse título nessa categoria',
      );
    }

    return this.coursesRepository.create(data);
  }

  async update(id: number, data: UpdateCourseDto) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    const categoryChanged =
      data.categoryId !== undefined && data.categoryId !== course.categoryId;
    const titleChanged =
      data.title !== undefined && data.title !== course.title;

    if (categoryChanged) {
      const category = await this.coursesRepository.findCategoryById(
        data.categoryId!,
      );

      if (!category) {
        throw new NotFoundException('Categoria não encontrada');
      }

      if (category.status !== 'ACTIVE') {
        throw new BadRequestException(
          'Não é possível mover o curso para uma categoria inativa',
        );
      }
    }

    if (categoryChanged || titleChanged) {
      const courseWithSameTitle =
        await this.coursesRepository.findByTitleAndCategory(
          data.title ?? course.title,
          data.categoryId ?? course.categoryId,
          id,
        );

      if (courseWithSameTitle) {
        throw new ConflictException(
          'Já existe um curso com esse título nessa categoria',
        );
      }
    }

    return this.coursesRepository.update(id, data);
  }

  async delete(id: number) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    const activeEnrollment =
      await this.coursesRepository.findActiveEnrollmentByCourse(id);

    if (activeEnrollment) {
      throw new BadRequestException(
        'Não é possível excluir um curso com alunos matriculados',
      );
    }

    await this.coursesRepository.delete(id);
  }
}
