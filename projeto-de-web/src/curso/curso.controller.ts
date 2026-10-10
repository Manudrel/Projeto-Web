import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { NivelCurso } from './curso.entity.js';
import { CursoService } from './curso.service.js';

@Controller('cursos')
export class CursoController {
  constructor(private readonly cursoService: CursoService) {}

  @Get()
  findAll(
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
    @Query('limite', new DefaultValuePipe(20), ParseIntPipe) limite: number,
    @Query('categoriaId', new ParseIntPipe({ optional: true }))
    categoriaId?: number,
    @Query('nivel', new ParseEnumPipe(NivelCurso, { optional: true }))
    nivel?: NivelCurso,
  ) {
    return this.cursoService.findAll({ categoriaId, nivel }, pagina, limite);
  }
}
