import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../backend/models/User.js';
import Crop from '../backend/models/Crop.js';
import Notification from '../backend/models/Notification.js';

dotenv.config({ path: './backend/.env' });

const verifyLocationPriority = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Create a Farmer
        const farmer = await User.findOneAndUpdate(
            { email: 'test.farmer@example.com' },
            { 
                name: 'Test Farmer', 
                role: 'Farmer', 
                location: 'Punjab',
                isBlocked: false
            },
            { upsert: true, new: true }
        );

        // 2. Create two Agents in different locations
        // Agent 1: Near (within 10km of Punjab coordinates [75.8, 30.9])
        const nearAgent = await User.findOneAndUpdate(
            { email: 'near.agent@example.com' },
            { 
                name: 'Near Agent', 
                role: 'Agent', 
                location: 'Ludhiana, Punjab',
                locationCoordinates: { type: 'Point', coordinates: [75.85, 30.95] }
            },
            { upsert: true, new: true }
        );

        // Agent 2: Far (Delhi coordinates [77.1, 28.6])
        const farAgent = await User.findOneAndUpdate(
            { email: 'far.agent@example.com' },
            { 
                name: 'Far Agent', 
                role: 'Agent', 
                location: 'Delhi',
                locationCoordinates: { type: 'Point', coordinates: [77.1, 28.6] }
            },
            { upsert: true, new: true }
        );

        console.log('Agents created/updated.');

        // 3. Simulate Crop Upload in Punjab [75.8, 30.9]
        console.log('Simulating crop upload in Punjab...');
        const cropCoords = [75.8, 30.9];
        
        // Clear old notifications for these agents
        await Notification.deleteMany({ userId: { $in: [nearAgent._id, farAgent._id] } });

        // Search logic (mimicking addCrop)
        let notifiedAgents = await User.find({
            role: 'Agent',
            locationCoordinates: {
                $near: {
                    $geometry: { type: 'Point', coordinates: cropCoords },
                    $maxDistance: 50000 
                }
            }
        });

        console.log(`Found ${notifiedAgents.length} agents within 50km.`);
        notifiedAgents.forEach(a => console.log(` - ${a.name} (${a.location})`));

        if (notifiedAgents.length > 0 && notifiedAgents[0].email === 'near.agent@example.com') {
            console.log('SUCCESS: Nearest agent prioritized correctly!');
        } else {
            console.log('FAILURE: Priority logic failed or near agent not found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verifyLocationPriority();
