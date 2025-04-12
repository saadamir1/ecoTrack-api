const Organization = require('../models/Organization');

// Create a new organization
const createOrganization = async (req, res) => {
    const { name } = req.body; // Extract organization name from request body
    try {
        const newOrganization = new Organization({ name });
        await newOrganization.save();
        res.status(201).json({ message: 'Organization created successfully', organization: newOrganization });
    } catch (error) {
        console.error('Error creating organization:', error);
        res.status(500).json({ message: 'Error creating organization' });
    }
};

// Get all organizations
const getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find();
        res.status(200).json(organizations);
    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ message: 'Error fetching organizations' });
    }
};

// Get organization by ID
const getOrganizationById = async (req, res) => {
    const { organizationId } = req.params;
    try {
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.status(200).json(organization);
    } catch (error) {
        console.error('Error fetching organization:', error);
        res.status(500).json({ message: 'Error fetching organization' });
    }
};

// Update organization
const updateOrganization = async (req, res) => {
    const { organizationId } = req.params;
    const updates = req.body; // Get updates from request body

    try {
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        Object.assign(organization, updates); // Update organization fields with new values
        await organization.save();

        res.status(200).json({ message: 'Organization updated successfully', organization });
    } catch (error) {
        console.error('Error updating organization:', error);
        res.status(500).json({ message: 'Error updating organization' });
    }
};

// Delete organization
const deleteOrganization = async (req, res) => {
    const { organizationId } = req.params;

    try {
        const organization = await Organization.findByIdAndDelete(organizationId);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.status(200).json({ message: 'Organization deleted successfully' });
    } catch (error) {
        console.error('Error deleting organization:', error);
        res.status(500).json({ message: 'Error deleting organization' });
    }
};

module.exports = {
    createOrganization,
    getAllOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
};
