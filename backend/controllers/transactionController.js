import asyncHandler from 'express-async-handler';
import Transaction from '../models/Transaction.js';
import Crop from '../models/Crop.js';
import Notification from '../models/Notification.js';

// @desc    Request to purchase a crop
// @route   POST /api/transactions/request
// @access  Private/Buyer
const requestPurchase = asyncHandler(async (req, res) => {
    const { cropId, quantity } = req.body;

    const crop = await Crop.findById(cropId);

    if (!crop) {
        res.status(404);
        throw new Error('Crop not found');
    }

    if (crop.status !== 'Verified') {
        res.status(400);
        throw new Error('Crop must be verified before purchase');
    }

    if (crop.quantity < quantity) {
        res.status(400);
        throw new Error('Insufficient quantity available');
    }

    const transaction = await Transaction.create({
        buyerId: req.user._id,
        farmerId: crop.farmerId,
        cropId,
        quantity,
        totalPrice: crop.price * quantity,
        status: 'Requested'
    });

    // Notify farmer
    await Notification.create({
        userId: crop.farmerId,
        message: `New purchase request for your crop: ${crop.cropName} (${quantity} quintals) from ${req.user.name}`,
        cropId: crop._id
    });

    res.status(201).json(transaction);
});

// @desc    Get buyer's transactions
// @route   GET /api/transactions/buyer
// @access  Private/Buyer
const getBuyerTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ buyerId: req.user._id })
        .populate('cropId', 'cropName cropImage price')
        .populate('farmerId', 'name phone email location profileImage')
        .sort({ createdAt: -1 });
    res.json(transactions);
});

// @desc    Get farmer's transactions
// @route   GET /api/transactions/farmer
// @access  Private/Farmer
const getFarmerTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ farmerId: req.user._id })
        .populate('cropId', 'cropName cropImage price')
        .populate('buyerId', 'name phone email location profileImage')
        .sort({ createdAt: -1 });
    res.json(transactions);
});

// @desc    Update transaction status
// @route   PUT /api/transactions/:id
// @access  Private/Farmer, Buyer, Admin
const updateTransactionStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id)
        .populate('cropId')
        .populate('buyerId')
        .populate('farmerId');

    if (transaction) {
        transaction.status = status;
        const updatedTransaction = await transaction.save();

        const crop = transaction.cropId;

        // If Accepted by Farmer: Update Crop Status and Notify Buyer
        if (status === 'Accepted') {
            if (crop) {
                crop.status = 'Purchasal in progress';
                await crop.save();
            }
            await Notification.create({
                userId: transaction.buyerId,
                message: `Your purchase request for ${crop.cropName} has been ACCEPTED by the farmer.`,
                cropId: crop._id
            });
        }

        // If Completed: reduce crop quantity and finalize status
        if (status === 'Completed') {
            if (crop) {
                crop.quantity -= transaction.quantity;
                if (crop.quantity <= 0) {
                    crop.status = 'Sold';
                } else if (crop.status === 'Purchasal in progress') {
                    // Revert to Verified if part of it was sold but more remains?
                    // Actually, the user says "shown purchasal in progress... for others".
                    // Usually this means the entire listing is under negotiation.
                    // For now, let's set it to Sold or Verified based on remaining qty.
                    crop.status = 'Verified';
                }
                await crop.save();
            }
            await Notification.create({
                userId: transaction.buyerId,
                message: `Purchase transaction for ${crop.cropName} has been COMPLETED successfully!`,
                cropId: crop._id
            });
        }

        // If Cancelled/Rejected
        if (status === 'Cancelled') {
             if (crop && crop.status === 'Purchasal in progress') {
                 crop.status = 'Verified';
                 await crop.save();
             }
             // Notify the other party
             const targetUserId = req.user._id.toString() === transaction.buyerId._id.toString() 
                ? transaction.farmerId : transaction.buyerId;
             
             await Notification.create({
                userId: targetUserId,
                message: `Transaction for ${crop.cropName} has been CANCELLED.`,
                cropId: crop._id
            });
        }

        res.json(updatedTransaction);
    } else {
        res.status(404);
        throw new Error('Transaction not found');
    }
});

export { requestPurchase, getBuyerTransactions, getFarmerTransactions, updateTransactionStatus };
