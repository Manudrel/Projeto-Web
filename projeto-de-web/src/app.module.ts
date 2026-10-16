import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CoursesModule } from './modules/courses/courses.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { CourseModulesModule } from './modules/course-modules/course-modules.module.js';

@Module({
  imports: [
    CoursesModule,
    DatabaseModule,
    AuthModule,
    CategoriesModule,
    CourseModulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
