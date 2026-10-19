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
import { LessonsService } from './lessons.service.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { ListLessonsDto } from './dto/list-lessons.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@ApiTags('Aulas')
@ApiBearerAuth()
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @RequirePermissions('lessons:read')
  @ApiOperation({ summary: 'Listar aulas' })
  @ApiOkResponse({ description: 'Lista de aulas' })
  @ApiBadRequestResponse({ description: 'Filtros inválidos' })
  findAll(@Query() filters: ListLessonsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.lessonsService.findAll(filters, user);
  }

  @Get(':id')
  @RequirePermissions('lessons:read')
  @ApiOperation({ summary: 'Buscar aula por id' })
  @ApiOkResponse({ description: 'Aula encontrada' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  @ApiNotFoundResponse({ description: 'Aula não encontrada' })
  findById(@Param('id', idPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.lessonsService.findById(id, user);
  }

  @Post()
  @RequirePermissions('lessons:create')
  @ApiOperation({ summary: 'Criar aula' })
  @ApiCreatedResponse({ description: 'Aula criada' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou módulo inativo',
  })
  @ApiUnprocessableEntityResponse({
    description: 'A posição informada deixaria uma lacuna na sequência',
  })
  @ApiNotFoundResponse({ description: 'Módulo não encontrado' })
  @ApiConflictResponse({
    description: 'Já existe uma aula com esse título nesse módulo',
  })
  create(@Body() data: CreateLessonDto, @CurrentUser() user: AuthenticatedUser) {
    return this.lessonsService.create(data, user);
  }

  @Patch(':id')
  @RequirePermissions('lessons:update')
  @ApiOperation({ summary: 'Atualizar aula' })
  @ApiOkResponse({ description: 'Aula atualizada' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou módulo inativo',
  })
  @ApiUnprocessableEntityResponse({
    description: 'A posição informada deixaria uma lacuna na sequência',
  })
  @ApiNotFoundResponse({ description: 'Aula ou módulo não encontrados' })
  @ApiConflictResponse({
    description: 'Já existe uma aula com esse título nesse módulo',
  })
  update(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateLessonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.lessonsService.update(id, data, user);
  }

  @Delete(':id')
  @RequirePermissions('lessons:delete')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir aula' })
  @ApiNoContentResponse({ description: 'Aula excluída' })
  @ApiBadRequestResponse({
    description: 'Aula com progresso de alunos',
  })
  @ApiNotFoundResponse({ description: 'Aula não encontrada' })
  delete(@Param('id', idPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.lessonsService.delete(id, user);
  }

}
