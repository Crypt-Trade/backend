const UserOrders = require("../models/UserOrders");
const User = require("../models/User");
const Topup = require('../models/Topup');
const MonthlyReward = require('../models/MonthlyReward');
const { addPersonalPoints, addPointsToAncestors } = require("../controllers/walletController");
const { s3Client, PutObjectCommand } = require('../utils/s3Bucket');

async function createOrder(req, res) {
    try {
        const { user_object_id, user_mySponsor_id, user_name, order_price, package_name } = req.body;
        if (!user_object_id || !user_mySponsor_id || !user_name || !order_price || !package_name) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required.' });
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
        const imageUrl = await uploadToS3(req.file, 'user-documents');
        const newOrder = await UserOrders.create({
            user_details: { user_object_id, user_mySponsor_id, user_name },
            order_details: { order_price },
            package_name,
            image_url: imageUrl
        });
        res.status(201).json({ message: "Order created successfully", order: newOrder });
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
            "order_details.order_no": order_no
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
            return res.status(400).json({ message: "Insufficient wallet balance in topup account." });
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

        if (parseFloat(order_price) !== 25) {
            user.isActive = true;
            user.activeDate = new Date();
            user.subcription = order.package_name;
            await user.save();
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

        // Create MonthlyReward if conditions match
        if (order.package_name === "Premium" && parseFloat(order_price) === 1000) {

            await MonthlyReward.create({
                user_name: user.name,
                user_mySponsor_id: mySponsorId,
                order_price: parseFloat(order_price),
                package_name: order.package_name,
                rewards: []  // Initially empty; will be populated monthly
            });
        }


        res.json({ message: "Order status updated and points assigned successfully", order });

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
            return res.status(400).json({ message: "Insufficient wallet balance in topup account." });
        }

        if (parseFloat(order_price) !== 25) {
            // Update user status
            user.isActive = true;
            user.activeDate = new Date();
            user.subcription = package_name;
            await user.save();
        }

        // Create new approved order
        const newOrder = new UserOrders({
            user_details: {
                user_object_id: user._id,
                user_mySponsor_id: user.mySponsorId,
                user_name: user.name
            },
            order_details: {
                order_price: amount
            },
            package_name,
            status: "approved",
            image_url: null
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
            "order_details.order_price": order_price
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Create MonthlyReward if conditions match
        if (order.package_name === "Premium" && parseFloat(order_price) === 1000) {

            await MonthlyReward.create({
                user_name: user.name,
                user_mySponsor_id: mySponsorId,
                order_price: parseFloat(order_price),
                package_name,
                rewards: []  // Initially empty; will be populated monthly
            });
        }

        res.status(200).json({
            message: "User activated, order created, and points assigned successfully.",
            order: newOrder
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
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

async function addMonthlyRewards(req, res) {
    try {
        const allRewards = await MonthlyReward.find();

        for (const rewardDoc of allRewards) {
            const amount = (rewardDoc.order_price * 3) / 100;

            const todayFormatted = formatDateToDDMMYYYY(new Date());

            // Prevent duplicate entries for the same date
            const alreadyExists = rewardDoc.rewards.some(
                (entry) => entry.date === todayFormatted
            );
            if (alreadyExists) continue;

            rewardDoc.rewards.push({
                date: todayFormatted,
                amount,
                status: 'pending'
            });

            await rewardDoc.save();
        }
        console.log('monthly reward calculate successfully');

    } catch (error) {
        console.error('Error adding monthly rewards:', error);
    }
}


module.exports = { createOrder, updateOrderStatus, getAllOrders, getAprrovedOrders, createApprovedOrderAndActivateUser, addMonthlyRewards };