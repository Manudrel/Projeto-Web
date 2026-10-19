import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types.js';
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

  findAll(filters: ListCoursesDto, user: AuthenticatedUser) {
    const role = user.profile.role;
    return this.coursesRepository.findAll(filters, {
      instructorId: role === 'INSTRUCTOR' ? user.id : undefined,
      publishedOnly: role === 'STUDENT',
    });
  }

  async findById(id: number, user: AuthenticatedUser) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    this.ensureCanRead(course, user);
    return course;
  }

  async create(data: CreateCourseDto, user: AuthenticatedUser) {
    if (user.profile.role === 'INSTRUCTOR') {
      data = { ...data, instructorId: user.id };
    }
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

    const instructor = await this.coursesRepository.findUserWithRole(
      data.instructorId,
    );

    if (!instructor) {
      throw new NotFoundException('Instrutor não encontrado');
    }

    if (instructor.role !== 'INSTRUCTOR' && instructor.role !== 'ADMIN') {
      throw new UnprocessableEntityException(
        'O instrutor do curso precisa ter perfil INSTRUCTOR ou ADMIN',
      );
    }

    if (instructor.status !== 'ACTIVE') {
      throw new BadRequestException('O instrutor informado está inativo');
    }

    return this.coursesRepository.create(data);
  }

  async update(
    id: number,
    data: UpdateCourseDto,
    user: AuthenticatedUser,
  ) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    this.ensureCanManage(course, user);

    if (
      user.profile.role === 'INSTRUCTOR' &&
      data.instructorId !== undefined &&
      data.instructorId !== user.id
    ) {
      throw new ForbiddenException('Instrutores nao podem transferir cursos.');
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

    const instructorChanged =
      data.instructorId !== undefined &&
      data.instructorId !== course.instructorId;

    if (instructorChanged) {
      const instructor = await this.coursesRepository.findUserWithRole(
        data.instructorId!,
      );

      if (!instructor) {
        throw new NotFoundException('Instrutor não encontrado');
      }

      if (instructor.role !== 'INSTRUCTOR' && instructor.role !== 'ADMIN') {
        throw new UnprocessableEntityException(
          'O instrutor do curso precisa ter perfil INSTRUCTOR ou ADMIN',
        );
      }

      if (instructor.status !== 'ACTIVE') {
        throw new BadRequestException('O instrutor informado está inativo');
      }
    }

    const updateData = { ...data };
    if (user.profile.role === 'INSTRUCTOR') delete updateData.instructorId;

    return this.coursesRepository.update(id, updateData);
  }

  async delete(id: number, user: AuthenticatedUser) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    this.ensureCanManage(course, user);

    const activeEnrollment =
      await this.coursesRepository.findActiveEnrollmentByCourse(id);

    if (activeEnrollment) {
      throw new ConflictException(
        'Não é possível excluir um curso com matrículas ativas',
      );
    }

    await this.coursesRepository.delete(id);
  }

  async publish(id: number, user: AuthenticatedUser) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    this.ensureCanManage(course, user);

    if (course.isPublished) {
      throw new BadRequestException('O curso já está publicado');
    }

    const lesson = await this.coursesRepository.findActiveLessonByCourse(id);

    if (!lesson) {
      throw new UnprocessableEntityException(
        'O curso precisa de ao menos um módulo ativo com uma aula ativa',
      );
    }

    const category = await this.coursesRepository.findCategoryById(
      course.categoryId,
    );

    if (!category || category.status !== 'ACTIVE') {
      throw new UnprocessableEntityException(
        'A categoria do curso precisa estar ativa',
      );
    }

    const instructor = await this.coursesRepository.findUserWithRole(
      course.instructorId,
    );

    if (!instructor || instructor.status !== 'ACTIVE') {
      throw new UnprocessableEntityException(
        'O instrutor do curso precisa estar ativo',
      );
    }

    return this.coursesRepository.publish(id);
  }

  async unpublish(id: number, user: AuthenticatedUser) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    this.ensureCanManage(course, user);

    if (!course.isPublished) {
      throw new BadRequestException('O curso não está publicado');
    }

    return this.coursesRepository.unpublish(id);
  }

  async findModules(
    id: number,
    filters: ListCourseModulesDto,
    user: AuthenticatedUser,
  ) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    this.ensureCanRead(course, user);
    return this.coursesRepository.findModulesByCourse(
      id,
      filters,
      user.profile.role === 'STUDENT',
    );
  }

  async findStudents(
    id: number,
    filters: ListCourseStudentsDto,
    user: AuthenticatedUser,
  ) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    this.ensureCanManage(course, user);
    return this.coursesRepository.findStudentsByCourse(id, filters);
  }

  async findProgress(
    id: number,
    filters: ListCourseProgressDto,
    user: AuthenticatedUser,
  ) {
    const course = await this.coursesRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    this.ensureCanManage(course, user);
    return this.coursesRepository.findProgressByCourse(id, filters);
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
      throw new ForbiddenException('Voce nao tem acesso a este curso.');
    }
  }

  private ensureCanManage(
    course: { instructorId: number },
    user: AuthenticatedUser,
  ) {
    if (
      user.profile.role !== 'ADMIN' &&
      (user.profile.role !== 'INSTRUCTOR' || course.instructorId !== user.id)
    ) {
      throw new ForbiddenException(
        'Apenas o instrutor dono do curso ou um administrador pode alterar este curso.',
      );
    }
  }
}
