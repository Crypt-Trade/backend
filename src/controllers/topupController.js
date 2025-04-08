const Topup = require('../models/Topup');
const Admin = require('../models/Admin');
const bcrypt = require("bcrypt");

// Register Topup User

async function registerTopup(req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await Topup.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Topup user already exists." });
    }

    const newTopup = new Topup({ email, password });
    await newTopup.save();

    res.status(201).json({ message: "Topup user registered successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login Topup User
async function loginTopup(req, res) {
  try {
    const { email, password } = req.body;

    const topupUser = await Topup.findOne({ email });

    if (!topupUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (topupUser.password !== password) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    res.status(200).json({ message: "Login successful.", topupUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function transferFromAdminToTopup(req, res) {
  try {
    const { topupEmail, topupPassword, amount } = req.body;

    if (!topupEmail || !topupPassword || !amount) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const admin = await Admin.findOne({ email: topupEmail });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const isMatch = await admin.comparePassword(topupPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }


    // Fetch admin (assuming only one admin)
    const topupUser = await Topup.findOne();
    if (!topupUser) {
      return res.status(404).json({ message: "Topup User not found." });
    }

    if (admin.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient admin wallet balance." });
    }

    // Time and date for history
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    // Deduct from admin
    admin.walletBalance -= parseFloat(amount);
    await admin.save();

    // Add to topup user
    topupUser.walletBalance += parseFloat(amount);
    topupUser.walletHistory.push({ amount: parseFloat(amount), date, time });
    await topupUser.save();

    res.status(200).json({ message: "Transfer successful." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


async function getTopupWalletHistory(req, res) {
  try {
    const topupUser = await Topup.findOne(); // Finds the first (and only) topup user

    if (!topupUser) {
      return res.status(404).json({ message: "Topup user not found." });
    }

    res.status(200).json({
      message: "Wallet history fetched successfully.",
      walletHistory: topupUser.walletHistory
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}



module.exports = {
  registerTopup,
  loginTopup,
  transferFromAdminToTopup,
  getTopupWalletHistory
};