const mongoose = require("mongoose");

// Generate a unique 5-digit order number
const generateUniqueScholarshipOrderNumber = async function () {
    let orderNumber;
    let isUnique = false;

    while (!isUnique) {
        orderNumber = Math.floor(10000 + Math.random() * 90000);
        const existingOrder = await ScholarshipOrders.findOne({ "order_details.order_no": orderNumber });
        if (!existingOrder) isUnique = true;
    }

    return orderNumber;
};

const scholarshipOrderSchema = new mongoose.Schema({
    user_details: {
        user_object_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        user_mySponsor_id: { type: String, required: true },
        user_name: { type: String, required: true }
    },
    order_details: {
        order_no: { type: Number, unique: true },
        scholarship_order_date: { type: Date, default: Date.now },
        scholarship_amount: { type: Number, required: true }
    },
    status: { type: String, enum: ["pending", "canceled", "approved"], default: "pending" }
});

scholarshipOrderSchema.pre("save", async function (next) {
    if (!this.order_details.order_no) {
        this.order_details.order_no = await generateUniqueScholarshipOrderNumber();
    }
    next();
});

const ScholarshipOrders = mongoose.model("ScholarshipOrders", scholarshipOrderSchema);
module.exports = ScholarshipOrders;
