import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { AssessmentsService } from './assessments.service.js';
import { CreateAssessmentAttemptDto } from './dto/create-assessment-attempt.dto.js';
import { CreateAssessmentDto } from './dto/create-assessment.dto.js';
import { ListAssessmentsDto } from './dto/list-assessments.dto.js';
import { UpdateAssessmentDto } from './dto/update-assessment.dto.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) { }

  @Get()
  findAll(@Query() filters: ListAssessmentsDto) {
    return this.assessmentsService.findAll(filters);
  }

  @Get(':id')
  findById(@Param('id', idPipe) id: number) {
    return this.assessmentsService.findById(id);
  }

  @Post()
  create(@Body() data: CreateAssessmentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.assessmentsService.create(data, user);
  }

  @Patch(':id')
  update(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateAssessmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assessmentsService.update(id, data, user);
  }

  @Post(':id/attempts')
  createAttempt(
    @Param('id', idPipe) id: number,
    @Body() data: CreateAssessmentAttemptDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assessmentsService.createAttempt(id, data, user);
  }

  @Get(':id/attempts')
  findAttempts(
    @Param('id', idPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assessmentsService.findAttempts(id, user);
  }
}
