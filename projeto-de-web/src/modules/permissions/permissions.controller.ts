import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { ListPermissionsDto } from './dto/list-permissions.dto.js';
import { PaginatedPermissionsResponseDto, PermissionResponseDto, } from './dto/permission-response.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { PermissionsService } from './permissions.service.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@ApiTags('Permissões')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('permissions:read')
  @ApiOperation({ summary: 'Listar permissões' })
  @ApiOkResponse({
    description: 'Lista paginada de permissões',
    type: PaginatedPermissionsResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Filtros inválidos' })
  findAll(@Query() filters: ListPermissionsDto) {
    return this.permissionsService.findAll(filters);
  }

  @Get(':id')
  @RequirePermissions('permissions:read')
  @ApiOperation({ summary: 'Buscar permissão por ID' })
  @ApiOkResponse({
    description: 'Permissão encontrada com sucesso',
    type: PermissionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Permissão não encontrada' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  findById(@Param('id', idPipe) id: number) {
    return this.permissionsService.findById(id);
  }

  @Post()
  @RequirePermissions('permissions:create')
  @ApiOperation({ summary: 'Criar permissão' })
  @ApiCreatedResponse({
    description: 'Permissão criada com sucesso',
    type: PermissionResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({
    description: 'Já existe uma permissão com esse nome',
  })
  create(@Body() data: CreatePermissionDto) {
    return this.permissionsService.create(data);
  }

  @Patch(':id')
  @RequirePermissions('permissions:update')
  @ApiOperation({ summary: 'Atualizar permissão' })
  @ApiOkResponse({
    description: 'Permissão atualizada com sucesso',
    type: PermissionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Permissão não encontrada' })
  @ApiBadRequestResponse({ description: 'Dados ou ID inválidos' })
  @ApiConflictResponse({
    description: 'Já existe uma permissão com esse nome',
  })
  update(@Param('id', idPipe) id: number, @Body() data: UpdatePermissionDto) {
    return this.permissionsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('permissions:delete')
  @ApiOperation({ summary: 'Excluir permissão' })
  @ApiNoContentResponse({ description: 'Permissão excluída com sucesso' })
  @ApiNotFoundResponse({ description: 'Permissão não encontrada' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  @ApiConflictResponse({
    description:
      'Não é possível excluir uma permissão vinculada a algum perfil',
  })
  delete(@Param('id', idPipe) id: number) {
    return this.permissionsService.delete(id);
  }
}

