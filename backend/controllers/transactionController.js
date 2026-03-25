import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// @desc    Request to purchase a crop
// @route   POST /api/transactions/request
// @access  Private/Buyer
const requestPurchase = asyncHandler(async (req, res) => {
    const { cropId, quantity } = req.body;

    const crop = await mongoose.model('Crop').findById(cropId);

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

    const transaction = await mongoose.model('Transaction').create({
        buyerId: req.user._id,
        farmerId: crop.farmerId,
        cropId,
        quantity,
        totalPrice: crop.price * quantity,
        status: 'Requested'
    });

    res.status(201).json(transaction);
});

// @desc    Get buyer's transactions
// @route   GET /api/transactions/buyer
// @access  Private/Buyer
const getBuyerTransactions = asyncHandler(async (req, res) => {
    const transactions = await mongoose.model('Transaction').find({ buyerId: req.user._id })
        .populate('cropId', 'cropName cropImage price')
        .populate('farmerId', 'name phone');
    res.json(transactions);
});

// @desc    Get farmer's transactions
// @route   GET /api/transactions/farmer
// @access  Private/Farmer
const getFarmerTransactions = asyncHandler(async (req, res) => {
    const transactions = await mongoose.model('Transaction').find({ farmerId: req.user._id })
        .populate('cropId', 'cropName cropImage price')
        .populate('buyerId', 'name phone');
    res.json(transactions);
});

// @desc    Update transaction status
// @route   PUT /api/transactions/:id
// @access  Private/Farmer, Buyer, Admin
const updateTransactionStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const transaction = await mongoose.model('Transaction').findById(req.params.id);

    if (transaction) {
        transaction.status = status;
        const updatedTransaction = await transaction.save();

        // If completed, potentially reduce crop quantity
        if (status === 'Completed') {
            const crop = await mongoose.model('Crop').findById(transaction.cropId);
            if (crop) {
                crop.quantity -= transaction.quantity;
                if (crop.quantity <= 0) crop.status = 'Sold';
                await crop.save();
            }
        }

        res.json(updatedTransaction);
    } else {
        res.status(404);
        throw new Error('Transaction not found');
    }
});

export { requestPurchase, getBuyerTransactions, getFarmerTransactions, updateTransactionStatus };
