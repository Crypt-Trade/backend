const User = require('../models/User');
const UserOrders = require("../models/UserOrders");
const WithdrawalOrders = require('../models/WithdrawalOrders');
const WalletPoints = require('../models/WalletPoints');
const WalletDetails = require('../models/WalletDetails');
const MonthlyReward = require('../models/MonthlyReward');


async function handleGetAllReferrals(req, res) {
    try {
        const { sponsorId } = req.body;
        if (!sponsorId) { return res.status(404).json({ message: "Please provide sponsor ID." }); }

        // Find the sponsor
        const user = await User.findOne({ mySponsorId: sponsorId });
        if (!user) { return res.status(404).json({ message: 'User not found' }); }

        // Find all referrals
        const referrals = await User.find({ sponsorId: user.mySponsorId });
        return res.status(200).json(referrals);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}


async function getOrdersBySponsorId(req, res) {
    try {
        const { mySponsorId } = req.body;

        if (!mySponsorId) {
            return res.status(400).json({ message: "mySponsorId is required." });
        }

        const orders = await UserOrders.find({ "user_details.user_mySponsor_id": mySponsorId });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this Sponsor ID." });
        }

        res.status(200).json({ message: "Orders fetched successfully.", orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//user withdrawl
async function createWithdrawalOrder(req, res) {
    try {
        const { sponsorId, amount, password, uniqueKey } = req.body;

        if (!sponsorId || !amount || !password || !uniqueKey) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const user = await User.findOne({ mySponsorId: sponsorId });
        if (!user) return res.status(404).json({ message: "User not found." });

        // Validate account password
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Incorrect account password." });
        }

        // Validate unique key
        if (user.uniqueKey !== uniqueKey) {
            return res.status(401).json({ message: "Incorrect unique key." });
        }

        const wallet = await WalletPoints.findOne({ mySponsorId: sponsorId });
        if (!wallet) return res.status(404).json({ message: "Wallet not found." });

        if (wallet.walletBalance < amount) {
            return res.status(400).json({ message: "Insufficient wallet balance." });
        }

        // // Deduct amount
        // wallet.walletBalance -= amount;
        // await wallet.save();

        const withdrawalOrder = new WithdrawalOrders({
            user_details: {
                user_object_id: user._id,
                user_mySponsor_id: user.mySponsorId,
                user_name: user.name
            },
            order_details: {
                withdrawal_amount: amount
            },
            status: "pending"
        });

        await withdrawalOrder.save();

        res.status(201).json({
            message: "Withdrawal order placed successfully.",
            withdrawalOrder
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// all wallet orders for a particular sponsor id
async function getAllWithdrawalOrdersbyId(req, res) {
    try {
        const { sponsorId } = req.body;
        const orders = await WithdrawalOrders.find({ "user_details.user_mySponsor_id": sponsorId }).sort({ createdAt: -1 });

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

//E- wallet details
async function getWalletAddressBySponsorId(req, res) {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        const walletDetail = await WalletDetails.findOne({ userId: userId });

        if (!walletDetail) {
            return res.status(404).json({ message: "Wallet details not found for this sponsorId." });
        }

        res.status(200).json({
            message: "Wallet address fetched successfully.",
            walletAddress: walletDetail.Walletaddress
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//get all monthly rewards with respect to the sponsorid.
async function getMonthlyRewardsBySponsorId(req, res) {
    try {
        const { sponsorId } = req.params;

        if (!sponsorId) {
            return res.status(400).json({ message: 'Sponsor ID is required' });
        }

        const rewards = await MonthlyReward.find({ user_mySponsor_id: sponsorId }).sort({ order_date: -1 });

        res.status(200).json({ rewards });
    } catch (error) {
        console.error("Error fetching rewards by sponsor ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


module.exports = {
    handleGetAllReferrals,
    getOrdersBySponsorId,
    createWithdrawalOrder,
    getAllWithdrawalOrdersbyId,
    getWalletAddressBySponsorId,
    getMonthlyRewardsBySponsorId
}