import path from 'path';

import consoleStamp from 'console-stamp';
import { format, createLogger, transports } from 'winston';
import dailyRotateFileTransport from 'winston-daily-rotate-file';

consoleStamp(console);

const env = process.env.NODE_ENV || 'development';
const logDir = process.env.LOG_DIR || path.resolve(__dirname, '../logs/');

const debugLevel = parseInt(process.env.DEBUG);
const logLevel = debugLevel === 1 ? 'verbose' : debugLevel === 2 ? 'debug' : 'info';

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.align(),
  format.colorize(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

function buildTransports() {
  let transportList = [];

  transportList.push(
    new dailyRotateFileTransport({
      filename: 'streamersdev-%DATE%.log',
      dirname: logDir,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      createSymlink: true,
      symlinkName: 'streamersdev.log',
    })
  );

  if (env !== 'production' || debugLevel) {
    transportList.push(
      new transports.Console({
        format: logFormat,
      })
    );
  }

  return transportList;
}

// Don't instantiate dailyRotateFileTransport on Vercel, since it will fail trying to mkdir the log directory
const logger = process.env.USE_WINSTON
  ? createLogger({
      level: process.env.LOG_LEVEL || logLevel,
      format: logFormat,
      transports: buildTransports(),
    })
  : {
      info: (...args) => console.info(...args),
      debug: (...args) => console.debug(...args),
      verbose: (...args) => process.env.DEBUG > 1 && console.debug(...args),
      warn: (...args) => console.warn(...args),
      error: (...args) => console.error(...args),
    };

export default logger;
