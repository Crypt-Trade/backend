const User = require('../models/User');
const UserOrders = require("../models/UserOrders");
const WithdrawalOrders = require('../models/WithdrawalOrders');
const WalletPoints = require('../models/WalletPoints');
const WalletDetails = require('../models/WalletDetails');
const Ranking = require('../models/Ranking');
const MonthlyReward = require('../models/MonthlyReward');
const ScholarshipOrders = require('../models/ScholarshipOrders');


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

// Ranking System
const rankList = [
    { points: 100, name: "Starter Rank" },
    { points: 600, name: "Master Rank" },
    { points: 1600, name: "Bronze Rank" },
    { points: 4100, name: "Silver Rank" },
    { points: 9100, name: "Gold Rank" },
    { points: 16600, name: "Crystal Rank" },
    { points: 26600, name: "Sapphire Rank" },
    { points: 41600, name: "Ruby Rank" },
    { points: 61600, name: "Platinum Rank" },
    { points: 86600, name: "Diamond Rank" },
    { points: 136600, name: "Black Diamond Rank" },
    { points: 236600, name: "Millionaire Club Rank" },
    { points: 436600, name: "Tycoon Rank" },
    { points: 736600, name: "Unicorn Rank" },
    { points: 1236600, name: "Cryptrade King" }
];

async function addOrUpdateRanking(req, res) {
    try {
        const { mysponsorid } = req.body;

        const user = await User.findOne({ mySponsorId: mysponsorid });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const wallet = await WalletPoints.findOne({ mySponsorId: mysponsorid });
        if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

        const matchingPoints = Math.min(wallet.totalPoints.leftPoints, wallet.totalPoints.rightPoints);

        // Determine all eligible ranks
        const earnedRanks = rankList.filter(rank => matchingPoints >= rank.points);

        if (earnedRanks.length === 0) {
            return res.status(200).json({ message: 'No rank achieved yet' });
        }

        let userRank = await Ranking.findOne({ mysponsorid });

        if (!userRank) {
            // If no rank record exists, create one with all eligible ranks
            const rankingDetails = earnedRanks.map(rank => ({
                matching_points: rank.points,
                rank_name: rank.name,
                status: 'unclaimed'
            }));

            userRank = await Ranking.create({
                name: user.name,
                mysponsorid,
                userid: user._id,
                ranking_details: rankingDetails
            });
        } else {
            // If rank record exists, add only the missing eligible ranks
            const existingRankNames = userRank.ranking_details.map(r => r.rank_name);

            const newRanks = earnedRanks
                .filter(rank => !existingRankNames.includes(rank.name))
                .map(rank => ({
                    matching_points: rank.points,
                    rank_name: rank.name,
                    status: 'unclaimed'
                }));

            if (newRanks.length > 0) {
                userRank.ranking_details.push(...newRanks);
                await userRank.save();
            }
        }

        res.status(200).json({ message: 'Ranks evaluated and updated', userRank });

    } catch (error) {
        console.error('Error in ranking API:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Get All Rankings
async function getAllRankings(req, res) {
    try {
        // Populate user info if needed
        const rankings = await Ranking.find()
            .populate('userid', 'name email mySponsorId')  // Adjust fields as needed
            .sort({ "ranking_details.0.matching_points": -1 });  // Sort by top rank points if needed

        res.status(200).json({ rankings });
    } catch (error) {
        console.error('Error fetching all rankings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Update Rank Status
async function updateRankStatus(req, res) {
    try {
        const { mysponsorid, rank_name, status } = req.body;

        if (!mysponsorid || !rank_name || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find ranking document by sponsor ID
        const rankingDoc = await Ranking.findOne({ mysponsorid });

        if (!rankingDoc) {
            return res.status(404).json({ message: 'Ranking not found for this sponsor ID' });
        }

        // Find the rank entry inside the ranking_details array
        const rankEntry = rankingDoc.ranking_details.find(r => r.rank_name === rank_name);

        if (!rankEntry) {
            return res.status(404).json({ message: 'Rank not found for this user' });
        }

        // Update the status
        rankEntry.status = status;

        await rankingDoc.save();

        res.status(200).json({ message: `Rank status updated successfully`, ranking: rankingDoc });

    } catch (error) {
        console.error('Error updating rank status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

//Create Scholorship Order
async function createScholarshipOrder(req, res) {
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

        const wallet = await MonthlyReward.findOne({ mySponsorId: sponsorId });
        if (!wallet) return res.status(404).json({ message: "Wallet not found." });

        if (wallet.reward_points < amount) {
            return res.status(400).json({ message: "Insufficient wallet balance." });
        }

        // // Deduct amount logic if needed:
        // wallet.walletBalance -= amount;
        // await wallet.save();

        const scholarshipOrder = new ScholarshipOrders({
            user_details: {
                user_object_id: user._id,
                user_mySponsor_id: user.mySponsorId,
                user_name: user.name
            },
            order_details: {
                scholarship_amount: amount
            },
            status: "pending"
        });

        await scholarshipOrder.save();

        res.status(201).json({
            message: "Scholarship order placed successfully.",
            scholarshipOrder
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


module.exports = {
    handleGetAllReferrals,
    getOrdersBySponsorId,
    createWithdrawalOrder,
    getAllWithdrawalOrdersbyId,
    getWalletAddressBySponsorId,
    getMonthlyRewardsBySponsorId,
    addOrUpdateRanking,
    getAllRankings,
    updateRankStatus,
    createScholarshipOrder
}