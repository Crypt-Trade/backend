// models/MonthlyReward.js
const mongoose = require("mongoose");

const rewardEntrySchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format: dd/mm/yyyy
  amount: { type: Number, required: true },
});

const monthlyRewardSchema = new mongoose.Schema({
  user_name: { type: String, required: true },
  user_mySponsor_id: { type: String, required: true },
  order_price: { type: Number, required: true },
  package_name: { type: String, required: true },
  order_date: { type: Date, default: Date.now }, // Format: dd/mm/yyyy
  reward_points: { type: Number, default: 0 },
  rewards: [rewardEntrySchema],
});

module.exports = mongoose.model("MonthlyReward", monthlyRewardSchema);
