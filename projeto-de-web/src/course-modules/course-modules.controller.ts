import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ListModulesDto } from './dto/list-modules.dto.js';
import { ModulesService } from './modules.service.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  findAll(@Query() filters: ListModulesDto) {
    return this.modulesService.findAll(filters);
  }

  @Get(':id')
  findById(@Param('id', idPipe) id: number) {
    return this.modulesService.findById(id);
  }
}
