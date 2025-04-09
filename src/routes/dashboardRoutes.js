const express = require('express');
const router = express.Router();
const { getTopupDashboardInfo, getAdminDashboardInfo, getUserDashboardInfo } = require('../controllers/dashboardController');

router.get('/topup-dashboard', getTopupDashboardInfo);
router.get('/admin-dashboard', getAdminDashboardInfo);
router.post('/user-dashboard', getUserDashboardInfo);

module.exports = router;