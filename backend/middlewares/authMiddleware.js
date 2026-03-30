import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            // Verify JWT Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user in our db using token id
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found in database');
            }

            if (req.user.isBlocked) {
                res.status(403);
                throw new Error('Account is blocked. Please contact admin.');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
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

const protectOptional = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            // Verify JWT Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user in our db using token id
            req.user = await User.findById(decoded.id).select('-password');
            // If they are blocked, we still don't want them doing "privileged" things even on optional routes
            if (req.user && req.user.isBlocked) {
                res.status(403);
                throw new Error('Account is blocked. Please contact admin.');
            }
        } catch (error) {
            console.error("Optional Auth Token failed:", error.message);
            // Move on even if token fails - it's optional
        }
    }
    next();
});

export { protect, authorizeRoles, protectOptional };
