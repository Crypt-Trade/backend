const mongoose = require("mongoose");

// Generate a unique 5-digit order number
const generateUniqueOrderNumber = async function () {
    let orderNumber;
    let isUnique = false;

    while (!isUnique) {
        orderNumber = Math.floor(10000 + Math.random() * 90000);
        const existingOrder = await WithdrawalOrders.findOne({ "order_details.order_no": orderNumber });
        if (!existingOrder) isUnique = true;
    }

    return orderNumber;
};

const withdrawalOrderSchema = new mongoose.Schema({
    user_details: {
        user_object_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        user_mySponsor_id: { type: String, required: true },
        user_name: { type: String, required: true }
    },
    order_details: {
        order_no: { type: Number, unique: true },
        withdrawal_order_date: { type: Date, default: Date.now },
        withdrawal_amount: { type: Number, required: true }
    },
    status: { type: String, enum: ["pending", "canceled", "approved"], default: "pending" }
});

withdrawalOrderSchema.pre("save", async function (next) {
    if (!this.order_details.order_no) {
        this.order_details.order_no = await generateUniqueOrderNumber();
    }
    next();
});

const WithdrawalOrders = mongoose.model("WithdrawalOrders", withdrawalOrderSchema);
module.exports = WithdrawalOrders;