import { Module } from '@nestjs/common';
import { AssessmentsController } from './assessments.controller.js';
import { AssessmentsRepository } from './assessments.repository.js';
import { AssessmentsService } from './assessments.service.js';

@Module({
  controllers: [AssessmentsController],
  providers: [AssessmentsService, AssessmentsRepository],
  exports: [AssessmentsService, AssessmentsRepository],
})
export class AssessmentsModule { }
