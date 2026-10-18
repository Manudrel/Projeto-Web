import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { LessonsModule } from './modules/lessons/lessons.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { CourseModulesModule } from './modules/course-modules/course-modules.module.js';
import { ProfilesModule } from './modules/profiles/profiles.module.js';
import { ProgressModule } from './modules/progress/progress.module.js';
import { CoursesModule } from './modules/courses/courses.module.js';
import { AssessmentsModule } from './modules/assessments/assessments.module.js';
import { EnrollmentModule } from './modules/enrollment/enrollment.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CoursesModule,
    EnrollmentModule,
    LessonsModule,
    AuthModule,
    CategoriesModule,
    CourseModulesModule,
    ProgressModule,
    ProfilesModule,
    CoursesModule,
    UsersModule,
    AssessmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}