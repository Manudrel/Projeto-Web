import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { AssessmentsService } from './assessments.service.js';
import { CreateAssessmentAttemptDto } from './dto/create-assessment-attempt.dto.js';
import { CreateAssessmentDto } from './dto/create-assessment.dto.js';
import { ListAssessmentsDto } from './dto/list-assessments.dto.js';
import { UpdateAssessmentDto } from './dto/update-assessment.dto.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@ApiTags('Avaliações')
@ApiBearerAuth()
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) { }

  @Get()
  @RequirePermissions('assessments:read')
  @ApiOperation({ summary: 'Listar avaliações cadastradas' })
  @ApiOkResponse({ description: 'Lista de avaliações retornada com sucesso' })
  @ApiBadRequestResponse({ description: 'Filtros de busca inválidos' })
  findAll(@Query() filters: ListAssessmentsDto) {
    return this.assessmentsService.findAll(filters);
  }

  @Get(':id')
  @RequirePermissions('assessments:read')
  @ApiOperation({ summary: 'Buscar avaliação por id' })
  @ApiOkResponse({ description: 'Avaliação encontrada com sucesso' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  @ApiNotFoundResponse({ description: 'Avaliação não encontrada' })
  findById(@Param('id', idPipe) id: number) {
    return this.assessmentsService.findById(id);
  }

  @Post()
  @RequirePermissions('assessments:create')
  @ApiOperation({ summary: 'Criar nova avaliação para um curso ou módulo' })
  @ApiCreatedResponse({ description: 'Avaliação criada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados de criação inválidos' })
  @ApiNotFoundResponse({ description: 'Curso ou módulo não encontrado' })
  @ApiForbiddenResponse({
    description: 'Apenas o instrutor responsável pelo curso ou administrador pode criar avaliações',
  })
  @ApiUnprocessableEntityResponse({
    description: 'O módulo informado não pertence ao curso indicado ou o tipo exige moduleId',
  })
  create(@Body() data: CreateAssessmentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.assessmentsService.create(data, user);
  }

  @Patch(':id')
  @RequirePermissions('assessments:update')
  @ApiOperation({ summary: 'Atualizar avaliação existente' })
  @ApiOkResponse({ description: 'Avaliação atualizada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou id inválido' })
  @ApiNotFoundResponse({ description: 'Avaliação ou módulo não encontrado' })
  @ApiForbiddenResponse({
    description: 'Apenas o instrutor responsável pelo curso ou administrador pode alterar avaliações',
  })
  @ApiUnprocessableEntityResponse({
    description: 'O módulo informado não pertence ao curso da avaliação',
  })
  update(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateAssessmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assessmentsService.update(id, data, user);
  }

  @Post(':id/attempts')
  @RequirePermissions('assessments:attempt')
  @ApiOperation({ summary: 'Registrar tentativa de avaliação (aluno)' })
  @ApiCreatedResponse({ description: 'Tentativa registrada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou id inválido' })
  @ApiNotFoundResponse({ description: 'Avaliação ou matrícula não encontrada' })
  @ApiForbiddenResponse({
    description: 'Apenas o aluno dono da matrícula ou administrador pode realizar a tentativa',
  })
  @ApiConflictResponse({
    description: 'Esta avaliação já foi aprovada anteriormente para este aluno',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'A matrícula não está ativa, não pertence ao curso da avaliação ou o limite de tentativas foi atingido',
  })
  createAttempt(
    @Param('id', idPipe) id: number,
    @Body() data: CreateAssessmentAttemptDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assessmentsService.createAttempt(id, data, user);
  }

  @Get(':id/attempts')
  @RequirePermissions('assessments:read')
  @ApiOperation({ summary: 'Listar tentativas de uma avaliação' })
  @ApiOkResponse({ description: 'Tentativas listadas com sucesso' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  @ApiForbiddenResponse({
    description:
      'Apenas o instrutor responsável pelo curso, o próprio aluno ou administrador pode consultar tentativas',
  })
  @ApiNotFoundResponse({ description: 'Avaliação não encontrada' })
  findAttempts(
    @Param('id', idPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assessmentsService.findAttempts(id, user);
  }
}
