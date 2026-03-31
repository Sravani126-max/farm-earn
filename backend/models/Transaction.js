import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        buyerId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        farmerId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        cropId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Crop',
            required: true,
        },
        status: {
            type: String,
            enum: ['Requested', 'Accepted', 'Completed', 'Cancelled'],
            default: 'Requested',
        },
        date: {
            type: Date,
            default: Date.now,
        },
        quantity: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
