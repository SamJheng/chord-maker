import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { join } from 'path';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>('NODE_ENV') !== 'production';

        return {
          pinoHttp: {
            // 開發：漂亮的彩色格式；正式：JSON
            transport: isDev
              ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
              : {
                  targets: [
                    // console（JSON）
                    { target: 'pino/file', options: { destination: 1 }, level: 'info' },
                    // 寫入 log 檔
                    {
                      target: 'pino/file',
                      options: {
                        destination: join(process.cwd(), 'apps/backend/logs/app.log'),
                        mkdir: true,
                      },
                      level: 'info',
                    },
                    // 錯誤單獨寫一份，方便追蹤
                    {
                      target: 'pino/file',
                      options: {
                        destination: join(process.cwd(), 'apps/backend/logs/error.log'),
                        mkdir: true,
                      },
                      level: 'error',
                    },
                  ],
                },

            // 自動記錄每個 request
            autoLogging: true,

            // 自訂 request log 欄位
            customProps: () => ({ context: 'HTTP' }),
            serializers: {
              req(req: any) {
                return {
                  method: req.method,
                  url: req.url,
                  query: req.query,
                };
              },
              res(res: any) {
                return { statusCode: res.statusCode };
              },
            },

            // 等級：開發 debug，正式 info
            level: isDev ? 'debug' : 'info',
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}

// 全域 Exception Filter（讓 NestJS DI 系統管理）
export const LoggerProviders = [
  { provide: APP_FILTER, useClass: AllExceptionsFilter },
];
