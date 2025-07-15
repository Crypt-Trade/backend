const UserOrders = require("../models/UserOrders");
const User = require("../models/User");
const Topup = require("../models/Topup");
const MonthlyReward = require("../models/MonthlyReward");
const {
    addPersonalPoints,
    addPointsToAncestors,
} = require("../controllers/walletController");
const { s3Client, PutObjectCommand } = require("../utils/s3Bucket");

async function createOrder(req, res) {
    try {
        const {
            user_object_id,
            user_mySponsor_id,
            user_name,
            order_price,
            package_name,
        } = req.body;
        if (
            !user_object_id ||
            !user_mySponsor_id ||
            !user_name ||
            !order_price ||
            !package_name
        ) {
            return res
                .status(400)
                .json({ message: "Please provide all required fields" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "Image is required." });
        }
        const uploadToS3 = async (file, keyPrefix) => {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `${keyPrefix}/${Date.now()}_${file.originalname}`,
                Body: file.buffer,
                ContentType: file.mimetype,
            };
            await s3Client.send(new PutObjectCommand(params));
            return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
        };
        const imageUrl = await uploadToS3(req.file, "user-documents");
        const newOrder = await UserOrders.create({
            user_details: { user_object_id, user_mySponsor_id, user_name },
            order_details: { order_price },
            package_name,
            image_url: imageUrl,
        });
        res
            .status(201)
            .json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const { mySponsorId, order_no, order_price } = req.body;

        if (!mySponsorId || !order_no || !order_price) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Find the order by sponsor ID and order number
        const order = await UserOrders.findOne({
            "user_details.user_mySponsor_id": mySponsorId,
            "order_details.order_no": order_no,
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const amount = parseFloat(order_price);

        // 2. Find the Topup user and check balance
        const topupUser = await Topup.findOne(); // Use specific identifier if needed
        if (!topupUser) {
            return res.status(404).json({ message: "Topup user not found" });
        }

        if (topupUser.walletBalance < amount) {
            return res
                .status(400)
                .json({ message: "Insufficient wallet balance in topup account." });
        }

        // // Update the status field
        // order.status = "approved";
        // await order.save();

        // Fetch the user using mySponsorId
        const user = await User.findOne({ mySponsorId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the status field
        order.status = "approved";
        await order.save();

        if (parseFloat(order_price) !== 20) {
            user.isActive = true;
            user.activeDate = new Date();
            user.subcription = order.package_name;
            await user.save();
        } else {
            // Fetch the most recent MonthlyReward for the user
            const latestRewardDoc = await MonthlyReward.findOne({ user_mySponsor_id: mySponsorId })
                .sort({ order_date: -1 });

            if (latestRewardDoc) {
                latestRewardDoc.order_date = new Date(); // Update with current date
                await latestRewardDoc.save();
            }
        }

        // Assign points
        await addPersonalPoints(user, order_price);
        await addPointsToAncestors(user, order_price);

        // 5. Deduct from Topup user's wallet balance
        // const topupUser = await Topup.findOne(); // use correct identifier
        // if (!topupUser) {
        //     return res.status(404).json({ message: "Topup user not found" });
        // }

        // const amount = parseFloat(order_price);
        // if (topupUser.walletBalance < amount) {
        //     return res.status(400).json({ message: "Insufficient wallet balance in topup account." });
        // }

        // Deduct and log history
        topupUser.walletBalance -= amount;

        await topupUser.save();

        // Define valid packages and their prices
        const validPackages = [
            { name: "Kick Starter", price: 50 },
            { name: "Bull Starter", price: 100 },
            { name: "Whales Starter", price: 500 },
            { name: "Premium Master Trader Course", price: 1000 },
            { name: "Bull Master Trader Course", price: 2000 },
            { name: "Whales Master Trader Course", price: 5000 },
        ];

        // Check if the current package and price are valid
        const isValidPackage = validPackages.some(
            (pkg) =>
                pkg.name.toLowerCase() === order.package_name.toLowerCase() &&
                pkg.price === parseFloat(order_price)
        );

        if (isValidPackage) {
            await MonthlyReward.create({
                user_name: user.name,
                user_mySponsor_id: mySponsorId,
                order_price: parseFloat(order_price),
                package_name: order.package_name,
                rewards: [], // reward_points will be handled later
            });
        }

        res.json({
            message: "Order status updated and points assigned successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//update user without order id
async function createApprovedOrderAndActivateUser(req, res) {
    try {
        const { mySponsorId, package_name, order_price } = req.body;

        if (!mySponsorId || !package_name || !order_price) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const user = await User.findOne({ mySponsorId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const amount = parseFloat(order_price);

        const topupUser = await Topup.findOne();
        if (!topupUser || topupUser.walletBalance < amount) {
            return res
                .status(400)
                .json({ message: "Insufficient wallet balance in topup account." });
        }

        if (parseFloat(order_price) !== 20) {
            user.isActive = true;
            user.activeDate = new Date();
            user.subcription = package_name;
            await user.save();
        } else {
            // Fetch the most recent MonthlyReward for the user
            const latestRewardDoc = await MonthlyReward.findOne({ user_mySponsor_id: mySponsorId })
                .sort({ order_date: -1 });

            if (latestRewardDoc) {
                latestRewardDoc.order_date = new Date(); // Update with current date
                await latestRewardDoc.save();
            }
        }

        // Create new approved order
        const newOrder = new UserOrders({
            user_details: {
                user_object_id: user._id,
                user_mySponsor_id: user.mySponsorId,
                user_name: user.name,
            },
            order_details: {
                order_price: amount,
            },
            package_name,
            status: "approved",
            image_url: null,
        });

        await newOrder.save();

        // Deduct from topup balance
        topupUser.walletBalance -= amount;
        await topupUser.save();

        // Assign points
        await addPersonalPoints(user, order_price);
        await addPointsToAncestors(user, order_price);

        // Find the order by sponsor ID and order number
        const order = await UserOrders.findOne({
            "user_details.user_mySponsor_id": mySponsorId,
            "order_details.order_price": order_price,
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Define valid packages and their prices
        const validPackages = [
            { name: "Kick Starter", price: 50 },
            { name: "Bull Starter", price: 100 },
            { name: "Whales Starter", price: 500 },
            { name: "Premium Master Trader Course", price: 1000 },
            { name: "Bull Master Trader Course", price: 2000 },
            { name: "Whales Master Trader Course", price: 5000 },
        ];

        // Check if the current package and price are valid
        const isValidPackage = validPackages.some(
            (pkg) =>
                pkg.name.toLowerCase() === order.package_name.toLowerCase() &&
                pkg.price === parseFloat(order_price)
        );

        if (isValidPackage) {
            await MonthlyReward.create({
                user_name: user.name,
                user_mySponsor_id: mySponsorId,
                order_price: parseFloat(order_price),
                package_name: order.package_name,
                rewards: [], // reward_points will be handled later
            });
        }

        res.status(200).json({
            message:
                "User activated, order created, and points assigned successfully.",
            order: newOrder,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getAllOrders(req, res) {
    try {
        const orders = await UserOrders.find(); // Fetch all orders

        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found." });
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function getAprrovedOrders(req, res) {
    try {
        const orders = await UserOrders.find({ status: "approved" }); // Fetch all orders
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

function formatDateToDDMMYYYY(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

// function formatDateToDDMMYYYY(date) {
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
// }

function isWithinValidity(orderDate, monthsValid) {
    const now = new Date();
    const expiryDate = new Date(orderDate);
    expiryDate.setMonth(expiryDate.getMonth() + monthsValid);
    return now <= expiryDate;
}

async function addMonthlyRewards(req, res) {
    try {
        const allRewards = await MonthlyReward.find();

        const rewardPercentages = {
            "Kick Starter": { percent: 3, validity: 1 },
            "Bull Starter": { percent: 5, validity: 3 },
            "Whales Starter": { percent: 8, validity: 12 },
            "Premium Master Trader Course": { percent: 10 },
            "Bull Master Trader Course": { percent: 12 },
            "Whales Master Trader Course": { percent: 15 },
        };

        const todayFormatted = formatDateToDDMMYYYY(new Date());

        for (const rewardDoc of allRewards) {
            const packageName = rewardDoc.package_name.toLowerCase();
            const config = rewardPercentages[packageName];
            if (!config) continue;

            // Check validity if applicable
            if (config.validity && !isWithinValidity(new Date(rewardDoc.order_date), config.validity)) {
                continue;
            }

            // Prevent duplicate entry for today
            const alreadyExists = rewardDoc.rewards.some(
                (entry) => entry.date === todayFormatted
            );
            if (alreadyExists) continue;

            const amount = (rewardDoc.order_price * config.percent) / 100;

            rewardDoc.rewards.push({
                date: todayFormatted,
                amount,
                status: "pending",
            });

            rewardDoc.reward_points += amount;

            await rewardDoc.save();
        }

        console.log("✅ Monthly rewards updated successfully");
        if (res) return res.status(200).json({ message: "Monthly rewards updated." });

    } catch (error) {
        console.error("❌ Error adding monthly rewards:", error);
        if (res) return res.status(500).json({ message: "Internal server error" });
    }
}


module.exports = {
    createOrder,
    updateOrderStatus,
    getAllOrders,
    getAprrovedOrders,
    createApprovedOrderAndActivateUser,
    addMonthlyRewards,
};
