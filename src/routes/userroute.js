const express = require('express');
const { handleGetAllReferrals, getOrdersBySponsorId, createWithdrawalOrder, getAllWithdrawalOrdersbyId, getWalletAddressBySponsorId, getMonthlyRewardsBySponsorId } = require ("../controllers/userController")
const router = express.Router();


router.post('/directreffers', handleGetAllReferrals);
router.post('/orderhistory', getOrdersBySponsorId);
router.post('/withdrawal-request', createWithdrawalOrder);
router.post('/get-walletorders-byid', getAllWithdrawalOrdersbyId);
router.post('/get-wallet-address', getWalletAddressBySponsorId);
router.get('/rewards/:sponsorId', getMonthlyRewardsBySponsorId);


module.exports = router;