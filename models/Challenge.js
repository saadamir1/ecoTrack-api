const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    challengeId: { type: String }, // Will be auto-generated
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Expert'] },
    type: { type: String, enum: ['Individual', 'Group', 'Community'] },
    environmentalImpact: [{ type: String }],
    duration: { type: String },
    points: { type: Number, required: true },
    impact: {
        carbonReduction: { type: Number },
        waterSaved: { type: Number },
        energySaved: { type: Number },
        wastePrevented: { type: Number }
    },
    status: { type: String, enum: ['Upcoming', 'Active', 'Completed'] },
    images: [{ type: String, required: true }],
    targetAudience: { type: String },
    description: { type: String },
    tags: [{ type: String }],
    popularityIndex: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    participantCount: { type: Number, default: 0 }
}, { timestamps: true });

// Indexing
challengeSchema.index({ challengeId: 1, organization: 1 }, { unique: true });
challengeSchema.index({ category: 1, points: 1 });
challengeSchema.index({ title: 'text', tags: 'text' });

// Virtual field to create 'id' based on '_id'
challengeSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are included when converting to JSON
challengeSchema.set('toJSON', {
    virtuals: true
});

challengeSchema.pre('save', function (next) {
    if (this.isNew) {
        const organizationPrefix = this.organization.slice(0, 2).toUpperCase();
        this.challengeId = `${organizationPrefix}_${this._id}`;
    }
    next();
});

const Challenge = mongoose.model('Challenge', challengeSchema);
module.exports = Challenge;