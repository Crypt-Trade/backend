const express = require('express');
const { registerAdmin, loginAdmin } = require('../controllers/adminController');
const { handleVerifyWalletDetails, handleRejectKYCDetails, handleGetAllNonVerifiedKycUsers } = require("../controllers/walletController");

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

router.post("/approvewalletVerification", handleVerifyWalletDetails);
router.post("/rejectwalletVerification", handleRejectKYCDetails);
router.get("/allnonverifiedwallet", handleGetAllNonVerifiedKycUsers);

module.exports = router;