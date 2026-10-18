import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CoursesModule } from './modules/courses/courses.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { CourseModulesModule } from './modules/course-modules/course-modules.module.js';
import { ProfilesModule } from './modules/profiles/profiles.module.js';
import { ProgressModule } from './modules/progress/progress.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoursesModule,
    DatabaseModule,
    AuthModule,
    CategoriesModule,
    CourseModulesModule,
    ProgressModule,
    ProfilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
