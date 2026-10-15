import { Module } from '@nestjs/common';
import knex from 'knex';
import { CourseModulesController } from './course-modules.controller.js';
import { CourseModulesRepository } from './course-modules.repository.js';
import { CourseModulesService } from './course-modules.service.js';

@Module({
  controllers: [CourseModulesController],
  providers: [
    CourseModulesService,
    CourseModulesRepository,
    {
      provide: 'KNEX',
      useFactory: () =>
        knex({
          client: 'pg',
          connection: {
            host: process.env.DB_HOST ?? 'localhost',
            port: Number(process.env.DB_PORT ?? 5432),
            user: process.env.DB_USER ?? 'postgres',
            password: process.env.DB_PASSWORD ?? 'postgres',
            database: process.env.DB_NAME ?? 'projeto_web',
          },
        }),
    },
  ],
})
export class CourseModulesModule {}
