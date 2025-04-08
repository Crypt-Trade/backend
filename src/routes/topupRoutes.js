const express = require("express");
const router = express.Router();
const { registerTopup, loginTopup, transferFromAdminToTopup, getTopupWalletHistory } = require("../controllers/topupController");

router.post("/register", registerTopup);
router.post("/login", loginTopup);
router.post("/transfer", transferFromAdminToTopup);
router.get("/wallet-history", getTopupWalletHistory);

module.exports = router;