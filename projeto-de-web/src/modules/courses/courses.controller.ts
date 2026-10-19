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
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
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
  @RequirePermissions('courses:read')
  @ApiOperation({ summary: 'Listar cursos' })
  @ApiOkResponse({ description: 'Lista de cursos' })
  @ApiBadRequestResponse({ description: 'Filtros inválidos' })
  findAll(@Query() filters: ListCoursesDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.findAll(filters, user);
  }

  @Get(':id')
  @RequirePermissions('courses:read')
  @ApiOperation({ summary: 'Buscar curso por id' })
  @ApiOkResponse({ description: 'Curso encontrado' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  findById(@Param('id', idPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.findById(id, user);
  }

  @Get(':id/modules')
  @RequirePermissions('modules:read')
  @ApiOperation({ summary: 'Listar módulos do curso' })
  @ApiOkResponse({ description: 'Lista de módulos do curso' })
  @ApiBadRequestResponse({ description: 'Id ou filtros inválidos' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  findModules(
    @Param('id', idPipe) id: number,
    @Query() filters: ListCourseModulesDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.coursesService.findModules(id, filters, user);
  }

  @Get(':id/students')
  @RequirePermissions('enrollments:read')
  @ApiOperation({ summary: 'Listar alunos do curso' })
  @ApiOkResponse({ description: 'Lista de alunos matriculados' })
  @ApiBadRequestResponse({ description: 'Id ou filtros inválidos' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  findStudents(
    @Param('id', idPipe) id: number,
    @Query() filters: ListCourseStudentsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.coursesService.findStudents(id, filters, user);
  }

  @Get(':id/progress')
  @RequirePermissions('progress:read')
  @ApiOperation({ summary: 'Ver progresso dos alunos' })
  @ApiOkResponse({ description: 'Progresso dos alunos por aula' })
  @ApiBadRequestResponse({ description: 'Id ou filtros inválidos' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  findProgress(
    @Param('id', idPipe) id: number,
    @Query() filters: ListCourseProgressDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.coursesService.findProgress(id, filters, user);
  }

  @Post()
  @RequirePermissions('courses:create')
  @ApiOperation({ summary: 'Criar curso' })
  @ApiCreatedResponse({ description: 'Curso criado' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos, categoria inativa ou instrutor inativo',
  })
  @ApiNotFoundResponse({
    description: 'Categoria ou instrutor não encontrados',
  })
  @ApiConflictResponse({
    description: 'Já existe um curso com esse título nessa categoria',
  })
  @ApiUnprocessableEntityResponse({
    description: 'O instrutor precisa ter perfil INSTRUCTOR ou ADMIN',
  })
  create(@Body() data: CreateCourseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.create(data, user);
  }

  @Patch(':id')
  @RequirePermissions('courses:update')
  @ApiOperation({ summary: 'Atualizar curso' })
  @ApiOkResponse({ description: 'Curso atualizado' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos, categoria inativa ou instrutor inativo',
  })
  @ApiNotFoundResponse({
    description: 'Curso, categoria ou instrutor não encontrados',
  })
  @ApiConflictResponse({
    description: 'Já existe um curso com esse título nessa categoria',
  })
  @ApiUnprocessableEntityResponse({
    description: 'O instrutor precisa ter perfil INSTRUCTOR ou ADMIN',
  })
  update(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateCourseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.coursesService.update(id, data, user);
  }

  @Patch(':id/publish')
  @RequirePermissions('courses:publish')
  @ApiOperation({ summary: 'Publicar curso' })
  @ApiOkResponse({ description: 'Curso publicado' })
  @ApiBadRequestResponse({ description: 'O curso já está publicado' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  @ApiUnprocessableEntityResponse({
    description:
      'Curso sem módulo ativo com aula ativa, ou categoria/instrutor inativos',
  })
  publish(@Param('id', idPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.publish(id, user);
  }

  @Patch(':id/unpublish')
  @RequirePermissions('courses:unpublish')
  @ApiOperation({ summary: 'Despublicar curso' })
  @ApiOkResponse({ description: 'Curso despublicado' })
  @ApiBadRequestResponse({ description: 'O curso não está publicado' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  unpublish(@Param('id', idPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.unpublish(id, user);
  }

  @Delete(':id')
  @RequirePermissions('courses:delete')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir curso' })
  @ApiNoContentResponse({ description: 'Curso excluído' })
  @ApiConflictResponse({ description: 'Curso com matrículas ativas' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  delete(@Param('id', idPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.delete(id, user);
  }
}
