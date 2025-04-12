const Challenge = require('../models/Challenge');

// Helper function to process image URLs into an array
const processImages = (imageData) => {
    if (typeof imageData === 'string') {
        return imageData
            .replace(/'/g, '')
            .split(',')
            .map(url => url.trim());
    }
    return imageData;
};

// Create a new challenge
const createChallenge = async (req, res) => {
    let challengeData = req.body;

    // Ensure images are processed correctly if provided
    if (challengeData.images) {
        challengeData.images = processImages(challengeData.images);
    }

    try {
        const newChallenge = new Challenge(challengeData);
        await newChallenge.save();
        res.status(201).json(newChallenge);
    } catch (error) {
        console.error('Error creating challenge:', error);
        res.status(500).json({ message: 'Error creating challenge' });
    }
};

const getAllChallenges = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 36;
    const skip = (page - 1) * limit;
    const { categoryID, organizationID, ordering: sortOrder, minPoints, maxPoints, search, status } = req.query;
    console.log("Request Query Params:", req.query);

    // Build the filter object dynamically
    let filter = {};
    let originalFilter = {};

    if (categoryID) {
        filter.category = categoryID;
        originalFilter.category = categoryID;
    }

    if (organizationID) {
        filter.organization = organizationID;
        originalFilter.organization = organizationID;
    }

    // Add status filter
    if (status) {
        filter.status = status;
        originalFilter.status = status;
    }

    if (search) {
        const searchRegex = new RegExp(search.split(/\s+/).join('|'), 'i');

        filter.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { organization: searchRegex },
            { tags: searchRegex }
        ];
    }

    // Adding points filters (replacing price filters)
    if (minPoints && maxPoints) {
        filter.points = { $gte: minPoints, $lte: maxPoints };
        originalFilter.points = { $gte: minPoints, $lte: maxPoints };
    } else if (minPoints) {
        filter.points = { $gte: minPoints };
        originalFilter.points = { $gte: minPoints };
    } else if (maxPoints) {
        filter.points = { $lte: maxPoints };
        originalFilter.points = { $lte: maxPoints };
    }

    console.log("Filter:", filter);

    // Default sort is by relevance, handle other sorting options
    let sort = {};
    switch (sortOrder) {
        case "name":
            sort = { title: 1 }; // Sort by name A-Z
            break;
        case "-name":
            sort = { title: -1 }; // Sort by name Z-A
            break;
        case "points":
            sort = { points: 1 }; // Sort by points low to high
            break;
        case "-points":
            sort = { points: -1 }; // Sort by points high to low
            break;
        case "-added":
            sort = { createdAt: -1 }; // Sort by date added, descending
            break;
        case "startDate":
            sort = { startDate: 1 }; // Sort by start date ascending
            break;
        case "-startDate":
            sort = { startDate: -1 }; // Sort by start date descending
            break;
        case "-participants":
            sort = { participantCount: -1 }; // Sort by participant count
            break;
        default:
            sort = { startDate: 1 }; // Default to sort by upcoming challenges
            break;
    }

    console.log("Sort:", sort);

    try {
        // First, try to get filtered results
        const totalCount = await Challenge.countDocuments(filter);

        // If there are enough results, return them
        if (totalCount >= 3) {
            const challenges = await Challenge.find(filter)
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .populate('organization');

            return res.status(200).json({
                count: totalCount,
                next: totalCount > page * limit ? `/api/v1/challenges?page=${page + 1}&limit=${limit}` : null,
                results: challenges,
                isDefaultResults: false
            });
        }

        // If not enough results, return default challenges
        console.log("Insufficient results. Showing default challenges...");

        const defaultFilter = Object.keys(originalFilter).length > 0 ? originalFilter : {};

        const defaultTotalCount = await Challenge.countDocuments(defaultFilter);
        const defaultChallenges = await Challenge.find(defaultFilter)
            .skip(skip)
            .limit(limit)
            .sort({ popularityIndex: -1 })
            .populate('organization');


        return res.status(200).json({
            count: defaultTotalCount,
            next: defaultTotalCount > page * limit ? `/api/v1/challenges?page=${page + 1}&limit=${limit}` : null,
            results: defaultChallenges,
            isDefaultResults: true
        });
    } catch (error) {
        console.error("Error fetching challenges:", error.message);
        res.status(500).json({ message: "Error fetching challenges" });
    }
};

// Get challenge by ID
const getChallengeById = async (req, res) => {
    const { challengeId } = req.params;

    try {
        const challenge = await Challenge.findById(challengeId).populate('organization');
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        res.status(200).json(challenge);
    } catch (error) {
        console.error('Error fetching challenge:', error);
        res.status(500).json({ message: 'Error fetching challenge' });
    }
};

// Update challenge by ID
const updateChallenge = async (req, res) => {
    const { challengeId } = req.params;
    let updateData = req.body;

    // Ensure images are processed correctly if provided
    if (updateData.images) {
        updateData.images = processImages(updateData.images);
    }

    try {
        const updatedChallenge = await Challenge.findByIdAndUpdate(challengeId, updateData, { new: true });
        if (!updatedChallenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        res.status(200).json(updatedChallenge);
    } catch (error) {
        console.error('Error updating challenge:', error);
        res.status(500).json({ message: 'Error updating challenge' });
    }
};

// Delete challenge by ID
const deleteChallenge = async (req, res) => {
    const { challengeId } = req.params;

    try {
        const deletedChallenge = await Challenge.findByIdAndDelete(challengeId);
        if (!deletedChallenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        res.status(204).send(); // No content to send back
    } catch (error) {
        console.error('Error deleting challenge:', error);
        res.status(500).json({ message: 'Error deleting challenge' });
    }
};

module.exports = {
    createChallenge,
    getAllChallenges,
    getChallengeById,
    updateChallenge,
    deleteChallenge
};