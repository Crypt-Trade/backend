const express = require("express");
const router = express.Router();


const { calculateWeekelyPayout } = require("../controllers/payoutController");

router.get('/test-weekly-payout', calculateWeekelyPayout);

module.exports = router;