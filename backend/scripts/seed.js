import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Crop from '../models/Crop.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing data
        await User.deleteMany();
        await Crop.deleteMany();
        await Transaction.deleteMany();
        
        // Drop indexes if they exist (to fix Geo extraction error)
        try {
            await Crop.collection.dropIndexes();
            console.log('Dropped existing indexes on crops.');
        } catch (e) {
            console.log('No indexes to drop or collection does not exist.');
        }

        console.log('Cleared existing data.');

        // 1. Create Users
        const users = await User.insertMany([
            {
                name: 'Ramesh Kumar',
                email: 'ramesh.farmer@example.com',
                phone: '9876543210',
                aadhar: '123456789012',
                firebaseUid: 'farmer_demo_uid_123',
                role: 'Farmer',
                location: 'Punjab, India',
                isVerified: true
            },
            {
                name: 'Suresh Raina',
                email: 'suresh.buyer@example.com',
                phone: '8765432109',
                aadhar: '234567890123',
                firebaseUid: 'buyer_demo_uid_456',
                role: 'Buyer',
                location: 'Delhi, India',
                isVerified: true
            },
            {
                name: 'Amit Shah',
                email: 'amit.agent@example.com',
                phone: '7654321098',
                aadhar: '345678901234',
                firebaseUid: 'agent_demo_uid_789',
                role: 'Agent',
                location: 'Haryana, India',
                isVerified: true
            }
        ]);

        const farmer = users[0];
        const buyer = users[1];
        const agent = users[2];

        console.log('Users created.');

        // 2. Create Crops
        const crops = await Crop.insertMany([
            {
                cropName: 'Basmati Rice',
                farmerId: farmer._id,
                quantity: 100,
                price: 3500,
                harvestDate: new Date('2024-10-15'),
                cropImage: 'https://images.unsplash.com/photo-1586201375761-83865003e31c?auto=format&fit=crop&q=80&w=800',
                description: 'High quality long grain Basmati rice from the fields of Punjab.',
                category: 'Available Crops',
                status: 'Verified',
                location: 'Punjab, India',
                agentVerification: {
                    status: 'Verified',
                    agentId: agent._id,
                    report: 'Grain quality is top notch.'
                }
            },
            {
                cropName: 'Organic Wheat',
                farmerId: farmer._id,
                quantity: 150,
                price: 2400,
                harvestDate: new Date('2024-11-20'),
                cropImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
                description: 'Pure organic wheat, no pesticides used.',
                category: 'Available Crops',
                status: 'Pending verification',
                location: 'Punjab, India'
            },
            {
                cropName: 'Corn (Maize)',
                farmerId: farmer._id,
                quantity: 80,
                price: 1800,
                harvestDate: new Date('2024-09-05'),
                cropImage: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=800',
                description: 'Sweet corn ready for industrial use.',
                category: 'Crops Going To Sell',
                status: 'Sold',
                location: 'Punjab, India'
            }
        ]);

        console.log('Crops created.');

        // 3. Create Transactions
        await Transaction.insertMany([
            {
                buyerId: buyer._id,
                farmerId: farmer._id,
                cropId: crops[2]._id,
                status: 'Completed',
                quantity: 80,
                totalPrice: 144000,
                date: new Date('2024-12-01')
            },
            {
                buyerId: buyer._id,
                farmerId: farmer._id,
                cropId: crops[0]._id,
                status: 'Requested',
                quantity: 50,
                totalPrice: 175000,
                date: new Date()
            }
        ]);

        console.log('Transactions created.');
        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
