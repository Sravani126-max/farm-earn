import express from 'express';
import { getUsers, getBuyers, getFarmers, blockUser, getAnalytics, getUserProfile } from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);

router.route('/')
    .get(protect, authorizeRoles('Admin'), getUsers);

router.get('/buyers', protect, authorizeRoles('Admin'), getBuyers);
router.get('/farmers', protect, authorizeRoles('Admin'), getFarmers);
router.get('/analytics', protect, authorizeRoles('Admin'), getAnalytics);

router.route('/:id/block')
    .put(protect, authorizeRoles('Admin'), blockUser);

export default router;
