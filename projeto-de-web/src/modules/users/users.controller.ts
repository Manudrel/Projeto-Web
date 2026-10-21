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
  ApiBearerAuth,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ListUsersDto } from './dto/list-users.dto.js';
import { UserMessageResponseDto, UserResponseDto } from './dto/user-response.dto.js';
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
  @ApiOkResponse({ type: [UserResponseDto] })
  @ApiBadRequestResponse({ description: 'Filtros ou paginação inválidos' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Sem permissão para listar usuários' })
  findAll(@Query() filters: ListUsersDto) {
    return this.usersService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por id' })
  @ApiOkResponse({ type: UserResponseDto })
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
  @ApiConflictResponse({ description: 'E-mail já cadastrado.' })
  create(@Body() data: CreateUserDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.usersService.create(data, actor);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar dados do usuário',
    description:
      'O próprio usuário pode alterar nome e e-mail. ADMIN com users:update também pode alterar outros usuários e perfis.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiConflictResponse({ description: 'E-mail já cadastrado ou último ADMIN ativo.' })
  @ApiForbiddenResponse({
    description: 'Acesso restrito ao proprietário ou a ADMIN com users:update.',
  })
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
  delete(@Param('id', idPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.usersService.delete(id, actor);
  }

  @Patch(':id/status')
  @RequirePermissions('users:status')
  @ApiOperation({ summary: 'Ativar ou inativar usuário' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiConflictResponse({ description: 'Não é possível inativar o último ADMIN ativo.' })
  updateStatus(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateUserStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.usersService.updateStatus(id, data.status, actor);
  }

  @Patch(':id/password')
  @ApiOperation({
    summary: 'Alterar senha própria ou redefinir senha como ADMIN',
    description:
      'O próprio usuário informa a senha atual. ADMIN com users:password pode alterar a senha de outro usuário.',
  })
  @ApiOkResponse({ type: UserMessageResponseDto })
  @ApiForbiddenResponse({
    description: 'Acesso restrito ao proprietário ou a ADMIN com users:password.',
  })
  updatePassword(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateUserPasswordDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.usersService.updatePassword(id, data, actor);
  }
}
