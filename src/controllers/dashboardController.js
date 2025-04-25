const Topup = require('../models/Topup');
const UserOrders = require('../models/UserOrders');
const User = require('../models/User');
const Admin = require('../models/Admin');
const WalletPoints = require("../models/WalletPoints");

async function getTopupDashboardInfo(req, res) {
    try {

        const topupUser = await Topup.findOne({});

        if (!topupUser) {
            return res.status(404).json({ message: "Topup user not found." });
        }

        // Calculate total from wallet history
        const totalWalletHistoryAmount = topupUser.walletHistory.reduce((total, item) => {
            return total + (item.amount || 0);
        }, 0);

        // Get current month range
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // Fetch all approved orders from current month
        const currentMonthOrders = await UserOrders.find({
            "order_details.order_date": {
                $gte: startDate,
                $lt: endDate
            },
            status: "approved"
        });

        const monthlyBusiness = currentMonthOrders.reduce((total, order) => {
            return total + (order.order_details.order_price || 0);
        }, 0);

        const allOrders = await UserOrders.find({
            status: "approved"
        });

        const allBusiness = allOrders.reduce((total, order) => {
            return total + (order.order_details.order_price || 0);
        }, 0);

        const totalUsers = await User.countDocuments();
        const totalActiveUsers = await User.countDocuments({ isActive: true });

        res.status(200).json({
            message: "Dashboard info fetched successfully.",
            available_Balance: topupUser.walletBalance,
            total_Balance: totalWalletHistoryAmount,
            monthlyBusiness,
            allBusiness,
            totalUsers,
            totalActiveUsers
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//Admin Dashboard
async function getAdminDashboardInfo(req, res) {
    try {

        const adminUser = await Admin.findOne({});

        if (!adminUser) {
            return res.status(404).json({ message: "Topup user not found." });
        }

        // Calculate total from wallet history
        const totalWalletHistoryAmount = adminUser.walletHistory.reduce((total, item) => {
            return total + (item.amount || 0);
        }, 0);

        // Get current month range
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // Fetch all approved orders from current month
        const currentMonthOrders = await UserOrders.find({
            "order_details.order_date": {
                $gte: startDate,
                $lt: endDate
            },
            status: "approved"
        });

        const monthlyBusiness = currentMonthOrders.reduce((total, order) => {
            return total + (order.order_details.order_price || 0);
        }, 0);

        const allOrders = await UserOrders.find({
            status: "approved"
        });

        const allBusiness = allOrders.reduce((total, order) => {
            return total + (order.order_details.order_price || 0);
        }, 0);

        const totalUsers = await User.countDocuments();
        const allUsers = await User.find({});
        const totalActiveUsers = await User.countDocuments({ isActive: true });

        res.status(200).json({
            message: "Dashboard info fetched successfully.",
            available_Balance: adminUser.walletBalance,
            total_Balance: totalWalletHistoryAmount,
            monthlyBusiness,
            allBusiness,
            totalUsers,
            allUsers,
            totalActiveUsers
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//User Dashboard
async function getUserDashboardInfo(req, res) {
    try {
        const { sponsorId } = req.body;

        if (!sponsorId) {
            return res.status(400).json({ message: "sponsorId is required." });
        }

        // Fetch user data by sponsorId
        const user = await User.findOne({ mySponsorId: sponsorId });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Fetch wallet data using mySponsorId from user
        const wallet = await WalletPoints.findOne({ mySponsorId: sponsorId });

        if (!wallet) {
            return res.status(404).json({ message: "Wallet points not found for this user." });
        }

        // Extract direct points
        const leftDirectPoints = wallet.directPoints.leftPoints || 0;
        const rightDirectPoints = wallet.directPoints.rightPoints || 0;

        const totalDirectBonus = leftDirectPoints + rightDirectPoints;
        const instantDirectSalesBonus = Number((totalDirectBonus * 0.1).toFixed(2));

        // Extract team points
        const leftTeamPoints = wallet.currentWeekPoints.leftPoints || 0;
        const rightTeamPoints = wallet.currentWeekPoints.rightPoints || 0;

        const directMatchedPoints = Math.min(leftTeamPoints, rightTeamPoints);
        const instantTeamSalesBonus = Number((directMatchedPoints * 0.1).toFixed(2));

        res.status(200).json({
            message: "User and wallet data fetched successfully.",
            userDetails: user,
            walletDetails: wallet,
            currentDirectPoints: instantDirectSalesBonus,
            currentTeamPoints: instantTeamSalesBonus
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getTopupDashboardInfo,
    getAdminDashboardInfo,
    getUserDashboardInfo
};