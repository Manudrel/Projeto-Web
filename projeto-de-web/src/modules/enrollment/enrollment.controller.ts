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
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { ListEnrollmentsDto } from './dto/list-enrollments.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';
import { EnrollmentService } from './enrollment.service.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número inteiro'),
});

@ApiTags('Matrículas')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get()
  @ApiOperation({ summary: 'Listar matrículas' })
  @ApiOkResponse({ description: 'Lista de matrículas' })
  @ApiBadRequestResponse({ description: 'Filtros inválidos' })
  findAll(@Query() filters: ListEnrollmentsDto) {
    return this.enrollmentService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar matrícula por id' })
  @ApiOkResponse({ description: 'Matrícula encontrada' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número inteiro' })
  @ApiNotFoundResponse({ description: 'Matrícula não encontrada' })
  findById(@Param('id', idPipe) id: number) {
    return this.enrollmentService.findById(id);
  }

  @Post()
  @RequirePermissions('enrollments:create')
  @ApiOperation({ summary: 'Criar matrícula' })
  @ApiCreatedResponse({ description: 'Matrícula criada' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiForbiddenResponse({ description: 'Apenas instrutores e administradores podem criar matrículas' })
  create(
    @Body() data: CreateEnrollmentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.enrollmentService.create(data, actor);
  }

  @Patch(':id/cancel')
  @RequirePermissions('enrollments:cancel')
  @ApiOperation({ summary: 'Cancelar matrícula ativa' })
  @ApiOkResponse({
    description:
      'Matrícula cancelada; status passa para CANCELLED e deletedAt registra o horário',
  })
  @ApiBadRequestResponse({
    description: 'Somente matrículas ACTIVE podem ser canceladas',
  })
  @ApiNotFoundResponse({ description: 'Matrícula não encontrada' })
  @ApiForbiddenResponse({ description: 'Apenas instrutores e administradores podem cancelar matrículas' })
  cancel(
    @Param('id', idPipe) id: number,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.enrollmentService.cancel(id, actor);
  }

  @Patch(':id')
  @RequirePermissions('enrollments:update')
  @ApiOperation({ summary: 'Atualizar matrícula' })
  @ApiOkResponse({ description: 'Matrícula atualizada' })
  @ApiBadRequestResponse({
    description:
      'Dados inválidos; CANCELLED deve ser definido pela rota /:id/cancel',
  })
  @ApiNotFoundResponse({ description: 'Matrícula não encontrada' })
  @ApiForbiddenResponse({ description: 'Apenas instrutores e administradores podem atualizar matrículas' })
  update(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateEnrollmentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.enrollmentService.update(id, data, actor);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir matrícula' })
  @ApiNoContentResponse({ description: 'Matrícula excluída' })
  @ApiBadRequestResponse({
    description: 'A matrícula precisa estar com status CANCELLED',
  })
  @ApiNotFoundResponse({ description: 'Matrícula não encontrada' })
  @ApiForbiddenResponse({ description: 'Apenas instrutores e administradores podem excluir matrículas' })
  delete(
    @Param('id', idPipe) id: number,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.enrollmentService.delete(id, actor);
  }
}
