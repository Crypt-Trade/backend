const express = require('express');
const router = express.Router();
const { getTopupDashboardInfo, getAdminDashboardInfo } = require('../controllers/dashboardController');

router.get('/topup-dashboard', getTopupDashboardInfo);
router.get('/admin-dashboard', getAdminDashboardInfo);

module.exports = router;