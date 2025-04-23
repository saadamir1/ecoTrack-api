const ChallengeParticipation = require('../models/ChallengeParticipation');
const Challenge = require('../models/Challenge');
const mongoose = require('mongoose');

// Get all challenge participations for a user
const getUserChallenges = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const participations = await ChallengeParticipation.find({
      user: userId,
      status: { $ne: 'abandoned' }
    })
      .populate('challenge')
      .sort({ joinedAt: -1 });

    return res.status(200).json(participations);
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Join a challenge
const joinChallenge = async (req, res) => {
  const { userId, challengeId } = req.body;

  if (!challengeId || !userId) {
    return res.status(400).json({ message: "Challenge ID and User ID are required" });
  }

  try {
    const challengeExists = await Challenge.findById(challengeId);
    if (!challengeExists) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const existingParticipation = await ChallengeParticipation.findOne({
      user: userId,
      challenge: challengeId
    });

    if (existingParticipation) {
      if (existingParticipation.status === 'active') {
        return res.status(200).json({
          message: "Already participating in this challenge",
          participation: existingParticipation
        });
      } else {
        existingParticipation.status = 'active';
        existingParticipation.progress = 0;
        existingParticipation.activities = [];
        existingParticipation.carbonSaved = 0;

        await existingParticipation.save();
        await Challenge.findByIdAndUpdate(challengeId, {
          $inc: { participantCount: 1 }
        });

        return res.status(200).json({
          message: "Successfully rejoined challenge",
          participation: existingParticipation
        });
      }
    }

    const participation = new ChallengeParticipation({
      user: userId,
      challenge: challengeId,
      status: 'active',
      progress: 0,
      carbonSaved: 0,
      activities: []
    });

    const savedParticipation = await participation.save();
    await Challenge.findByIdAndUpdate(challengeId, {
      $inc: { participantCount: 1 }
    });

    return res.status(201).json({
      message: "Successfully joined challenge",
      participation: savedParticipation
    });
  } catch (error) {
    console.error('Error joining challenge:', error);
    return res.status(500).json({ error: 'Server error' });
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

    if (participation.status === 'active') {
      participation.status = 'inactive';
      await participation.save();
      await Challenge.findByIdAndUpdate(challengeId, {
        $inc: { participantCount: -1 }
      });
    } else {
      participation.status = 'inactive';
      await participation.save();
    }

    return res.status(200).json({
      message: "Left the challenge",
      participationStatus: participation.status
    });
  } catch (error) {
    console.error('Error leaving challenge:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Update progress
const updateProgress = async (req, res) => {
  const { challengeId, userId } = req.params;
  const { progress, activity } = req.body;

  try {
    const participation = await ChallengeParticipation.findOne({
      user: userId,
      challenge: challengeId
    });

    if (!participation) {
      return res.status(404).json({ message: "Not participating in this challenge" });
    }

    if (progress !== undefined) {
      participation.progress = progress;
      if (progress >= 100) {
        participation.status = 'completed';
      } else if (progress > 0) {
        participation.status = 'active';
      }
    }

    if (activity) {
      participation.activities.push({
        date: new Date(),
        description: activity.description,
        impactValue: activity.impactValue || 0
      });
      participation.carbonSaved += (activity.impactValue || 0);
    }

    await participation.save();

    return res.status(200).json({
      message: "Progress updated",
      participation
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get challenge participants
const getChallengeParticipants = async (req, res) => {
  const { challengeId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await ChallengeParticipation.countDocuments({
      challenge: challengeId,
      status: { $ne: 'abandoned' }
    });

    const participants = await ChallengeParticipation.find({
      challenge: challengeId,
      status: { $ne: 'abandoned' }
    })
      .populate('user', 'username userProfile')
      .sort({ progress: -1 })
      .skip(skip)
      .limit(limit);

    let currentRank = skip + 1;
    let prevProgress = null;
    let sameRankCount = 0;

    const participantsWithRanks = participants.map(participant => {
      const participantObj = participant.toObject();
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
    console.error('Error fetching participants:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get a single participation
const getParticipation = async (req, res) => {
  try {
    const { participationId } = req.params;

    const participation = await ChallengeParticipation.findById(participationId);

    if (!participation) {
      return res.status(404).json({ error: 'Participation not found' });
    }

    return res.status(200).json(participation);
  } catch (error) {
    console.error('Error fetching participation:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Add activity to a participation
const addActivity = async (req, res) => {
  try {
    const { participationId } = req.params;
    const { date, description, impactValue } = req.body;

    const participation = await ChallengeParticipation.findById(participationId);

    if (!participation) {
      return res.status(404).json({ error: 'Participation not found' });
    }

    const newActivity = {
      date: date || new Date(),
      description,
      impactValue
    };

    participation.activities.push(newActivity);
    participation.carbonSaved += impactValue;

    const challenge = await Challenge.findById(participation.challenge);
    const targetImpact = challenge.targetImpact || 100;

    participation.progress = Math.min(100, Math.round((participation.carbonSaved / targetImpact) * 100));

    if (participation.progress >= 100) {
      participation.status = 'completed';
    } else if (participation.progress > 0) {
      participation.status = 'active';
    }

    await participation.save();

    return res.status(201).json({
      activity: participation.activities[participation.activities.length - 1],
      carbonSaved: participation.carbonSaved,
      progress: participation.progress
    });
  } catch (error) {
    console.error('Error adding activity:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get activities for a participation
const getActivities = async (req, res) => {
  try {
    const { participationId } = req.params;

    const participation = await ChallengeParticipation.findById(participationId);

    if (!participation) {
      return res.status(404).json({ error: 'Participation not found' });
    }

    return res.status(200).json({
      activities: participation.activities,
      carbonSaved: participation.carbonSaved,
      progress: participation.progress
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Delete an activity
const deleteActivity = async (req, res) => {
  try {
    const { participationId, activityId } = req.params;

    const participation = await ChallengeParticipation.findById(participationId);

    if (!participation) {
      return res.status(404).json({ error: 'Participation not found' });
    }

    const activityIndex = participation.activities.findIndex(
      activity => activity._id.toString() === activityId
    );

    if (activityIndex === -1) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const impactValue = participation.activities[activityIndex].impactValue;
    participation.carbonSaved = Math.max(0, participation.carbonSaved - impactValue);

    participation.activities.splice(activityIndex, 1);

    const challenge = await Challenge.findById(participation.challenge);
    const targetImpact = challenge.targetImpact || 100;

    participation.progress = Math.min(100, Math.round((participation.carbonSaved / targetImpact) * 100));

    if (participation.progress >= 100) {
      participation.status = 'completed';
    } else if (participation.progress > 0) {
      participation.status = 'active';
    } else {
      participation.status = 'active';
    }

    await participation.save();

    return res.status(200).json({
      message: 'Activity deleted',
      carbonSaved: participation.carbonSaved,
      progress: participation.progress
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  joinChallenge,
  leaveChallenge,
  updateProgress,
  getUserChallenges,
  getChallengeParticipants,
  getParticipation,
  addActivity,
  getActivities,
  deleteActivity
};