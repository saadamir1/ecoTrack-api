const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['transportation', 'energy', 'food', 'waste', 'water', 'other'], required: true },
    subtype: { type: String }, // e.g., "car", "bus", "plane" for transportation
    description: { type: String },
    date: { type: Date, default: Date.now },
    carbonImpact: { type: Number, required: true }, // CO2 equivalent in grams
    duration: { type: Number }, // in minutes (if applicable)
    distance: { type: Number }, // in kilometers (if applicable)
    sustainableAlternative: { type: String } // suggested better option
});
const Activity = mongoose.model('Profile', activitySchema);
module.exports = Activity;