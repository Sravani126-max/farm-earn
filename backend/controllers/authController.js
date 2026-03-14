import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc    Register a new user (with Firebase UID)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone, aadhar, firebaseUid, role, location, profileImage } = req.body;

    // Check if user exists by email, phone, aadhar, or firebaseUid
    const userExists = await User.findOne({ 
        $or: [{ email }, { phone }, { aadhar }, { firebaseUid }] 
    });

    if (userExists) {
        res.status(400);
        throw new Error('User with these credentials already exists in the database');
    }

    const user = await User.create({
        name,
        email,
        phone,
        aadhar,
        firebaseUid,
        role,
        location,
        profileImage,
        isVerified: true // Assuming true as Firebase handles auth
    });

    if (user) {
        res.status(201).json({
            message: 'User profile created successfully.',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                firebaseUid: user.firebaseUid
            }
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & fetch profile (Using Firebase UID)
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    // We expect the frontend to send the firebaseUid after successful Firebase login
    const { firebaseUid } = req.body;

    if (!firebaseUid) {
        res.status(400);
        throw new Error('Firebase UID is required');
    }

    const user = await User.findOne({ firebaseUid });

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            firebaseUid: user.firebaseUid
        });
    } else {
        res.status(404);
        throw new Error('User profile not found in database. Please register first.');
    }
});

export { registerUser, authUser };
