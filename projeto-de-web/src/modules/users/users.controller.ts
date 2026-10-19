import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ListUsersDto } from './dto/list-users.dto.js';
import {
  PaginatedUsersResponseDto,
  UserMessageResponseDto,
  UserResponseDto,
} from './dto/user-response.dto.js';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { UsersService } from './users.service.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número inteiro.'),
});

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Listar usuários com paginação e filtros' })
  @ApiOkResponse({ type: PaginatedUsersResponseDto })
  @ApiBadRequestResponse({ description: 'Filtros inválidos.' })
  @ApiForbiddenResponse({ description: 'Apenas ADMIN pode listar usuários.' })
  @ApiUnauthorizedResponse({ description: 'Access token inválido ou expirado.' })
  findAll(@Query() filters: ListUsersDto) {
    return this.usersService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por id' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'O id deve ser um número inteiro.' })
  @ApiForbiddenResponse({ description: 'Acesso permitido ao ADMIN ou ao próprio usuário.' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Access token inválido ou expirado.' })
  findById(
    @Param('id', idPipe) id: number,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.usersService.findById(id, actor);
  }

  @Post()
  @RequirePermissions('users:create')
  @ApiOperation({ summary: 'Criar usuário' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou perfil inativo.' })
  @ApiConflictResponse({ description: 'E-mail já cadastrado.' })
  @ApiForbiddenResponse({ description: 'Apenas ADMIN pode criar usuários.' })
  @ApiNotFoundResponse({ description: 'Perfil não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Access token inválido ou expirado.' })
  create(@Body() data: CreateUserDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.usersService.create(data, actor);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados do usuário' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou nenhum campo informado.' })
  @ApiConflictResponse({ description: 'E-mail já cadastrado ou último ADMIN ativo.' })
  @ApiForbiddenResponse({ description: 'Acesso permitido ao ADMIN ou ao próprio usuário.' })
  @ApiNotFoundResponse({ description: 'Usuário ou perfil não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Access token inválido ou expirado.' })
  update(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.usersService.update(id, data, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('users:delete')
  @ApiOperation({ summary: 'Excluir usuário usando soft delete' })
  @ApiNoContentResponse({ description: 'Usuário excluído.' })
  @ApiConflictResponse({ description: 'Não é possível excluir o último ADMIN ativo.' })
  @ApiForbiddenResponse({ description: 'Apenas ADMIN pode excluir e não pode excluir a si mesmo.' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Access token inválido ou expirado.' })
  delete(@Param('id', idPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.usersService.delete(id, actor);
  }

  @Patch(':id/status')
  @RequirePermissions('users:status')
  @ApiOperation({ summary: 'Ativar ou inativar usuário' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Status inválido.' })
  @ApiConflictResponse({ description: 'Não é possível inativar o último ADMIN ativo.' })
  @ApiForbiddenResponse({ description: 'Apenas ADMIN pode alterar status e não pode inativar a si mesmo.' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Access token inválido ou expirado.' })
  updateStatus(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateUserStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.usersService.updateStatus(id, data.status, actor);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Alterar senha própria ou redefinir senha como ADMIN' })
  @ApiOkResponse({ type: UserMessageResponseDto })
  @ApiBadRequestResponse({ description: 'Senha atual incorreta, igual à nova senha ou dados inválidos.' })
  @ApiForbiddenResponse({ description: 'Acesso permitido ao ADMIN ou ao próprio usuário.' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Access token inválido ou expirado.' })
  updatePassword(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateUserPasswordDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.usersService.updatePassword(id, data, actor);
  }
}
