import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// @desc    Get logged in user's notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await mongoose.model('Notification').find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20);
    res.json(notifications);
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await mongoose.model('Notification').findById(req.params.id);

    if (notification) {
        if (notification.userId.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this notification');
        }

        notification.isRead = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});
