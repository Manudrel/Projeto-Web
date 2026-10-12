import { Injectable, NotFoundException } from '@nestjs/common';
import { ListModulesDto } from './dto/list-modules.dto.js';
import { ModulesRepository } from './modules.repository.js';

@Injectable()
export class ModulesService {
  constructor(private readonly modulesRepository: ModulesRepository) {}

  findAll(filters: ListModulesDto) {
    return this.modulesRepository.findAll(filters);
  }

  async findById(id: number) {
    const module = await this.modulesRepository.findById(id);

    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }

    return module;
  }
}
