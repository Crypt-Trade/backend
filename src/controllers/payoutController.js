const WalletPoints = require("../models/WalletPoints");

const calculateWeekelyPayout = async () => {
    try {
        const todayDate = new Date();
        const users = await WalletPoints.find();

        for (const user of users) {
            const { directPoints = {}, currentWeekPoints = {}, supportivePoints = {}, walletBalance = 0 } = user;

            const directleftPoints = Number(directPoints.leftPoints) || 0;
            const directrightPoints = Number(directPoints.rightPoints) || 0;
            const leftTeamPoints = Number(currentWeekPoints.leftPoints) || 0;
            const rightTeamPoints = Number(currentWeekPoints.rightPoints) || 0;

            let directSalesBonus = 0;
            let teamSalesBonus = 0;
            let matchedPoints = 0;
            let weeklyPoints = 0;

            const totalDirectBonus = directleftPoints + directrightPoints;

            if (leftTeamPoints === 0 || rightTeamPoints === 0) {
                if (totalDirectBonus === 0) {
                    console.log('Payout is not available');
                    continue;
                }

                directSalesBonus = Number((totalDirectBonus * 0.1).toFixed(2));
                const tds = Number((directSalesBonus * 0.05).toFixed(2));
                const payoutAmount = Number((directSalesBonus - tds).toFixed(2));

                user.directPoints.leftPoints = 0;
                user.directPoints.rightPoints = 0;
                user.walletBalance = Number(walletBalance) + payoutAmount;

                user.weeklyEarnings.push({
                    week: todayDate,
                    matchedPoints: 0,
                    directSalesBonus,
                    teamSalesBonus: 0,
                    weeklyPoints: totalDirectBonus,
                    tds,
                    payoutAmount,
                });

                console.log('Direct payout calculated successfully');
                await user.save();
                continue;
            }

            // Matching logic
            if (leftTeamPoints >= rightTeamPoints) {
                user.supportivePoints.leftPoints = leftTeamPoints - rightTeamPoints;
                user.supportivePoints.rightPoints = 0;
                teamSalesBonus = Number((rightTeamPoints * 0.1).toFixed(2));
            } else {
                user.supportivePoints.rightPoints = rightTeamPoints - leftTeamPoints;
                user.supportivePoints.leftPoints = 0;
                teamSalesBonus = Number((leftTeamPoints * 0.1).toFixed(2));
            }

            directSalesBonus = Number((totalDirectBonus * 0.1).toFixed(2));
            matchedPoints = Math.min(leftTeamPoints, rightTeamPoints);
            weeklyPoints = totalDirectBonus + matchedPoints;

            const totalAmount = directSalesBonus + teamSalesBonus;
            const tds = Number((totalAmount * 0.05).toFixed(2));
            const payoutAmount = Number((totalAmount - tds).toFixed(2));

            // Reset points
            user.currentWeekPoints.leftPoints = user.supportivePoints.leftPoints;
            user.currentWeekPoints.rightPoints = user.supportivePoints.rightPoints;
            user.directPoints.leftPoints = 0;
            user.directPoints.rightPoints = 0;
            user.walletBalance = Number(walletBalance) + payoutAmount;

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
            console.log('Weekly payout calculated successfully');
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