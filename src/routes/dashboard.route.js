const express = require('express');
const { dashboardController } = require('../controllers');

const router = express.Router();

router.get('/', dashboardController.getDashboardPage);
router.get('/settings', dashboardController.getSettingsPage);

module.exports = router;
