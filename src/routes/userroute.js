const express = require('express');
const { handleGetAllReferrals, getOrdersBySponsorId } = require ("../controllers/userController")
const router = express.Router();


router.post('/directreffers', handleGetAllReferrals);
router.post('/orderhistory', getOrdersBySponsorId);


module.exports = router;