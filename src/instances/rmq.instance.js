const { ipcMain, BrowserWindow, Notification } = require('electron');
const amqp = require('amqp-connection-manager');
const config = require('../config/config');
const logger = require('../config/logger');

const url = config.get('rmq');
const connection = amqp.connect(url);

connection.on('connectFailed', (err) => {
  ipcMain.removeAllListeners('check-rmq');
  ipcMain.on('check-rmq', () => {
    const window = BrowserWindow.getAllWindows()[0];
    window.webContents.send('rmq-status', { status: 'error', error: err });
  });
  logger.error(`Failed to connect to RabbitMQ :>> ${JSON.stringify(err)}`);
});
connection.on('disconnect', (err) => {
  ipcMain.removeAllListeners('check-rmq');
  ipcMain.on('check-rmq', () => {
    const window = BrowserWindow.getAllWindows()[0];
    window.webContents.send('rmq-status', { status: 'error', error: err });
  });
  logger.error(`Disconnected from RabbitMQ :>> ${JSON.stringify(err)}`);
});
connection.on('error', (err) => {
  ipcMain.removeAllListeners('check-rmq');
  ipcMain.on('check-rmq', () => {
    const window = BrowserWindow.getAllWindows()[0];
    window.webContents.send('rmq-status', { status: 'error', error: err });
  });
  logger.error(`Error from RabbitMQ :>> ${JSON.stringify(err)}`);
});
connection.on('connect', () => {
  ipcMain.removeAllListeners('check-rmq');
  ipcMain.on('check-rmq', () => {
    const window = BrowserWindow.getAllWindows()[0];
    window.webContents.send('rmq-status', { status: 'success' });
  });

  const NOTIFICATION_TITLE = 'RahatDesktop Aktif';
  const NOTIFICATION_BODY = 'Sistem kanalına başarıyla bağlanıldı.';
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show();

  logger.info('Connected to RabbitMQ');
});

module.exports = connection;
