import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
    {
        cropName: {
            type: String,
            required: [true, 'Please add a crop name'],
            trim: true,
        },
        farmerId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Please add a quantity'],
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
        },
        harvestDate: {
            type: Date,
            required: [true, 'Please add a harvest date'],
        },
        cropImage: {
            type: String,
            default: '',   // No longer required
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        farmingMethod: {
            type: String,
            enum: ['Organic', 'Non-Organic'],
            required: true,
            default: 'Non-Organic'
        },
        status: {
            type: String,
            enum: ['Pending verification', 'Verified', 'Rejected', 'Sold', 'Purchasal in progress'],
            default: 'Pending verification',
        },
        agentVerification: {
            status: {
                type: String,
                enum: ['Pending', 'Verified', 'Rejected'],
                default: 'Pending',
            },
            report: {
                type: String,
                default: '',
            },
            agentId: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
            inspectionImages: {
                type: [String],
                default: [],
            },
        },
        // Location is now optional — stored only if GPS is available
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                default: [0, 0],   // Default to [0,0] when no GPS
            },
            address: {
                type: String,
                default: '',
            }
        },
    },
    {
        timestamps: true,
    }
);

// Only use 2dsphere index when coordinates are valid
cropSchema.index({ location: '2dsphere' });

const Crop = mongoose.model('Crop', cropSchema);

export default Crop;
