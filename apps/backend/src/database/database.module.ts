import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from '../songs/song.entity';
// TypeORM 內部用動態 require('pg')，webpack 靜態分析看不到。
// 明確 import 確保 pg 被列入 dist/package.json。
import 'pg';

// 明確列出所有 entity，避免 webpack bundle 後 glob 失效
const entities = [Song];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}