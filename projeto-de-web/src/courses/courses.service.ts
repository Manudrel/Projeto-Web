import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoursesRepository } from './courses.repository.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { ListCourseModulesDto } from './dto/list-course-modules.dto.js';
import { ListCourseProgressDto } from './dto/list-course-progress.dto.js';
import { ListCourseStudentsDto } from './dto/list-course-students.dto.js';
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

  async publish(id: number) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    if (course.isPublished) {
      throw new BadRequestException('O curso já está publicado');
    }

    const lesson = await this.coursesRepository.findLessonByCourse(id);

    if (!lesson) {
      throw new BadRequestException(
        'O curso precisa ter pelo menos um módulo com aula para ser publicado',
      );
    }

    return this.coursesRepository.publish(id);
  }

  async unpublish(id: number) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    if (!course.isPublished) {
      throw new BadRequestException('O curso não está publicado');
    }

    const activeEnrollment =
      await this.coursesRepository.findActiveEnrollmentByCourse(id);

    if (activeEnrollment) {
      throw new BadRequestException(
        'Não é possível despublicar um curso com alunos matriculados',
      );
    }

    return this.coursesRepository.unpublish(id);
  }

  async findModules(id: number, filters: ListCourseModulesDto) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    return this.coursesRepository.findModulesByCourse(id, filters);
  }

  async findStudents(id: number, filters: ListCourseStudentsDto) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    return this.coursesRepository.findStudentsByCourse(id, filters);
  }

  async findProgress(id: number, filters: ListCourseProgressDto) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    return this.coursesRepository.findProgressByCourse(id, filters);
  }
}
