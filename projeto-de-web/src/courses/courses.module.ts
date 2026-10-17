import { Module } from '@nestjs/common';
import knex from 'knex';
import { CoursesController } from './courses.controller.js';
import { CoursesRepository } from './courses.repository.js';
import { CoursesService } from './courses.service.js';

@Module({
  controllers: [CoursesController],
  providers: [
    CoursesService,
    CoursesRepository,
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
export class CoursesModule {}
