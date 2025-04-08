const Topup = require('../models/Topup');
const UserOrders = require('../models/UserOrders');
const User = require('../models/User');
const Admin = require('../models/Admin');

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

        res.status(200).json({
            message: "Dashboard info fetched successfully.",
            available_Balance: topupUser.walletBalance,
            total_Balance: totalWalletHistoryAmount,
            monthlyBusiness,
            allBusiness,
            totalUsers
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

        res.status(200).json({
            message: "Dashboard info fetched successfully.",
            available_Balance: adminUser.walletBalance,
            total_Balance: totalWalletHistoryAmount,
            monthlyBusiness,
            allBusiness,
            totalUsers
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getTopupDashboardInfo,
    getAdminDashboardInfo
};