const Organization = require('../models/Organization');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const multer = require('multer');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const crypto = require('crypto');


// Create a new organization (Admin operation)
exports.createOrganizationAdmin = async (req, res) => {
    try {
        const organizationData = req.body; // Assuming organization data is sent in the request body
        const newOrganization = new Organization(organizationData);
        await newOrganization.save();
        return res.status(201).json({ message: 'Organization created successfully', organization: newOrganization });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating organization', error: error.message });
    }
};

// Delete a organization (Admin operation)
exports.deleteOrganizationAdmin = async (req, res) => {
    try {
        const { organizationId } = req.params;
        await Organization.findByIdAndDelete(organizationId);
        return res.status(200).json({ message: 'Organization deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting organization', error: error.message });
    }
};

// Upload challenge sheet (Admin operation)
exports.uploadChallengeSheet = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            console.error('No file uploaded');
            return res.status(400).send('No file uploaded.');
        }

        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        // Map JSON data to challenges
        const challenges = jsonData.map((item) => {
            const organizationPrefix = item.organization ? item.organization.slice(0, 2).toUpperCase() : 'XX';
            const generatedId = new ObjectId(); // Generate a new ObjectId manually
            const hash = crypto.createHash('sha256').update(generatedId.toString()).digest('hex').slice(0, 8); // Shorten hash for readability

            return {
                title: item.title || '',
                category: item.category || '',
                gender: item.gender || '',
                sizes: (item.sizes && typeof item.sizes === 'string') ? item.sizes.split(',') : [],
                fitType: item.fitType || '',
                colors: (item.colors && typeof item.colors === 'string') ? item.colors.split(',') : [],
                price: item.price ? parseFloat(item.price) : 0,
                description: item.description || '',
                organization: item.organization && item.organization.trim() ? item.organization : 'Unknown Organization',
                images: (item.images && typeof item.images === 'string')
                    ? JSON.parse(item.images.replace(/'/g, '"'))
                    : [],
                challengeId: `${organizationPrefix}_${hash}`, // Use hash-based challengeId
                _id: generatedId, // Use the same generated ObjectId for MongoDB insertion
            };
        });

        // Bulk insert challenges
        await Challenge.insertMany(challenges);
        res.status(200).send('Challenges successfully imported.');
    } catch (error) {
        console.error('Error during file processing:', error);
        res.status(500).send('Error importing challenges.');
    }
};



// Get all users (Admin operation)
exports.getAllUsersAdmin = async (req, res) => {
    try {
        const users = await User.find(); // Get all users from the database
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Delete a user (Admin operation)
exports.deleteUserAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        await User.findByIdAndDelete(userId);
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};
