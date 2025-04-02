const express = require("express");
const router = express.Router();

const { handleSubmitWalletDetails, handleGetwalletCStatus, handleVerifyWalletDetails, handleRejectKYCDetails, handleGetAllNonVerifiedKycUsers } = require("../controllers/walletController");

router.post('/walletdetails', handleSubmitWalletDetails);
router.get('/wallet-status/:mySponsorId', handleGetwalletCStatus);