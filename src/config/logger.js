const winston = require('winston');
const path = require('path');
const { app } = require('electron');
require('winston-daily-rotate-file');

const logsPath = path.join(app.getPath('userData'), '/logs');

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    // process.env.NODE_ENV === 'production' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf((info) => `${info.timestamp} || ${info.level}: ${info.message}`),
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
    new winston.transports.DailyRotateFile({
      filename: `${logsPath}/combined-%DATE%.log`,
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '5m',
      maxFiles: '90d',
    }),
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: `${logsPath}/error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d',
    }),
    new winston.transports.DailyRotateFile({
      level: 'info',
      filename: `${logsPath}/info-%DATE%.log`,
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '5m',
      maxFiles: '90d',
    }),
  ],
});

module.exports = logger;
