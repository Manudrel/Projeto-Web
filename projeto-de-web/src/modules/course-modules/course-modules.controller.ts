import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Body,
  Patch,
  HttpCode,
  Delete,
  Post,
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
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';

import { ListModulesDto } from './dto/list-modules.dto.js';
import { CourseModulesService } from './course-modules.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { UpdateCourseModuleDto } from './dto/update-course-module.dto.js';
import { CreateCourseModuleDto } from './dto/create-course-module.dto.js';


const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@ApiTags('Módulos')
@ApiBearerAuth()
@Controller('modules')
export class CourseModulesController {
  constructor(private readonly courseModulesService: CourseModulesService) { }

  @Get()
  @RequirePermissions('modules:read')
  @ApiOperation({ summary: 'Listar módulos' })
  @ApiOkResponse({ description: 'Lista de módulos' })
  @ApiBadRequestResponse({ description: 'Filtros inválidos' })
  findAll(@Query() filters: ListModulesDto, @CurrentUser() user: AuthenticatedUser) {
    return this.courseModulesService.findAll(filters, user);
  }

  @Get(':id')
  @RequirePermissions('modules:read')
  @ApiOperation({ summary: 'Buscar módulo por id' })
  @ApiOkResponse({ description: 'Módulo encontrado' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  @ApiNotFoundResponse({ description: 'Módulo não encontrado' })
  findById(@Param('id', idPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.courseModulesService.findById(id, user);
  }


  @Post()
  @RequirePermissions('modules:create')
  @ApiOperation({ summary: 'Criar módulo' })
  @ApiCreatedResponse({ description: 'Módulo criado' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnprocessableEntityResponse({
    description: 'A posição informada deixaria uma lacuna na sequência',
  })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  create(
    @Query('courseId', new ParseIntPipe()) courseId: number,  
    @Body() data: CreateCourseModuleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.courseModulesService.create(courseId,data, user);
  }

  @Patch(':id')
  @RequirePermissions('modules:update')
  @ApiOperation({ summary: 'Atualizar módulo' })
  @ApiOkResponse({ description: 'Módulo atualizado com sucesso' })
  @ApiBadRequestResponse({
    description: 'Dados ou id inválidos',
  })
  @ApiUnprocessableEntityResponse({
    description: 'A posição informada deixaria uma lacuna na sequência',
  })
  @ApiNotFoundResponse({ description: 'Módulo não encontrado' })
  @ApiForbiddenResponse({
    description: 'Apenas o instrutor dono do curso ou administrador pode alterar este módulo',
  })
  update(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateCourseModuleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.courseModulesService.update(id, data, user);
  }

  @Delete(':id')
  @RequirePermissions('modules:delete')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir módulo' })
  @ApiNoContentResponse({ description: 'Módulo excluído com sucesso' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  @ApiNotFoundResponse({ description: 'Módulo não encontrado' })
  @ApiForbiddenResponse({
    description: 'Apenas o instrutor dono do curso ou administrador pode excluir este módulo',
  })
  delete(
    @Param('id', idPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.courseModulesService.delete(id, user);
  }
}
