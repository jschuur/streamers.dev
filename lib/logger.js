import path from 'path';
import { format, createLogger, transports } from 'winston';
import dailyRotateFileTransport from 'winston-daily-rotate-file';

const env = process.env.NODE_ENV || 'development';
const logDir = process.env.LOG_DIR || path.resolve(__dirname, '../logs/');

const debugLevel = parseInt(process.env.DEBUG);
const logLevel = debugLevel === 1 ? 'verbose' : debugLevel === 2 ? 'debug' : 'info';

var transport_list = [
  new dailyRotateFileTransport({
    filename: 'streamersdev-%DATE%.log',
    dirname: logDir,
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    createSymlink: true,
    symlinkName: 'streamersdev.log',
  }),
];

if (env !== 'production' || debugLevel) {
  transport_list.push(
    new transports.Console({
      format: logFormat,
    })
  );
}

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.align(),
  format.colorize(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || logLevel,
  format: logFormat,
  transports: transport_list,
});

export default logger;
