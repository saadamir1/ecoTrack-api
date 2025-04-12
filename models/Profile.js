const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    gender: { type: String, enum: ['male', 'female', 'non-binary', 'other', ''] },
    age: { type: Number, min: 0 },
    location: { type: String }, // For location-specific sustainability tips
    sustainabilityPreferences: {
        dietType: { type: String, enum: ['omnivore', 'vegetarian', 'vegan', 'other'] },
        transportationMode: { type: String, enum: ['car', 'public', 'bicycle', 'walking', 'mixed'] },
        energyConservation: { type: Boolean, default: false },
        wasteReduction: { type: Boolean, default: false }
    },
});
const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;

