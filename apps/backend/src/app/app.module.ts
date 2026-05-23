import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { ChordProModule } from '../chordpro/chordpro.module';
import { SongsModule } from '../songs/songs.module';
import { LoggerModule, LoggerProviders } from '../logger';

@Module({
  imports: [
    // 讀取 .env 並在全域可用
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 結構化 log 模組（需在其他模組之前）
    LoggerModule,

    // 資料庫連線模組
    DatabaseModule,

    // ChordPro 解析模組
    ChordProModule,

    // 歌譜 CRUD 模組
    SongsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ...LoggerProviders],
})
export class AppModule {}