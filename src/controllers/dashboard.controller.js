const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');

const getDashboardPage = async (req, res) => {
  return res.render('pages/dashboard', {
    page: {
      name: 'dashboard',
      display: 'Kontrol Paneli',
      menu: 'dashboard',
      uppermenu: 'dashboard',
    },
  });
};

const getSettingsPage = catchAsync(async (req, res) => {
  return res.render('pages/settings', {
    page: {
      name: 'settings',
      display: 'Ayarlar',
      menu: 'settings',
      uppermenu: 'settings',
    },
    uuid: config.get('uuid'),
    url: config.get('url').length,
    rmq: config.get('rmq').length,
    port: config.get('port'),
    path: config.get('path'),
    autoLaunch: await req.app.get('AutoLauncher').isEnabled(),
  });
});

module.exports = {
  getDashboardPage,
  getSettingsPage,
};
