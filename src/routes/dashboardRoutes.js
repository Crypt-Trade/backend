const express = require('express');
const router = express.Router();
const { getTopupDashboardInfo, getAdminDashboardInfo, getUserDashboardInfo } = require('../controllers/dashboardController');
const protect = require('../middleware/authMiddleware');

router.get('/topup-dashboard', protect, getTopupDashboardInfo);
router.get('/admin-dashboard', getAdminDashboardInfo);
router.post('/user-dashboard', getUserDashboardInfo);

module.exports = router;