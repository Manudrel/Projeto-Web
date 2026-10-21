import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Knex } from 'knex';

const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
if (existsSync(envPath)) process.loadEnvFile(envPath);

const config: Knex.Config = {
  client: 'pg',
  connection: process.env.DATABASE_URL ?? {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  migrations: {
    directory: fileURLToPath(new URL('./migrations', import.meta.url)),
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
  seeds: {
    directory: fileURLToPath(new URL('./seeds', import.meta.url)),
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
};

export default config;
