const express = require('express');
const { registerAdmin, loginAdmin, addWalletBalance, getAdminWalletHistory, getAllWeeklyEarnings, getAllWithdrawalOrders, updateWithdrawalOrderStatus, getAllMonthlyRewards, updateRewardStatus } = require('../controllers/adminController');
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

module.exports = router;