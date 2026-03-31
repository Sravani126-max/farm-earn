import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correctly load .env from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const normalizeRoles = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            role: String
        }));

        const users = await User.find({});
        console.log(`Checking ${users.length} users...`);

        let updatedCount = 0;

        for (const user of users) {
            if (!user.role) continue;

            const normalizedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
            
            if (user.role !== normalizedRole) {
                console.log(`Normalizing role for ${user.email}: ${user.role} -> ${normalizedRole}`);
                user.role = normalizedRole;
                await user.save();
                updatedCount++;
            }
        }

        console.log(`Normalization complete. Total updated: ${updatedCount}`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error during normalization:', error);
        process.exit(1);
    }
};

normalizeRoles();
