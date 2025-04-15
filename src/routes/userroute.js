const express = require('express');
const { handleGetAllReferrals, getOrdersBySponsorId, createWithdrawalOrder, getAllWithdrawalOrdersbyId, getWalletAddressBySponsorId } = require ("../controllers/userController")
const router = express.Router();


router.post('/directreffers', handleGetAllReferrals);
router.post('/orderhistory', getOrdersBySponsorId);
router.post('/withdrawal-request', createWithdrawalOrder);
router.post('/get-walletorders-byid', getAllWithdrawalOrdersbyId);
router.post('/get-wallet-address', getWalletAddressBySponsorId);


module.exports = router;