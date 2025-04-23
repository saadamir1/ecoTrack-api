const express = require('express');
const router = express.Router();

const {
  joinChallenge,
  leaveChallenge,
  updateProgress,
  getUserChallenges,
  getChallengeParticipants
} = require('../controllers/ChallengeParticipationController');

router.post('/join', joinChallenge);
router.put('/leave/:challengeId/:userId', leaveChallenge);
router.put('/progress/:challengeId/:userId', updateProgress);
router.get('/user/:userId', getUserChallenges);
router.get('/:challengeId/participants', getChallengeParticipants);

module.exports = router;
