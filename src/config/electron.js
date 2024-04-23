const { app, BrowserWindow, ipcMain } = require('electron');
const AutoLaunch = require('auto-launch');

const config = require('./config');
const electronConfig = require('../electron');
const consumers = require('./rmq.consumers');

const isMac = process.platform === 'darwin';
if (isMac) app.dock.hide();
const appAutoLauncher = new AutoLaunch({ name: 'Rahat Defter Synchronization' });

let mainWindow;
const initialize = (expressApp) => {
  expressApp.set('AutoLauncher', appAutoLauncher);
  app.setName('RahatDesktop');
  app.whenReady().then(async () => {
    mainWindow = electronConfig.createWindow();
    electronConfig.createTray(mainWindow);
    electronConfig.createMenu(mainWindow);
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        electronConfig.createWindow();
      }
    });
    electronConfig.ipcListeners(mainWindow);
    consumers.consumeTunnel();
  });
  app.on('before-quit', () => {
    mainWindow.removeAllListeners('close');
  });

  ipcMain.on('save-settings', (event, data) => {
    try {
      const { url, uuid, port, rmq, path, autoLaunch } = data;
      if (url) config.set('url', url);
      if (uuid) config.set('uuid', uuid);
      if (port) config.set('port', port);
      if (rmq) config.set('rmq', rmq);
      if (path) config.set('path', path);
      if (autoLaunch) {
        if (autoLaunch === 'true') appAutoLauncher.enable();
        else appAutoLauncher.disable();
      }
      mainWindow.webContents.send('settings-saved', { status: 'success' });
    } catch (error) {
      mainWindow.webContents.send('settings-saved', { status: 'error', error });
    }
  });
};

module.exports = {
  initialize,
  mainWindow,
};
