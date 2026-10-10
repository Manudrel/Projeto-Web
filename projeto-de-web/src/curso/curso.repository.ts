import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { ListarCursosDto } from './dto/listar-cursos.dto.js';

@Injectable()
export class CursoRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) {}

  findAll(filtros: ListarCursosDto) {
    const query = this.db('courses');

    if (filtros.categoriaId) query.where('category_id', filtros.categoriaId);
    if (filtros.nivel) query.where('level', filtros.nivel);

    return query
      .select('*')
      .orderBy('id')
      .limit(filtros.limite)
      .offset((filtros.pagina - 1) * filtros.limite);
  }

  findById(id: number) {
    return this.db('courses').where('id', id).first();
  }
}
