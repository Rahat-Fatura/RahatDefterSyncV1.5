const Store = require('electron-store');

const schema = {
  url: {
    type: 'string',
    default: 'https://saklama.rahatsistem.com.tr',
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
    default: 'amqp://book_app_user:Kgg8hlFV9F7sUBtO6VJeU1Rh@178.18.243.217:5672/book_coms',
  },
  cron: {
    type: 'boolean',
    default: false,
  },
  path: {
    type: 'string',
    default: '',
  },
  excludeKeys: {
    type: 'string',
    default: '',
  },
};
const config = new Store({ schema });

module.exports = config;
