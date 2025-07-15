const express = require('express');
const { handleGetAllReferrals, getOrdersBySponsorId, createWithdrawalOrder, getAllWithdrawalOrdersbyId, getWalletAddressBySponsorId, getMonthlyRewardsBySponsorId, addOrUpdateRanking, getAllRankings, updateRankStatus, createScholarshipOrder } = require ("../controllers/userController")
const router = express.Router();


router.post('/directreffers', handleGetAllReferrals);
router.post('/orderhistory', getOrdersBySponsorId);
router.post('/withdrawal-request', createWithdrawalOrder);
router.post('/get-walletorders-byid', getAllWithdrawalOrdersbyId);
router.post('/get-wallet-address', getWalletAddressBySponsorId);
router.get('/rewards/:sponsorId', getMonthlyRewardsBySponsorId);
router.post('/ranking', addOrUpdateRanking);
router.get('/all-rankings', getAllRankings);
router.put('/update-rank-status', updateRankStatus);
router.post('/create-scholarship-order', createScholarshipOrder);  // Create scholarship order


module.exports = router;