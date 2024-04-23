const winston = require('winston');
const path = require('path');
const { app } = require('electron');

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
    new winston.transports.File({
      filename: path.join(logsPath, 'combined.log'),
    }),
  ],
});

module.exports = logger;
