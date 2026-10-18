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
import { ProgressModule } from './modules/progress/progress.module.js';
import { PermissionsModule } from './modules/permissions/permissions.module.js';
import { CertificatesModule } from './modules/certificates/certificates.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    LessonsModule,
    AuthModule,
    CategoriesModule,
    CourseModulesModule,
    ProgressModule,
    UsersModule,
    PermissionsModule,
    CertificatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}