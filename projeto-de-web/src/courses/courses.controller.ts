import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { ListCourseModulesDto } from './dto/list-course-modules.dto.js';
import { ListCourseStudentsDto } from './dto/list-course-students.dto.js';
import { ListCoursesDto } from './dto/list-courses.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(@Query() filters: ListCoursesDto) {
    return this.coursesService.findAll(filters);
  }

  @Get(':id')
  findById(@Param('id', idPipe) id: number) {
    return this.coursesService.findById(id);
  }

  @Get(':id/modules')
  findModules(
    @Param('id', idPipe) id: number,
    @Query() filters: ListCourseModulesDto,
  ) {
    return this.coursesService.findModules(id, filters);
  }

  @Get(':id/students')
  findStudents(
    @Param('id', idPipe) id: number,
    @Query() filters: ListCourseStudentsDto,
  ) {
    return this.coursesService.findStudents(id, filters);
  }

  @Post()
  create(@Body() data: CreateCourseDto) {
    return this.coursesService.create(data);
  }

  @Patch(':id')
  update(@Param('id', idPipe) id: number, @Body() data: UpdateCourseDto) {
    return this.coursesService.update(id, data);
  }

  @Patch(':id/publish')
  publish(@Param('id', idPipe) id: number) {
    return this.coursesService.publish(id);
  }

  @Patch(':id/unpublish')
  unpublish(@Param('id', idPipe) id: number) {
    return this.coursesService.unpublish(id);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', idPipe) id: number) {
    return this.coursesService.delete(id);
  }
}
