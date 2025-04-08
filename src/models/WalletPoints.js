const mongoose = require('mongoose');

const walletPointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String, // Preferred Customer Name
    required: true,
  },
  mySponsorId: {
    type: String,
    required: true,
  },
  personalPoints: {
    type: Number,
    default: 0
  },
  totalPoints: {
    leftPoints: { type: Number, default: 0 },
    rightPoints: { type: Number, default: 0 }
  },
  directPoints: {
    leftPoints: { type: Number, default: 0 },
    rightPoints: { type: Number, default: 0 }
  },
  currentWeekPoints: {
    leftPoints: { type: Number, default: 0 },
    rightPoints: { type: Number, default: 0 }
  },
  supportivePoints: {
    leftPoints: { type: Number, default: 0 },
    rightPoints: { type: Number, default: 0 }
  },
  weeklyEarnings: [
    {
      week: { type: Date, required: true },
      matchedPoints: { type: Number, required: true, default: 0 },
      directSalesBonus: { type: Number, required: true, default: 0 },
      teamSalesBonus: { type: Number, required: true, default: 0 },
      weeklyPoints: { type: Number, required: true, default: 0 },
      tds: { type: Number, required: true, default: 0 },
      payoutAmount: { type: Number, required: true, default: 0 },
    }
  ],
  currentMonthPoints: {
    leftPoints: { type: Number, default: 0 },
    rightPoints: { type: Number, default: 0 }
  },
  monthlyEarnings: [
    {
      month: { type: Date, required: true },
      payoutAmount: { type: Number, default: 0 },
      weeklyDetails: [
        {
          week: { type: Date, required: true },
          payoutAmount: { type: Number, required: true }
        }
      ]
    }
  ],
  walletBalance: { type: Number, default: 0 },
});

const WalletPoints = mongoose.model('WalletPoints', walletPointsSchema);

module.exports = WalletPoints;
