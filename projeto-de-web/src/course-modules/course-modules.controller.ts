import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ListModulesDto } from './dto/list-modules.dto.js';
import { CourseModulesService } from './course-modules.service.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@Controller('modules')
export class CourseModulesController {
  constructor(private readonly courseModulesService: CourseModulesService) {}

  @Get()
  findAll(@Query() filters: ListModulesDto) {
    return this.courseModulesService.findAll(filters);
  }

  @Get(':id')
  findById(@Param('id', idPipe) id: number) {
    return this.courseModulesService.findById(id);
  }
}
