const express = require('express');
const {
    createChallenge,
    getAllChallenges,
    getChallengeById,
    updateChallenge,
    deleteChallenge,
} = require('../controllers/ChallengeController');

const router = express.Router();

// Challenge routes
router.post('/', createChallenge); // Create a new challenge
router.get('/', getAllChallenges); // Get all challenges
router.get('/:challengeId', getChallengeById); // Get challenge by ID
router.put('/:challengeId', updateChallenge); // Update challenge
router.delete('/:challengeId', deleteChallenge); // Delete challenge

module.exports = router;
