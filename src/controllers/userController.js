const User = require('../models/User');
const UserOrders = require("../models/UserOrders");


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


module.exports = {
    handleGetAllReferrals,
    getOrdersBySponsorId
}