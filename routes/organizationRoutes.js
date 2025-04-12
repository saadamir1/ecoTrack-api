const express = require('express');
const {
    createOrganization,
    getAllOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
} = require('../controllers/OrganizationController');

const router = express.Router();

// Organization routes
router.post('/', createOrganization); // Create a new organization
router.get('/', getAllOrganizations); // Get all organizations
router.get('/:organizationId', getOrganizationById); // Get organization by ID
router.put('/:organizationId', updateOrganization); // Update organization
router.delete('/:organizationId', deleteOrganization); // Delete organization

module.exports = router;
