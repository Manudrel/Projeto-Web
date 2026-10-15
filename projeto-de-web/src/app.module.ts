import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CoursesModule } from './modules/courses/courses.module.js';
import { DatabaseModule } from './database/database.module.js';

@Module({
  imports: [CoursesModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
