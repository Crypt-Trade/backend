const express = require("express");
const router = express.Router();


const { calculateWeekelyPayout, getWeeklyEarningsByUserId } = require("../controllers/payoutController");

router.get('/test-weekly-payout', calculateWeekelyPayout);
router.post('/weekly-earnings', getWeeklyEarningsByUserId);

module.exports = router;