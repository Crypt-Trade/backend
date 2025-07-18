const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');
const WalletPoints = require("../models/WalletPoints");
const WithdrawalOrders = require('../models/WithdrawalOrders');
const User = require('../models/User');
const MonthlyReward = require('../models/MonthlyReward');
const ScholarshipOrders = require('../models/ScholarshipOrders');

// Admin Registration
async function registerAdmin(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new admin
    const newAdmin = await Admin.create({ email, password });

    res.status(201).json({ message: 'Admin registered successfully', admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Admin Login
async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find the admin in the database
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Compare password
    const isPasswordMatch = await admin.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Generate and return token
    const token = generateToken({ id: admin._id, email: admin.email, role: 'admin' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function addWalletBalance(req, res) {
  try {
    const { email, password, amount } = req.body;

    if (!email || !password || !amount) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0]; // HH:MM:SS

    admin.walletBalance += parseFloat(amount);
    admin.walletHistory.push({ amount: parseFloat(amount), date, time });

    await admin.save();

    res.status(200).json({
      message: "Wallet balance updated successfully.",
      walletBalance: admin.walletBalance,
      walletHistory: admin.walletHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getAdminWalletHistory(req, res) {
  try {
    const adminUser = await Admin.findOne(); // Finds the first (and only) topup user

    if (!adminUser) {
      return res.status(404).json({ message: "Topup user not found." });
    }

    res.status(200).json({
      message: "Wallet history fetched successfully.",
      walletHistory: adminUser.walletHistory
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//all users all weekly earnings.
async function getAllWeeklyEarnings(req, res) {
  try {
    const wallets = await WalletPoints.find({}, { mySponsorId: 1, weeklyEarnings: 1, _id: 0 });

    if (!wallets || wallets.length === 0) {
      return res.status(404).json({ message: "No weekly earnings data found." });
    }

    res.status(200).json({
      message: "All users' weekly earnings fetched successfully.",
      data: wallets
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getAllWithdrawalOrders(req, res) {
  try {
    const orders = await WithdrawalOrders.find().sort({ createdAt: -1 }); // newest first (optional)

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No withdrawal orders found." });
    }

    res.status(200).json({
      message: "Withdrawal orders fetched successfully.",
      totalOrders: orders.length,
      withdrawalOrders: orders
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//withdrawal orders status update
async function updateWithdrawalOrderStatus(req, res) {
  try {
    const { user_mySponsor_id, order_no, amount, status } = req.body;

    if (!user_mySponsor_id || !order_no || !amount || !status) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find the specific withdrawal order
    const order = await WithdrawalOrders.findOne({
      "user_details.user_mySponsor_id": user_mySponsor_id,
      "order_details.order_no": order_no
    });

    if (!order) {
      return res.status(404).json({ message: "Withdrawal order not found." });
    }

    if (Number(order.order_details.withdrawal_amount) !== Number(amount)) {
      return res.status(400).json({ message: "Amount mismatch." });
    }

    // Update the status
    order.status = status;
    await order.save();

    if (status == "approved") {
      // Deduct amount
      const wallet = await WalletPoints.findOne({ mySponsorId: user_mySponsor_id });
      wallet.walletBalance -= amount;
      await wallet.save();
    }

    res.status(200).json({
      message: "Withdrawal order status updated successfully.",
      updatedOrder: order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//get all monthly rewards
async function getAllMonthlyRewards(req, res) {
  try {
    const rewards = await MonthlyReward.find().sort({ order_date: -1 }); // Most recent first
    res.status(200).json({ rewards });
  } catch (error) {
    console.error("Error fetching monthly rewards:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//update status to paid of scholorship
async function updateRewardStatus(req, res) {
  try {
    const { user_mySponsor_id, date } = req.body;

    if (!user_mySponsor_id || !date) {
      return res.status(400).json({ message: 'user_name and date are required' });
    }

    const rewardDoc = await MonthlyReward.findOne({ user_mySponsor_id });

    if (!rewardDoc) {
      return res.status(404).json({ message: 'Monthly reward not found for this user' });
    }

    const rewardEntry = rewardDoc.rewards.find(entry => entry.date === date);

    if (!rewardEntry) {
      return res.status(404).json({ message: 'No reward found for the specified date' });
    }

    rewardEntry.status = 'paid';
    await rewardDoc.save();

    res.status(200).json({ message: 'Reward status updated to paid', reward: rewardEntry });
  } catch (error) {
    console.error('Error updating reward status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

//Approve scholarship order
async function updateScholarshipOrderStatus(req, res) {
  try {
    const { user_mySponsor_id, order_no, amount, status } = req.body;

    if (!user_mySponsor_id || !order_no || !amount || !status) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find the specific scholarship order
    const order = await ScholarshipOrders.findOne({
      "user_details.user_mySponsor_id": user_mySponsor_id,
      "order_details.order_no": order_no
    });

    if (!order) {
      return res.status(404).json({ message: "Scholarship order not found." });
    }

    if (Number(order.order_details.scholarship_amount) !== Number(amount)) {
      return res.status(400).json({ message: "Amount mismatch." });
    }

    // Update the status
    // order.status = status;
    // await order.save();

    if (status === "approved") {
      // Deduct reward points
      const rewardWallet = await MonthlyReward.findOne({ user_mySponsor_id }).sort({ order_date: -1 });

      if (!rewardWallet) {
        return res.status(404).json({ message: "Reward wallet not found." });
      }

      if (rewardWallet.reward_points < amount) {
        return res.status(400).json({ message: "Insufficient reward points." });
      }

      rewardWallet.reward_points -= amount;
      await rewardWallet.save();

      order.status = status;
      await order.save();
    }

    res.status(200).json({
      message: "Scholarship order status updated successfully.",
      updatedOrder: order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Export all Scholorship Orders
async function getScholarshipOrders(req, res) {
  console.log("Fetching scholarship orders...");
  try {
    const { sponsorId } = req.body;

    let query = {};
    if (sponsorId) {
      query = { "user_details.user_mySponsor_id": sponsorId };
    }

    const orders = await ScholarshipOrders.find(query);

    res.status(200).json({
      message: "Scholarship orders fetched successfully.",
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Error fetching scholarship orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


module.exports = {
  registerAdmin,
  loginAdmin,
  addWalletBalance,
  getAdminWalletHistory,
  getAllWeeklyEarnings,
  getAllWithdrawalOrders,
  updateWithdrawalOrderStatus,
  getAllMonthlyRewards,
  updateRewardStatus,
  updateScholarshipOrderStatus,
  getScholarshipOrders
};