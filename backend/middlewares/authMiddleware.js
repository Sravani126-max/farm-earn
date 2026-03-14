import admin from '../utils/firebaseAdmin.js';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
    let idToken;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            idToken = req.headers.authorization.split(' ')[1];
            // Verify Firebase ID Token
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            
            // Find user in our db using firebaseUid
            req.user = await User.findOne({ firebaseUid: decodedToken.uid });
            
            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found in database');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!idToken) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`User role ${req.user ? req.user.role : 'undefined'} is not authorized to access this route`);
        }
        next();
    };
};

export { protect, authorizeRoles };
