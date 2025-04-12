const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'organization'], required: true },
    userProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: function () { return this.role === 'user'; }
    },
    organizationProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: function () { return this.role === 'organization'; }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Virtual field for ID
userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure (username, role) is unique together
userSchema.index({ username: 1, role: 1 }, { unique: true });

// Ensure (email, role) is unique together
userSchema.index({ email: 1, role: 1 }, { unique: true });



userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
