import { Injectable, NotFoundException } from '@nestjs/common';
import { ListModulesDto } from './dto/list-modules.dto.js';
import { CourseModulesRepository } from './course-modules.repository.js';

@Injectable()
export class CourseModulesService {
  constructor(
    private readonly courseModulesRepository: CourseModulesRepository,
  ) {}

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
}
