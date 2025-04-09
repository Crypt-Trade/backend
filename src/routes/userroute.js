const express = require('express');
const { handleGetAllReferrals, getOrdersBySponsorId, createWithdrawalOrder, getAllWithdrawalOrdersbyId } = require ("../controllers/userController")
const router = express.Router();


router.post('/directreffers', handleGetAllReferrals);
router.post('/orderhistory', getOrdersBySponsorId);
router.post('/withdrawal-request', createWithdrawalOrder);
router.post('/get-walletorders-byid', getAllWithdrawalOrdersbyId);


module.exports = router;