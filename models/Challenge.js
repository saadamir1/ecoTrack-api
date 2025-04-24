const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Expert'],
        default: 'Medium'
    },
    points: { type: Number, default: 10 },
    participantCount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Completed', 'Archived'],
        default: 'Active'
    },
    images: [{ type: String }],
    tags: [{ type: String }],
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    environmentalImpact: [{ type: String }],

    // New fields to support activity tracking
    targetImpact: {
        type: Number,
        default: 100,
        description: "Target carbon impact in kg to complete the challenge"
    },
    activityTypes: [{
        name: { type: String },
        unit: { type: String },
        impactPerUnit: { type: Number },
        description: { type: String }
    }],
    milestones: [{
        percentage: { type: Number },
        description: { type: String },
        reward: { type: String }
    }]
}, { timestamps: true });

ChallengeSchema.pre('save', function (next) {
    // Create a slug from the title if not provided
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }
    next();
});

module.exports = mongoose.model('Challenge', ChallengeSchema);