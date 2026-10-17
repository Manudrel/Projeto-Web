import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex from 'knex';

const KNEX = 'KNEX';

@Global()
@Module({
  providers: [
    {
      provide: KNEX,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        knex({
          client: 'pg',
          connection: {
            host: config.get<string>('DB_HOST', 'localhost'),
            port: Number(config.get<string>('DB_PORT') ?? '5432'),
            user: config.get<string>('DB_USER', 'postgres'),
            password: config.get<string>('DB_PASSWORD', 'password'),
            database: config.get<string>('DB_NAME', 'projeto_web'),
          },
        }),
    },
  ],
  exports: [KNEX],
})
export class DatabaseModule {}
