const mongoose = require('mongoose');

const topupSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  walletHistory: [
    {
      amount: Number,
      date: String,
      time: String
    }
  ]
});

const Topup = mongoose.model('Topup', topupSchema);
module.exports = Topup;