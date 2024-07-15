const connection = require('../instances/rmq.instance');
const config = require('./config');
const logger = require('./logger');
const bookService = require('../services/book.service');

const consumeTunnel = async () => {
  logger.info('rmq-consumer :>> Started consuming tunnel');
  const queue = config.get('uuid');
  const channel = connection.createChannel({
    json: true,
    setup: (cha) => {
      return cha.assertQueue(queue, { durable: true });
    },
  });

  channel.consume(queue, async (data) => {
    const msg = data.content.toString();
    logger.info(`rmq-consumer :>> Received  message -> ${msg}`);
    bookService.checkAndSendAllFilesFromPath(config.get('path').split(';'));
    return channel.ack(data);
  });
};

module.exports = { consumeTunnel };
