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
import { CreateProgressDto } from './dto/create-progress.dto.js';
import { ListProgressDto } from './dto/list-progress.dto.js';
import { UpdateProgressDto } from './dto/update-progress.dto.js';
import { ProgressService } from './progress.service.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@ApiTags('Progresso')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) { }

  @Get()
  @RequirePermissions('progress:read')
  @ApiOperation({ summary: 'Listar progresso' })
  @ApiOkResponse({ description: 'Lista de progresso retornada com sucesso' })
  @ApiBadRequestResponse({ description: 'Filtros inválidos' })
  findAll(@Query() filters: ListProgressDto, @CurrentUser() user: AuthenticatedUser) {
    return this.progressService.findAll(filters, user);
  }

  @Get(':id')
  @RequirePermissions('progress:read')
  @ApiOperation({ summary: 'Buscar progresso por id' })
  @ApiOkResponse({ description: 'Progresso encontrado com sucesso' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  @ApiNotFoundResponse({ description: 'Progresso não encontrado' })
  @ApiForbiddenResponse({ description: 'Você não tem acesso a este progresso' })
  findById(@Param('id', idPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.progressService.findById(id, user);
  }

  @Post()
  @RequirePermissions('progress:create')
  @ApiOperation({ summary: 'Registrar conclusão de aula' })
  @ApiCreatedResponse({ description: 'Progresso registrado com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Matrícula ou aula não encontrada' })
  @ApiForbiddenResponse({
    description: 'Apenas o aluno dono da matrícula ou administrador pode registrar progresso',
  })
  @ApiUnprocessableEntityResponse({
    description: 'A matrícula precisa estar ativa ou a aula não pertence ao curso da matrícula',
  })
  @ApiConflictResponse({ description: 'Esta aula já foi registrada nesta matrícula' })
  create(@Body() data: CreateProgressDto, @CurrentUser() user: AuthenticatedUser) {
    return this.progressService.create(data, user);
  }

  @Patch(':id')
  @RequirePermissions('progress:update')
  @ApiOperation({ summary: 'Atualizar status de conclusão de aula' })
  @ApiOkResponse({ description: 'Progresso atualizado com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou id inválido' })
  @ApiNotFoundResponse({ description: 'Progresso não encontrado' })
  @ApiForbiddenResponse({
    description: 'Apenas o aluno dono da matrícula ou administrador pode alterar o progresso',
  })
  @ApiUnprocessableEntityResponse({
    description: 'A matrícula precisa estar ativa para alterar o progresso',
  })
  update(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateProgressDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.progressService.update(id, data, user);
  }
}
