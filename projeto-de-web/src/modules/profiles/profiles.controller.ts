import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { CreateProfileDto } from './dto/create-profile.dto.js';
import { ListProfilesDto } from './dto/list-profiles.dto.js';
import { PaginatedProfilesResponseDto, ProfileResponseDto, } from './dto/profile-response.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ProfilesService } from './profiles.service.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@ApiTags('Perfis')
@ApiBearerAuth()
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @RequirePermissions('profiles:read')
  @ApiOperation({ summary: 'Listar perfis' })
  @ApiOkResponse({
    description: 'Lista paginada de perfis',
    type: PaginatedProfilesResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Filtros inválidos' })
  findAll(@Query() filters: ListProfilesDto) {
    return this.profilesService.findAll(filters);
  }

  @Get(':id')
  @RequirePermissions('profiles:read')
  @ApiOperation({ summary: 'Buscar perfil por ID' })
  @ApiOkResponse({
    description: 'Perfil encontrado com sucesso',
    type: ProfileResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Perfil não encontrado' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  findById(@Param('id', idPipe) id: number) {
    return this.profilesService.findById(id);
  }

  @Post()
  @RequirePermissions('profiles:create')
  @ApiOperation({ summary: 'Criar perfil' })
  @ApiCreatedResponse({
    description: 'Perfil criado com sucesso',
    type: ProfileResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({
    description: 'Já existe um perfil com esse nome ou papel',
  })
  create(@Body() data: CreateProfileDto) {
    return this.profilesService.create(data);
  }

  @Patch(':id')
  @RequirePermissions('profiles:update')
  @ApiOperation({ summary: 'Atualizar perfil e vincular/desvincular permissões' })
  @ApiOkResponse({
    description: 'Perfil atualizado com sucesso',
    type: ProfileResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Perfil não encontrado' })
  @ApiBadRequestResponse({ description: 'Dados ou ID inválidos' })
  @ApiConflictResponse({
    description:
      'Nome/papel já em uso ou tentativa de inativar o último admin ativo',
  })
  update(@Param('id', idPipe) id: number, @Body() data: UpdateProfileDto) {
    return this.profilesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('profiles:delete')
  @ApiOperation({ summary: 'Excluir perfil' })
  @ApiNoContentResponse({ description: 'Perfil excluído com sucesso' })
  @ApiNotFoundResponse({ description: 'Perfil não encontrado' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  @ApiConflictResponse({
    description:
      'Perfil possui usuários vinculados ou é o último admin ativo',
  })
  delete(@Param('id', idPipe) id: number) {
    return this.profilesService.delete(id);
  }
}

