const mongoose = require('mongoose');

const rankingDetailsSchema = new mongoose.Schema({
    matching_points: { type: Number, required: true },
    rank_name: { type: String, required: true },
    status: { type: String, default: 'unclaimed' } // or 'inactive'
}, { _id: false });

const rankingSchema = new mongoose.Schema({
    mysponsorid: { type: String, required: true },
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ranking_details: [rankingDetailsSchema]
});

module.exports = mongoose.model('Ranking', rankingSchema);