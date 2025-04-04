const express = require("express");
const router = express.Router();
const { registerTopup, loginTopup, transferFromAdminToTopup } = require("../controllers/topupController");

router.post("/register", registerTopup);
router.post("/login", loginTopup);
router.post("/transfer", transferFromAdminToTopup);

module.exports = router;