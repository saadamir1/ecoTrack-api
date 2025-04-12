const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Organization = require('../models/Organization');

const SECRET_KEY = process.env.JWT_SECRET || "my_secret_key"; // Use env variable for security

// **Register User**
const registerUser = async (req, res) => {
    try {
        console.log("Registering user...");
        console.log(req.body);
        const { firstName, lastName, email, password } = req.body;

        // Check if email already exists under 'user' role
        const existingUser = await User.findOne({ email, role: 'user' });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered as a user." });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create an empty profile with only firstName and lastName
        const profile = await Profile.create({
            firstName,
            lastName,
            gender: "",
            age: null,
            measurements: { height: null, weight: null, chest: null, waist: null },
            preferences: { style: "", sustainability: false, size: "", color: "", challengeParticipationOrganizations: [], fitPreference: "" }
        });

        // Create the user and link it to the profile
        const user = await User.create({
            username: email.split('@')[0], // Extract username from email
            email,
            passwordHash,
            role: 'user',
            userProfile: profile._id // Link profile to user
        });
        // Generate JWT Token
        const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, { expiresIn: '7d' });

        res.status(201).json({ message: "User registered successfully", token, user });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

const slugify = async (text, Organization) => {
    const baseSlug = text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple hyphens with a single hyphen
        .replace(/^-+/, '') // Trim hyphen from start of text
        .replace(/-+$/, ''); // Trim hyphen from end of text

    let slug = baseSlug;
    let count = 1;

    // Check for existing slugs and modify if necessary
    while (await Organization.findOne({ slug })) {
        slug = `${baseSlug}-${count}`;
        count++;
    }

    return slug;
};

const registerOrganization = async (req, res) => {
    try {
        console.log("Registering organization...");
        console.log(req.body);

        // Destructure the correct fields from the request body
        const { organizationName, email, password, description, website, logoUrl } = req.body;
        const name = organizationName; // frontend sends 'organizationName' instead of 'name'

        // Check if email already exists under 'organization' role
        const existingOrganization = await User.findOne({ email, role: 'organization' });
        if (existingOrganization) {
            return res.status(400).json({ message: "Email already registered as a organization." });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Generate unique slug from organization name
        const slug = await slugify(name, Organization);

        // Create an empty organization profile
        const organizationProfile = await Organization.create({
            name, // Use 'name' from the request body
            description, // Use the description from the request body
            website, // Use the website from the request body
            logoUrl: logoUrl, // Use the logoUrl from the request body
            socialLinks: [],
            categories: [],
            sustainabilityFocus: false,
            slug: slug
        });

        // Create the organization user and link to profile
        const organizationUser = await User.create({
            username: email.split('@')[0], // Extract username from email
            email,
            passwordHash,
            role: 'organization',
            organizationProfile: organizationProfile._id
        });

        // Generate JWT Token
        const token = jwt.sign({ userId: organizationUser._id, role: organizationUser.role }, SECRET_KEY, { expiresIn: '7d' });

        res.status(201).json({ message: "Organization registered successfully", token, organizationUser });
    } catch (error) {
        console.error("Organization Registration Error:", error);
        res.status(500).json({ message: "Organization registration failed", error: error.message });
    }
};

// **Login (For both User & Organization)**
const login = async (req, res) => {
    try {
        const { loginIdentifier, password, isSeller = false } = req.body; // loginIdentifier = email or username || default login type: user
        const role = isSeller ? 'organization' : 'user';

        // Find user by email or username and role
        const user = await User.findOne({
            $or: [{ email: loginIdentifier }, { username: loginIdentifier }],
            role
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, { expiresIn: '7d' });

        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

// **Update User/Organization Profile**
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role, profileData, organizationData } = req.body;

        let updateFields = {};

        if (role === 'user') {
            updateFields.userProfile = profileData;
        } else if (role === 'organization') {
            updateFields.organizationProfile = organizationData;
        } else {
            return res.status(400).json({ message: "Invalid role" });
        }

        // ✅ Extract email & username based on role
        const newEmail = role === 'user' ? profileData?.email : organizationData?.email;
        const newUsername = role === 'user' ? profileData?.username : organizationData?.username;

        // ✅ Check if email or username is already taken
        if (newEmail || newUsername) {
            const existingUser = await User.findOne({
                $or: [{ email: newEmail }, { username: newUsername }],
                _id: { $ne: userId } // Exclude the current user
            });

            if (existingUser) {
                if (existingUser.email === newEmail && existingUser.username === newUsername) {
                    return res.status(400).json({ message: "Both email and username are already in use" });
                } else if (existingUser.email === newEmail) {
                    return res.status(400).json({ message: "Email is already in use" });
                } else if (existingUser.username === newUsername) {
                    return res.status(400).json({ message: "Username is already in use" });
                }
            }
        }

        // ✅ Update user profile based on role
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Profile update failed", error: error.message });
    }
};


// **Delete User/Organization**
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete associated profile/organization profile
        if (user.role === 'user' && user.userProfile) {
            await Profile.findByIdAndDelete(user.userProfile);
        }
        if (user.role === 'organization' && user.organizationProfile) {
            await Organization.findByIdAndDelete(user.organizationProfile);
        }

        // Delete user
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ message: "User deletion failed", error: error.message });
    }
};

// **Get All Users**
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('userProfile organizationProfile');
        res.status(200).json(users);
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

// **Get User Details**
const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate('userProfile organizationProfile');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Get User Details Error:", error);
        res.status(500).json({ message: "Failed to fetch user details", error: error.message });
    }
};

module.exports = {
    registerUser,
    registerOrganization,
    login,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserDetails
};
