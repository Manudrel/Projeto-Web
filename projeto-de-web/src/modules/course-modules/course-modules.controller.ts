import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Body,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ListModulesDto } from './dto/list-modules.dto.js';
import { CourseModulesService } from './course-modules.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { UpdateCourseModuleDto } from './dto/update-course-module.dto.js';


const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@ApiTags('Módulos')
@Controller('modules')
export class CourseModulesController {
  constructor(private readonly courseModulesService: CourseModulesService) { }

  @Get()
  @ApiOperation({ summary: 'Listar módulos' })
  @ApiOkResponse({ description: 'Lista de módulos' })
  @ApiBadRequestResponse({ description: 'Filtros inválidos' })
  findAll(@Query() filters: ListModulesDto) {
    return this.courseModulesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar módulo por id' })
  @ApiOkResponse({ description: 'Módulo encontrado' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número' })
  @ApiNotFoundResponse({ description: 'Módulo não encontrado' })
  findById(@Param('id', idPipe) id: number) {
    return this.courseModulesService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateCourseModuleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.courseModulesService.update(id, data, user);
  }
}
