const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['transportation', 'energy', 'food', 'waste', 'water', 'other'] },
    targetValue: { type: Number }, // target reduction in carbon impact
    currentValue: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' }
});

const SustainabilityGoal = mongoose.model('Profile', goalSchema);
module.exports = SustainabilityGoal;