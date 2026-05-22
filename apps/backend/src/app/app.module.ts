import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { ChordProModule } from '../chordpro/chordpro.module';

@Module({
  imports: [
    // 讀取 .env 並在全域可用
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 資料庫連線模組
    DatabaseModule,

    // ChordPro 解析模組
    ChordProModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}