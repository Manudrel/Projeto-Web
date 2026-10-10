import { Module } from '@nestjs/common';
import knex from 'knex';
import { CursoController } from './curso.controller.js';
import { CursoRepository } from './curso.repository.js';
import { CursoService } from './curso.service.js';

@Module({
  controllers: [CursoController],
  providers: [
    CursoService,
    CursoRepository,
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
export class CursoModule {}
