import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// 讀取根目錄的 .env
dotenv.config({ path: join(process.cwd(), '.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [join(process.cwd(), 'apps/backend/src/**/*.entity{.ts,.js}')],
  migrations: [join(process.cwd(), 'apps/backend/src/database/migrations/*{.ts,.js}')],
  synchronize: false,
});