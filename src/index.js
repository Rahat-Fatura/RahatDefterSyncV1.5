const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const electron = require('./config/electron');

const server = app.listen(config.get('port'), () => {
  logger.info(`Listening to port ${config.get('port')}`);
});

electron.initialize(app, config.get('port'));

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
