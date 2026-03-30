import asyncHandler from 'express-async-handler';
import Crop from '../models/Crop.js';

// @desc    Create a new crop listing
// @route   POST /api/crops/add-crop
// @access  Private/Farmer
const addCrop = asyncHandler(async (req, res) => {
    const { cropName, quantity, price, harvestDate, cropImage, description, farmingMethod, latitude, longitude } = req.body;

    const lat = latitude ? parseFloat(latitude) : 0;
    const lng = longitude ? parseFloat(longitude) : 0;
    const validCoords = !isNaN(lat) && !isNaN(lng) ? [lng, lat] : [0, 0];

    const crop = new Crop({
        cropName,
        farmerId: req.user._id,
        quantity,
        price,
        harvestDate,
        cropImage: cropImage || '',
        description,
        farmingMethod: farmingMethod || 'Non-Organic',
        location: {
            type: 'Point',
            coordinates: validCoords,
            address: '' // Assuming we no longer manually accept address based on new constraints
        }
    });

    const createdCrop = await crop.save();

    // Notify agents based on location priority
    try {
        const User = (await import('../models/User.js')).default;
        const Notification = (await import('../models/Notification.js')).default;
        
        // 1. Find agents within 50km of the crop
        let agents = await User.find({
            role: 'Agent',
            locationCoordinates: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: validCoords
                    },
                    $maxDistance: 50000 // 50km in meters
                }
            }
        });

        // 2. If no agents within 50km, fall back to matching by location string
        if (agents.length === 0) {
            // Try to match by city/state if we have a farmer location
            const farmerLocation = req.user.location || '';
            agents = await User.find({
                role: 'Agent',
                location: { $regex: new RegExp(farmerLocation, 'i') }
            });
        }

        // 3. Final fallback: notify all agents if still none found
        if (agents.length === 0) {
            agents = await User.find({ role: 'Agent' });
        }
        
        if (agents.length > 0) {
            const notifications = agents.map(agent => ({
                userId: agent._id,
                message: `New crop '${createdCrop.cropName}' uploaded near ${req.user.location || 'your area'} requires verification.`,
                cropId: createdCrop._id
            }));
            await Notification.insertMany(notifications);
        }
    } catch (error) {
        console.error('Error sending prioritized notifications to agents:', error);
    }

    res.status(201).json(createdCrop);
});

// @desc    Get all crops (role-based)
// @route   GET /api/crops/all-crops
// @access  Private
const getAllCrops = asyncHandler(async (req, res) => {
    let query = {};
    const { latitude, longitude, radius = 5 } = req.query;

    if (req.user && (req.user.role === 'Agent' || req.user.role === 'Admin')) {
        if (req.user.role === 'Agent') {
            // Agents see all crops (pending + verified)
            // Only filter by proximity if coordinates are provided and valid
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            
            if (latitude && longitude && !isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0)) {
                query = {
                    location: {
                        $near: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [lng, lat]
                            },
                            $maxDistance: (radius || 50) * 1000 // Default to 50km if no radius provided
                        }
                    }
                };
            } else {
                // If no coords, return all crops for verification
                query = {};
            }
        } else if (req.user.role === 'Admin') {
            query = {}; // Admin sees all
        }
    } else {
        // Buyers and Farmers (in marketplace) only see Verified crops
        query = { status: 'Verified' };
    }
    // Farmers use /farmer-crops endpoint

    const crops = await Crop.find(query).populate('farmerId', 'name email location profileImage phone');
    res.json(crops);
});

// @desc    Get logged in farmer's crops
// @route   GET /api/crops/farmer-crops
// @access  Private/Farmer
const getFarmerCrops = asyncHandler(async (req, res) => {
    const crops = await Crop.find({ farmerId: req.user._id });
    res.json(crops);
});

// @desc    Verify a crop
// @route   PUT /api/crops/:id/verify
// @access  Private/Agent
const verifyCrop = asyncHandler(async (req, res) => {
    const { status, report, inspectionImages } = req.body;

    const crop = await Crop.findById(req.params.id);

    if (crop) {
        const previousStatus = crop.status;
        crop.status = status;
        crop.agentVerification = {
            status: status === 'Verified' ? 'Verified' : 'Rejected',
            report: report || crop.agentVerification?.report || '',
            agentId: req.user._id,
            inspectionImages: inspectionImages || crop.agentVerification?.inspectionImages || []
        };

        const updatedCrop = await crop.save();

        if (status === 'Verified' && previousStatus !== 'Verified') {
            // Send notifications to nearby buyers and interested buyers
            const Notification = (await import('../models/Notification.js')).default;
            const User = (await import('../models/User.js')).default;
            
            // 1. Find interested buyers (matching crop name roughly)
            const interestedBuyersQuery = {
                role: 'Buyer',
                interests: { $regex: new RegExp(crop.cropName, 'i') }
            };

            // 2. Find nearby buyers (within 50km roughly)
            const [lng, lat] = crop.location.coordinates;
            // Note: Users don't have geo-location stored natively in `location: {coordinates: []}` yet, 
            // but we can query by their plain text location if needed, or just send to interested.
            // For now, we will notify buyers who are interested.
            
            const buyersToNotify = await User.find(interestedBuyersQuery);
            
            if (buyersToNotify.length > 0) {
                const notifications = buyersToNotify.map(buyer => ({
                    userId: buyer._id,
                    message: `A new crop '${crop.cropName}' you might be interested in has just been verified!`,
                    cropId: crop._id
                }));
                await Notification.insertMany(notifications);
            }
        }

        res.json(updatedCrop);
    } else {
        res.status(404);
        throw new Error('Crop not found');
    }
});

// @desc    Delete a crop
// @route   DELETE /api/crops/:id
// @access  Private/Farmer or Admin
const deleteCrop = asyncHandler(async (req, res) => {
    const crop = await Crop.findById(req.params.id);

    if (crop) {
        if (crop.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            res.status(401);
            throw new Error('Not authorized to delete this crop');
        }
        await crop.deleteOne();
        res.json({ message: 'Crop removed' });
    } else {
        res.status(404);
        throw new Error('Crop not found');
    }
});

export { addCrop, getAllCrops, getFarmerCrops, verifyCrop, deleteCrop };
