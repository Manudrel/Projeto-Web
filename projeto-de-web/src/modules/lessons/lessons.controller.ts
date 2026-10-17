import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { ListLessonProgressDto } from './dto/list-lesson-progress.dto.js';
import { ListLessonsDto } from './dto/list-lessons.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@ApiTags('Aulas')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar aulas' })
  @ApiOkResponse({ description: 'Lista de aulas' })
  @ApiBadRequestResponse({ description: 'Filtros inválidos' })
  findAll(@Query() filters: ListLessonsDto) {
    return this.lessonsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar aula por id' })
  @ApiOkResponse({ description: 'Aula encontrada' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  @ApiNotFoundResponse({ description: 'Aula não encontrada' })
  findById(@Param('id', idPipe) id: number) {
    return this.lessonsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar aula' })
  @ApiCreatedResponse({ description: 'Aula criada' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou módulo inativo',
  })
  @ApiNotFoundResponse({ description: 'Módulo não encontrado' })
  @ApiConflictResponse({
    description: 'Já existe uma aula com esse título nesse módulo',
  })
  create(@Body() data: CreateLessonDto) {
    return this.lessonsService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar aula' })
  @ApiOkResponse({ description: 'Aula atualizada' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou módulo inativo',
  })
  @ApiNotFoundResponse({ description: 'Aula ou módulo não encontrados' })
  @ApiConflictResponse({
    description: 'Já existe uma aula com esse título nesse módulo',
  })
  update(@Param('id', idPipe) id: number, @Body() data: UpdateLessonDto) {
    return this.lessonsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir aula' })
  @ApiNoContentResponse({ description: 'Aula excluída' })
  @ApiBadRequestResponse({
    description: 'Aula com progresso de alunos',
  })
  @ApiNotFoundResponse({ description: 'Aula não encontrada' })
  delete(@Param('id', idPipe) id: number) {
    return this.lessonsService.delete(id);
  }
}