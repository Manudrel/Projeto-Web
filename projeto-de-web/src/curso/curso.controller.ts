import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CursoService } from './curso.service.js';
import { CreateCursoDto } from './dto/create-curso.dto.js';
import { ListarCursosDto } from './dto/listar-cursos.dto.js';

@Controller('cursos')
export class CursoController {
  constructor(private readonly cursoService: CursoService) {}

  @Get()
  findAll(@Query() filtros: ListarCursosDto) {
    return this.cursoService.findAll(filtros);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.cursoService.findById(id);
  }

  @Post()
  create(@Body() dados: CreateCursoDto) {
    return this.cursoService.create(dados);
  }
}
