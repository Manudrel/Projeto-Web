import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { NivelCurso } from './curso.entity.js';

export interface FiltrosCurso {
  categoriaId?: number;
  nivel?: NivelCurso;
}

@Injectable()
export class CursoRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  findAll(filtros: FiltrosCurso, pagina: number, limite: number) {
    const query = this.db('courses');

    if (filtros.categoriaId) query.where('category_id', filtros.categoriaId);
    if (filtros.nivel) query.where('level', filtros.nivel);

    return query
      .select('*')
      .orderBy('id')
      .limit(limite)
      .offset((pagina - 1) * limite);
  }
}
