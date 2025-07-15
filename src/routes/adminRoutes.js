const express = require('express');
const { registerAdmin, loginAdmin, addWalletBalance, getAdminWalletHistory, getAllWeeklyEarnings, getAllWithdrawalOrders, updateWithdrawalOrderStatus, getAllMonthlyRewards, updateRewardStatus, updateScholarshipOrderStatus, getScholarshipOrders } = require('../controllers/adminController');
const { handleVerifyWalletDetails, handleRejectKYCDetails, handleGetAllNonVerifiedKycUsers } = require("../controllers/walletController");

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

router.post("/approvewalletVerification", handleVerifyWalletDetails);
router.post("/rejectwalletVerification", handleRejectKYCDetails);
router.get("/allnonverifiedwallet", handleGetAllNonVerifiedKycUsers);
router.post("/add-wallet-balance", addWalletBalance);
router.get('/admin-wallet-history', getAdminWalletHistory);
router.get('/all-user-payouts', getAllWeeklyEarnings);
router.get('/get-all-withdrawals', getAllWithdrawalOrders);
router.post('/update-userwallet-status', updateWithdrawalOrderStatus);
router.get('/get-all-monthly-rewards', getAllMonthlyRewards);
router.put('/update-reward-status', updateRewardStatus);
router.post('/update-scholarship-order-status', updateScholarshipOrderStatus); // Update scholarship order status
router.get('/get-scholarship-orders', getScholarshipOrders); // Get all scholarship orders

module.exports = router;