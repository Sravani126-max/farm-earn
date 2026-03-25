import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// @desc    Get all buyers
// @route   GET /api/users/buyers
// @access  Private/Admin
const getBuyers = asyncHandler(async (req, res) => {
    const buyers = await User.find({ role: 'Buyer' });
    res.json(buyers);
});

// @desc    Get all farmers
// @route   GET /api/users/farmers
// @access  Private/Admin
const getFarmers = asyncHandler(async (req, res) => {
    const farmers = await User.find({ role: 'Farmer' });
    res.json(farmers);
});

// @desc    Block or Unblock a user
// @route   PUT /api/users/:id/block
// @access  Private/Admin
const blockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Toggle the isVerified status - could also add a dedicated 'isBlocked' field later if needed
        user.isVerified = !user.isVerified;
        const updatedUser = await user.save();

        res.json({
            message: `User ${updatedUser.name} has been ${updatedUser.isVerified ? 'unblocked/verified' : 'blocked/unverified'}`,
            isVerified: updatedUser.isVerified
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get system analytics
// @route   GET /api/users/analytics
// @access  Private/Admin
const getAnalytics = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const farmers = await User.countDocuments({ role: 'Farmer' });
    const buyers = await User.countDocuments({ role: 'Buyer' });
    const agents = await User.countDocuments({ role: 'Agent' });

    // We would ideally import Crop and get stats there too

    res.json({
        totalUsers,
        farmers,
        buyers,
        agents
    });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            aadhar: user.aadhar,
            role: user.role,
            location: user.location,
            profileImage: user.profileImage,
            isVerified: user.isVerified
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        user.aadhar = req.body.aadhar || user.aadhar;
        user.location = req.body.location || user.location;
        
        if (req.body.profileImage) {
             user.profileImage = req.body.profileImage;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            aadhar: updatedUser.aadhar,
            role: updatedUser.role,
            location: updatedUser.location,
            profileImage: updatedUser.profileImage,
            isVerified: updatedUser.isVerified
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add a new agent (Admin only)
// @route   POST /api/users/add-agent
// @access  Private/Admin
const addAgent = asyncHandler(async (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        res.status(400);
        throw new Error('Please provide name, email, and phone number');
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400);
        throw new Error('A user with this email already exists');
    }

    const agent = await User.create({
        name,
        email,
        phone,
        password: crypto.randomBytes(16).toString('hex'),
        role: 'Agent',
        location: 'To be updated',
        aadhar: '000000000000',
        isVerified: true,
    });

    if (agent) {
        res.status(201).json({
            message: 'Agent added successfully',
            agent: {
                _id: agent._id,
                name: agent.name,
                email: agent.email,
                phone: agent.phone,
                role: agent.role,
                location: agent.location,
                isVerified: agent.isVerified,
            }
        });
    } else {
        res.status(400);
        throw new Error('Failed to create agent');
    }
});

// @desc    Get all agents
// @route   GET /api/users/agents
// @access  Private/Admin
const getAgents = asyncHandler(async (req, res) => {
    const agents = await User.find({ role: 'Agent' });
    res.json(agents);
});

export { getUsers, getBuyers, getFarmers, blockUser, getAnalytics, getUserProfile, updateUserProfile, addAgent, getAgents };
