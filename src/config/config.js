const Store = require('electron-store');

const schema = {
  url: {
    type: 'string',
    default: 'https://localservice.rahatsistem.com.tr/v1',
  },
  uuid: {
    type: 'string',
    default: '',
  },
  port: {
    type: 'string',
    default: '7782',
  },
  rmq: {
    type: 'string',
    default: 'amqp://localhost',
  },
  cron: {
    type: 'boolean',
    default: false,
  },
  path: {
    type: 'string',
    default: '',
  },
};
const config = new Store({ schema });

module.exports = config;
