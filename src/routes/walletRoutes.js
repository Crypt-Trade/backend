const express = require("express");
const router = express.Router();

const { handleSubmitWalletDetails, handleGetwalletCStatus } = require("../controllers/walletController");

router.post('/walletdetails', handleSubmitWalletDetails);
router.get('/wallet-status/:mySponsorId', handleGetwalletCStatus);

module.exports = router;