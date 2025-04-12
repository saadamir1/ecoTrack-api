const express = require('express');
const {
    registerUser,
    getUserDetails,
    updateUser,
    getAllUsers,
    deleteUser,
    registerOrganization,
    login,
} = require('../controllers/UserController');

const router = express.Router();

// User routes
router.post('/register', registerUser); // Register user
router.post('/register-organization', registerOrganization); // Register user
router.post('/login', login);
router.get('/', getAllUsers); //get all users list
router.get('/:userId', getUserDetails); // Get user details
router.put('/:userId', updateUser); // Update user
router.delete('/:userId', deleteUser); // Delete user

module.exports = router;
