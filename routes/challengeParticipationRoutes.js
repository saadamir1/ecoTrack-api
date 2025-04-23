const express = require('express');
const router = express.Router();
const {
  joinChallenge,
  leaveChallenge,
  updateProgress,
  getUserChallenges,
  getChallengeParticipants,
  getParticipation,
  addActivity,
  getActivities,
  deleteActivity
} = require('../controllers/ChallengeParticipationController');

// Get user challenges
router.get('/user/:userId', getUserChallenges);

// Join a challenge
router.post('/join', joinChallenge);

// Leave a challenge
router.put('/leave/:challengeId/:userId', leaveChallenge);


// Update challenge progress
router.put('/:challengeId/user/:userId/progress', updateProgress);

// Get challenge participants
router.get('/challenge/:challengeId/participants', getChallengeParticipants);

// Get a single participation
router.get('/:participationId', getParticipation);

// Activity management
router.post('/:participationId/activities', addActivity);
router.get('/:participationId/activities', getActivities);
router.delete('/:participationId/activities/:activityId', deleteActivity);

module.exports = router;