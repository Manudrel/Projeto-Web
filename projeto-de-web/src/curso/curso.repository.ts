import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { CreateCursoDto } from './dto/create-curso.dto.js';
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

  findCategoriaById(id: number) {
    return this.db('categories').where('id', id).first();
  }

  findByTituloECategoria(titulo: string, categoriaId: number) {
    return this.db('courses')
      .whereRaw('LOWER(title) = LOWER(?)', [titulo])
      .where('category_id', categoriaId)
      .first();
  }

  async create(dados: CreateCursoDto) {
    const [curso] = await this.db('courses')
      .insert({
        title: dados.titulo,
        description: dados.descricao,
        category_id: dados.categoriaId,
        instructor_id: dados.instrutorId,
        level: dados.nivel,
        workload_hours: dados.cargaHoraria,
      })
      .returning('*');

    return curso;
  }
}
