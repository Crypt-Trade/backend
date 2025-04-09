const express = require('express');
const { handleGetAllReferrals, getOrdersBySponsorId, createWithdrawalOrder } = require ("../controllers/userController")
const router = express.Router();


router.post('/directreffers', handleGetAllReferrals);
router.post('/orderhistory', getOrdersBySponsorId);
router.post('/withdrawal-request', createWithdrawalOrder);


module.exports = router;