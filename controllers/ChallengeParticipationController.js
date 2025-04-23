const ChallengeParticipation = require('../models/ChallengeParticipation');
const Challenge = require('../models/Challenge');

// Join a challenge
const joinChallenge = async (req, res) => {
  const { challengeId, userId } = req.body;

  if (!challengeId || !userId) {
    return res.status(400).json({ message: "Challenge ID and User ID are required" });
  }

  try {
    const challengeExists = await Challenge.findById(challengeId);
    if (!challengeExists) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const existingParticipation = await ChallengeParticipation.findOne({ user: userId, challenge: challengeId });
    if (existingParticipation) {
      return res.status(200).json({
        message: "Already participating in this challenge",
        participation: existingParticipation
      });
    }

    // Create new participation entry
    const participation = new ChallengeParticipation({
      user: userId,
      challenge: challengeId,
      status: 'active'
    });
    await participation.save();

    // Increment participant count in the challenge
    await Challenge.findByIdAndUpdate(challengeId, {
      $inc: { participantCount: 1 }
    });

    return res.status(201).json({
      message: "Successfully joined challenge",
      participation
    });
  } catch (error) {
    console.error("Error joining challenge:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Leave a challenge
const leaveChallenge = async (req, res) => {
  const { challengeId, userId } = req.params;

  if (!challengeId || !userId) {
    return res.status(400).json({ message: "Challenge ID and User ID are required" });
  }

  try {
    const participation = await ChallengeParticipation.findOne({
      user: userId,
      challenge: challengeId
    });

    if (!participation) {
      return res.status(404).json({ message: "Not participating in this challenge" });
    }

    // Mark as inactive instead of deleting
    participation.status = 'inactive';
    await participation.save();

    // Fetch current participant count
    const challenge = await Challenge.findById(challengeId);

    if (challenge.participantCount > 0) {
      await Challenge.findByIdAndUpdate(challengeId, {
        $inc: { participantCount: -1 }
      });
    }

    return res.status(200).json({ message: "Left the challenge" });
  } catch (error) {
    console.error("Error leaving challenge:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Update challenge progress
const updateProgress = async (req, res) => {
  const { challengeId, userId } = req.params;
  const { progress, activity } = req.body;

  if (!challengeId || !userId) {
    return res.status(400).json({ message: "Challenge ID and User ID are required" });
  }

  try {
    const participation = await ChallengeParticipation.findOne({
      user: userId,
      challenge: challengeId
    });

    if (!participation) {
      return res.status(404).json({ message: "Not participating in this challenge" });
    }

    // Update progress
    if (progress !== undefined) {
      participation.progress = progress;

      // Update status based on progress
      if (progress >= 100) {
        participation.status = 'completed';
      } else if (progress > 0) {
        participation.status = 'in-progress';
      }
    }

    // Add new activity if provided
    if (activity) {
      participation.activities.push({
        date: new Date(),
        description: activity.description,
        impactValue: activity.impactValue || 0
      });

      // Update total carbon saved
      participation.carbonSaved += (activity.impactValue || 0);
    }

    await participation.save();

    return res.status(200).json({
      message: "Progress updated",
      participation
    });
  } catch (error) {
    console.error("Error updating challenge progress:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all challenges a user is participating in
const getUserChallenges = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const participations = await ChallengeParticipation.find({
      user: userId,
      status: { $ne: 'abandoned' } // Exclude abandoned challenges
    }).populate("challenge");

    return res.status(200).json(participations);
  } catch (error) {
    console.error("Error fetching user challenges:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all participants for a challenge
const getChallengeParticipants = async (req, res) => {
  const { challengeId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!challengeId) {
    return res.status(400).json({ message: "Challenge ID is required" });
  }

  try {
    const totalCount = await ChallengeParticipation.countDocuments({
      challenge: challengeId,
      status: { $ne: 'abandoned' }
    });

    const participants = await ChallengeParticipation.find({
      challenge: challengeId,
      status: { $ne: 'abandoned' }
    })
      .populate('user', 'username userProfile') // Only include necessary user fields
      .sort({ progress: -1 }) // Sort by progress descending
      .skip(skip)
      .limit(limit);

    // Update ranks based on progress
    let currentRank = skip + 1;
    let prevProgress = null;
    let sameRankCount = 0;

    const participantsWithRanks = participants.map(participant => {
      const participantObj = participant.toObject();

      // If this participant has the same progress as previous, give same rank
      if (prevProgress === participantObj.progress) {
        sameRankCount++;
      } else {
        currentRank += sameRankCount;
        sameRankCount = 0;
      }

      prevProgress = participantObj.progress;
      participantObj.rank = currentRank;

      return participantObj;
    });

    return res.status(200).json({
      count: totalCount,
      next: totalCount > page * limit ? `/api/v1/challenges/${challengeId}/participants?page=${page + 1}&limit=${limit}` : null,
      results: participantsWithRanks
    });
  } catch (error) {
    console.error("Error fetching challenge participants:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {
  joinChallenge,
  leaveChallenge,
  updateProgress,
  getUserChallenges,
  getChallengeParticipants
};