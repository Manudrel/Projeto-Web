import { Module } from '@nestjs/common';
import { CourseModulesController } from './course-modules.controller.js';
import { CourseModulesRepository } from './course-modules.repository.js';
import { CourseModulesService } from './course-modules.service.js';

@Module({
  controllers: [CourseModulesController],
  providers: [CourseModulesService, CourseModulesRepository],
})
export class CourseModulesModule { }
