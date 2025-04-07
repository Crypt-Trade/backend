const WalletPoints = require("../models/WalletPoints");

const calculateWeekelyPayout = async () => {
    try {
        const todayDate = new Date();

        const users = await WalletPoints.find();
        for (const user of users) {

            const { directPoints = {}, currentWeekPoints = {}, supportivePoints = {}, walletBalance } = user;
            const directleftPoints = Number(directPoints.leftPoints) || 0;
            const directrightPoints = Number(directPoints.rightPoints) || 0;
            const leftTeamPoints = Number(currentWeekPoints.leftPoints) || 0;
            const rightTeamPoints = Number(currentWeekPoints.rightPoints) || 0;

            if (leftTeamPoints === 0 || rightTeamPoints === 0) {
                console.log("Payout is not available");
                continue;
            }

            let teamSalesBonus = 0; // Declare before use
            if (leftTeamPoints >= rightTeamPoints) {
                user.supportivePoints.leftPoints = leftTeamPoints - rightTeamPoints;
                user.supportivePoints.rightPoints = 0; // Reset right BV
                teamSalesBonus = (rightTeamPoints * 0.1).toFixed(2);
            } else {
                user.supportivePoints.rightPoints = rightTeamPoints - leftTeamPoints;
                user.supportivePoints.leftPoints = 0;
                teamSalesBonus = (leftTeamPoints * 0.1).toFixed(2);
            }

            const totalDirectBonus = directleftPoints + directrightPoints;
            const directSalesBonus = (totalDirectBonus * 0.1).toFixed(2);
            const totalAmount = Number(directSalesBonus) + Number(teamSalesBonus);
            const tds = Number((totalAmount * 0.05).toFixed(2));
            const payoutAmount = Number((totalAmount - tds).toFixed(1));
            const matchedPoints = Math.min(leftTeamPoints, rightTeamPoints);
            const weeklyPoints = totalDirectBonus + matchedPoints;

            user.currentWeekPoints.leftPoints = supportivePoints.leftPoints;
            user.currentWeekPoints.rightPoints = supportivePoints.rightPoints;

            user.directPoints.leftPoints = 0;
            user.directPoints.rightPoints = 0;

            user.walletBalance = Number(user.walletBalance) + payoutAmount;

            console.log("Weekly payout calculated successfully.");

            user.weeklyEarnings.push({
                week: todayDate,
                matchedPoints,
                directSalesBonus,
                teamSalesBonus,
                weeklyPoints,
                tds,
                payoutAmount,
            });
            await user.save();
        }
    } catch (err) {
        console.error("Error calculating weekly payout:", err);
        return false;
    }
};


async function getWeeklyEarningsByUserId(req, res) {
    try {
        const { userId } = req.body;
    
        if (!userId) {
          return res.status(400).json({ message: "userId is required." });
        }
    
        const wallet = await WalletPoints.findOne({ userId });
    
        if (!wallet) {
          return res.status(404).json({ message: "Wallet data not found for this user." });
        }
    
        res.status(200).json({
          message: "Weekly earnings fetched successfully.",
          weeklyEarnings: wallet.weeklyEarnings
        });
    
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}


module.exports = { calculateWeekelyPayout, getWeeklyEarningsByUserId };