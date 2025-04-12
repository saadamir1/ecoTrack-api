const mongoose = require('mongoose');

const ChallengeParticipationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true },
  status: { type: String, enum: ['joined', 'in-progress', 'completed', 'abandoned'], default: 'joined' },
  progress: { type: Number, default: 0 }, // Percentage of completion
  carbonSaved: { type: Number, default: 0 }, // Carbon saved in grams
  activities: [{
    date: { type: Date, default: Date.now },
    description: { type: String },
    impactValue: { type: Number, default: 0 }
  }],
  rank: { type: Number }, // User's rank in this challenge (if applicable)
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create a compound unique index on user and challenge
ChallengeParticipationSchema.index({ user: 1, challenge: 1 }, { unique: true });

module.exports = mongoose.model("ChallengeParticipation", ChallengeParticipationSchema);