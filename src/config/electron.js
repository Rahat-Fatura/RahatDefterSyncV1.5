const { app, BrowserWindow, ipcMain } = require('electron');
const AutoLaunch = require('auto-launch');
const config = require('./config');
const logger = require('./logger');
const electronConfig = require('../electron');
const consumers = require('./rmq.consumers');

const isMac = process.platform === 'darwin';
if (isMac) app.dock.hide();
const appAutoLauncher = new AutoLaunch({ name: 'Rahat Defter Synchronization' });

const fadeIn = (window) => {
  let opacity = 0.1;
  const interval = setInterval(() => {
    opacity += 0.01;
    window.setOpacity(opacity);
    if (opacity >= 1) {
      clearInterval(interval);
    }
  }, 10);
};

const fadeOutAndFadeIn = (outWindow, inWindow) => {
  let opacity = 1;
  const interval = setInterval(() => {
    opacity -= 0.01;
    outWindow.setOpacity(opacity);
    if (opacity <= 0) {
      clearInterval(interval);
      outWindow.close();
      inWindow.show();
      inWindow.setOpacity(0);
      let newOpacity = 0.1;
      const interval2 = setInterval(() => {
        newOpacity += 0.01;
        inWindow.setOpacity(newOpacity);
        if (newOpacity >= 1) {
          clearInterval(interval2);
        }
      }, 10);
    }
  }, 10);
};

let mainWindow;
const initialize = (expressApp) => {
  expressApp.set('AutoLauncher', appAutoLauncher);
  app.setName('RahatDesktop');
  app.whenReady().then(async () => {
    const splashWindow = electronConfig.createSplashWindow();
    fadeIn(splashWindow);
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
    logger.on('data', (data) => {
      mainWindow.webContents.send('log-stream', JSON.stringify(data));
    });
    setTimeout(() => {
      fadeOutAndFadeIn(splashWindow, mainWindow);
    }, 3000);
  });
  app.on('before-quit', () => {
    mainWindow.removeAllListeners('close');
  });

  ipcMain.on('save-settings', async (event, data) => {
    try {
      const { url, uuid, port, rmq, path, excludeKeys, autoLaunch } = data;
      if (url) config.set('url', url);
      if (uuid) config.set('uuid', uuid);
      if (port) config.set('port', port);
      if (rmq) config.set('rmq', rmq);
      if (path) config.set('path', path.replaceAll(/\\/g, '/'));
      if (excludeKeys) config.set('excludeKeys', excludeKeys.replaceAll(/\\/g, '/'));
      if (autoLaunch === 'active') {
        if (!(await appAutoLauncher.isEnabled())) appAutoLauncher.enable();
      } else if (autoLaunch === 'deactive') {
        if (await appAutoLauncher.isEnabled()) appAutoLauncher.disable();
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
