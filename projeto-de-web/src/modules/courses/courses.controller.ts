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
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { ListCourseModulesDto } from './dto/list-course-modules.dto.js';
import { ListCourseProgressDto } from './dto/list-course-progress.dto.js';
import { ListCourseStudentsDto } from './dto/list-course-students.dto.js';
import { ListCoursesDto } from './dto/list-courses.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@ApiTags('Cursos')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar cursos' })
  @ApiOkResponse({ description: 'Lista de cursos' })
  @ApiBadRequestResponse({ description: 'Filtros inválidos' })
  findAll(@Query() filters: ListCoursesDto) {
    return this.coursesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar curso por id' })
  @ApiOkResponse({ description: 'Curso encontrado' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  findById(@Param('id', idPipe) id: number) {
    return this.coursesService.findById(id);
  }

  @Get(':id/modules')
  @ApiOperation({ summary: 'Listar módulos do curso' })
  @ApiOkResponse({ description: 'Lista de módulos do curso' })
  @ApiBadRequestResponse({ description: 'Id ou filtros inválidos' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  findModules(
    @Param('id', idPipe) id: number,
    @Query() filters: ListCourseModulesDto,
  ) {
    return this.coursesService.findModules(id, filters);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Listar alunos do curso' })
  @ApiOkResponse({ description: 'Lista de alunos matriculados' })
  @ApiBadRequestResponse({ description: 'Id ou filtros inválidos' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  findStudents(
    @Param('id', idPipe) id: number,
    @Query() filters: ListCourseStudentsDto,
  ) {
    return this.coursesService.findStudents(id, filters);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Ver progresso dos alunos' })
  @ApiOkResponse({ description: 'Progresso dos alunos por aula' })
  @ApiBadRequestResponse({ description: 'Id ou filtros inválidos' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  findProgress(
    @Param('id', idPipe) id: number,
    @Query() filters: ListCourseProgressDto,
  ) {
    return this.coursesService.findProgress(id, filters);
  }

  @Post()
  @ApiOperation({ summary: 'Criar curso' })
  @ApiCreatedResponse({ description: 'Curso criado' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou categoria inativa',
  })
  @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
  @ApiConflictResponse({
    description: 'Já existe um curso com esse título nessa categoria',
  })
  create(@Body() data: CreateCourseDto) {
    return this.coursesService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar curso' })
  @ApiOkResponse({ description: 'Curso atualizado' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou categoria inativa',
  })
  @ApiNotFoundResponse({ description: 'Curso ou categoria não encontrados' })
  @ApiConflictResponse({
    description: 'Já existe um curso com esse título nessa categoria',
  })
  update(@Param('id', idPipe) id: number, @Body() data: UpdateCourseDto) {
    return this.coursesService.update(id, data);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publicar curso' })
  @ApiOkResponse({ description: 'Curso publicado' })
  @ApiBadRequestResponse({
    description: 'Curso já publicado ou sem módulo com aula',
  })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  publish(@Param('id', idPipe) id: number) {
    return this.coursesService.publish(id);
  }

  @Patch(':id/unpublish')
  @ApiOperation({ summary: 'Despublicar curso' })
  @ApiOkResponse({ description: 'Curso despublicado' })
  @ApiBadRequestResponse({
    description: 'Curso não publicado ou com alunos matriculados',
  })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  unpublish(@Param('id', idPipe) id: number) {
    return this.coursesService.unpublish(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir curso' })
  @ApiNoContentResponse({ description: 'Curso excluído' })
  @ApiBadRequestResponse({ description: 'Curso com alunos matriculados' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  delete(@Param('id', idPipe) id: number) {
    return this.coursesService.delete(id);
  }
}
