import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as winstonDailyRotateFile from 'winston-daily-rotate-file';
const transports = {
  console: new winston.transports.Console({
    level: 'silly',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.colorize({
        colors: {
          info: 'blue',
          debug: 'yellow',
          error: 'red',
        },
      }),
      winston.format.printf((info) => {
        const context = info.context;
        // log format will be like this
        // 2022-11-23 20:14:33 [info] [nest-js-poc] [0.0.1] [NestApplication] Nest application successfully started
        return `${info.timestamp} [${info.level}] [${
          process.env.npm_package_name
        }] [${process.env.npm_package_version}]${
          context ? ' [' + context + ']' : ''
        } ${info.message} ${info.stack || ''}`;
      }),
      // winston.format.align(),
    ),
  }),
  combinedFile: new winstonDailyRotateFile({
    dirname: 'logs',
    filename: 'combined',
    extension: '.log',
    level: 'info',
  }),
  errorFile: new winstonDailyRotateFile({
    dirname: 'logs',
    filename: 'error',
    extension: '.log',
    level: 'error',
  }),
};
export const logger = WinstonModule.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports: [
    transports.console,
    transports.combinedFile,
    transports.errorFile,
  ],
});