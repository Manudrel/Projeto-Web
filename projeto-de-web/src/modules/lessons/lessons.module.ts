import { Module } from '@nestjs/common';
import knex from 'knex';
import { LessonsController } from './lessons.controller.js';
import { LessonsRepository } from './lessons.repository.js';
import { LessonsService } from './lessons.service.js';

@Module({
  controllers: [LessonsController],
  providers: [
    LessonsService,
    LessonsRepository,
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
export class LessonsModule {}