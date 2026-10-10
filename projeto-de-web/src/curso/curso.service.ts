import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CursoRepository } from './curso.repository.js';
import { CreateCursoDto } from './dto/create-curso.dto.js';
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

  async create(dados: CreateCursoDto) {
    const categoria = await this.cursoRepository.findCategoriaById(
      dados.categoriaId,
    );

    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (categoria.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Não é possível criar curso em uma categoria inativa',
      );
    }

    const cursoComMesmoTitulo =
      await this.cursoRepository.findByTituloECategoria(
        dados.titulo,
        dados.categoriaId,
      );

    if (cursoComMesmoTitulo) {
      throw new ConflictException(
        'Já existe um curso com esse título nessa categoria',
      );
    }

    return this.cursoRepository.create(dados);
  }
}
