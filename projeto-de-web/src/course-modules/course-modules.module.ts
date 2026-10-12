import { Module } from '@nestjs/common';
import knex from 'knex';
import { ModulesController } from './modules.controller.js';
import { ModulesRepository } from './modules.repository.js';
import { ModulesService } from './modules.service.js';

@Module({
  controllers: [ModulesController],
  providers: [
    ModulesService,
    ModulesRepository,
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
export class ModulesModule {}
