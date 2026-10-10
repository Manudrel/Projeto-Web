import { Injectable } from '@nestjs/common';
import { CursoRepository, FiltrosCurso } from './curso.repository.js';

@Injectable()
export class CursoService {
  constructor(private readonly cursoRepository: CursoRepository) {}

  findAll(filtros: FiltrosCurso, pagina: number, limite: number) {
    return this.cursoRepository.findAll(filtros, pagina, limite);
  }
}
