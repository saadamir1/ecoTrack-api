const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    logoUrl: { type: String },
    website: { type: String },
    type: { type: String, enum: ['business', 'ngo', 'educational', 'government', 'other'] },
    sustainabilityFocus: [String], // Areas of environmental focus
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Members of organization
    challenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }], // Challenges created by org
    createdAt: { type: Date, default: Date.now },
    slug: { type: String, required: true, unique: true },
});

// Virtual field to ensure compatibility with frontend expectations
organizationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

organizationSchema.set('toJSON', { virtuals: true });

const Organization = mongoose.model('Organization', organizationSchema);
module.exports = Organization;
