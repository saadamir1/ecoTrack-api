const express = require('express');
const userRoutes = require('./userRoutes');
const challengeRoutes = require('./challengeRoutes');
const organizationRoutes = require('./organizationRoutes');
const categoryRoutes = require('./categoryRoutes');
const adminRoutes = require('./adminRoutes');
const challengeParticipationRoutes = require('./challengeParticipationRoutes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/challenges', challengeRoutes);
router.use('/organizations', organizationRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin', adminRoutes);
router.use('/challengeParticipations', challengeParticipationRoutes);

module.exports = router;
