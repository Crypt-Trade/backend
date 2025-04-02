const mongoose = require('mongoose');
const WalletSchema = new mongoose.Schema({
    userId: {
    type: String,
    required: true,
  },
  name: {
    type: String, 
    required: true,
  },
  telegramId: {
    type: String, 
    required: true,
  },
  Walletaddress:{
    type: String,
    required: true,
  },
  walletApproved: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    }

})
const WalletDetails = mongoose.model('WalletDetails', WalletSchema);
module.exports = WalletDetails;