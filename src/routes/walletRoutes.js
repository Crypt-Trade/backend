const express = require("express");
const router = express.Router();

const { handleSubmitWalletDetails, handleGetwalletCStatus, getRejectedWalletUsers, getApprovedWalletUsers } = require("../controllers/walletController");

router.post('/walletdetails', handleSubmitWalletDetails);
router.get('/wallet-status/:mySponsorId', handleGetwalletCStatus);
router.get('/rejected-users', getRejectedWalletUsers);
router.get('/verified-users', getApprovedWalletUsers);

module.exports = router;