import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CourseModulesModule } from './course-modules/course-modules.module.js';

@Module({
  imports: [CourseModulesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
