import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Emails that are automatically assigned Admin role
const ADMIN_EMAILS = [
    'ramaiah5496@gmail.com',
    'pavankumartalla99@gmail.com',
    'sattenapallibhanuprakash@gmail.com'
];

// @desc    Register a new user (with Firebase UID)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone, aadhar, firebaseUid, role, location, profileImage } = req.body;

    // Auto-assign Admin role for specific emails
    const finalRole = ADMIN_EMAILS.includes(email?.toLowerCase()) ? 'Admin' : role;

    // Check if user exists by email, phone, aadhar, or firebaseUid
    const existingUsers = await User.find({ 
        $or: [{ email }, { phone }, { aadhar }, { firebaseUid }] 
    });

    if (existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        let duplicateField = 'credentials';
        
        if (existingUser.email === email) duplicateField = 'email address';
        else if (existingUser.phone === phone) duplicateField = 'phone number';
        else if (existingUser.aadhar === aadhar) duplicateField = 'Aadhar number';
        else if (existingUser.firebaseUid === firebaseUid) duplicateField = 'Google account';
        
        res.status(400);
        throw new Error(`A user with this ${duplicateField} already exists in the database.`);
    }

    const user = new User({
        name,
        email,
        phone,
        aadhar,
        firebaseUid,
        role: finalRole,
        location,
        profileImage,
        isVerified: true // Assuming true as Firebase handles auth
    });

    await user.save();

    if (user) {
        res.status(201).json({
            message: 'User profile created successfully.',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                aadhar: user.aadhar,
                role: user.role,
                location: user.location,
                profileImage: user.profileImage,
                firebaseUid: user.firebaseUid,
                token: generateToken(user._id)
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

    let user = await User.findOne({ firebaseUid });

    // If not found by firebaseUid, check if a user exists with this email (pre-created by Admin)
    if (!user && req.body.email) {
        user = await User.findOne({ email: req.body.email });
        if (user && !user.firebaseUid) {
            user.firebaseUid = firebaseUid;
            await user.save();
        } else if (user && user.firebaseUid !== firebaseUid) {
            // Email matches but Firebase UID is different - security check
            res.status(400);
            throw new Error('This email is already linked to a different Google account.');
        }
    }

    if (user) {
        // Auto-upgrade role to Admin for designated admin emails
        if (ADMIN_EMAILS.includes(user.email?.toLowerCase()) && user.role !== 'Admin') {
            user.role = 'Admin';
            await user.save();
        }

        if (user.isBlocked) {
            res.status(403);
            throw new Error('Account is blocked. Please contact admin.');
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            aadhar: user.aadhar,
            role: user.role,
            location: user.location,
            profileImage: user.profileImage,
            firebaseUid: user.firebaseUid,
            token: generateToken(user._id)
        });
    } else {
        res.status(404);
        throw new Error('User profile not found in database. Please register first.');
    }
});

export { registerUser, authUser };
