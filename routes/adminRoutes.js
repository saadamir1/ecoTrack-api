const express = require('express');
const {
    createOrganizationAdmin,
    deleteOrganizationAdmin,
    uploadChallengeSheet,
    getAllUsersAdmin,
    deleteUserAdmin,
} = require('../controllers/AdminController');

const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'upload/' });

// Admin routes
router.post('/organizations', createOrganizationAdmin); // Admin create a new organization
router.delete('/organizations/:organizationId', deleteOrganizationAdmin); // Admin delete organization
router.post('/upload', upload.single('file'), uploadChallengeSheet);  // Admin upload challenge sheet
router.get('/users', getAllUsersAdmin); // Admin get all users
router.delete('/users/:userId', deleteUserAdmin); // Admin delete user

// Add more admin routes as needed

module.exports = router;
