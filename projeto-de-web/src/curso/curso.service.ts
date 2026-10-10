import { Injectable, NotFoundException } from '@nestjs/common';
import { CursoRepository } from './curso.repository.js';
import { ListarCursosDto } from './dto/listar-cursos.dto.js';

@Injectable()
export class CursoService {
  constructor(private readonly cursoRepository: CursoRepository) {}

  findAll(filtros: ListarCursosDto) {
    return this.cursoRepository.findAll(filtros);
  }

  async findById(id: number) {
    const curso = await this.cursoRepository.findById(id);

    if (!curso) {
      throw new NotFoundException('Curso não encontrado');
    }

    return curso;
  }
}
