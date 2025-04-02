const mongoose = require("mongoose");

// Function to generate a unique 5-digit order number
const generateUniqueOrderNumber = async function () {
    let orderNumber;
    let isUnique = false;

    while (!isUnique) {
        orderNumber = Math.floor(10000 + Math.random() * 90000); // Generate a 5-digit number
        const existingOrder = await UserOrders.findOne({ "order_details.order_no": orderNumber });

        if (!existingOrder) {
            isUnique = true;
        }
    }

    return orderNumber;
};

const userOrdersSchema = new mongoose.Schema({
    user_details: {
        user_object_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        user_mySponsor_id: { type: String, required: true },
        user_name: { type: String, required: true }
    },
    order_details: {
        order_no: { type: Number, unique: true },
        order_date: { type: Date, default: Date.now },
        order_price: { type: Number, required: true }
    },
    package_name: { type: String, required: true },
    status: { type: String, enum: ["pending", "canceled", "approved"], default: "pending" },
    image_url: { type: String }
});

// Pre-save hook to generate a unique order number
userOrdersSchema.pre("save", async function (next) {
    if (!this.order_details.order_no) {
        this.order_details.order_no = await generateUniqueOrderNumber();
    }
    next();
});

const UserOrders = mongoose.model("UserOrders", userOrdersSchema);
module.exports = UserOrders;
