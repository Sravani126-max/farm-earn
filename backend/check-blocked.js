import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const checkBlockedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            isBlocked: Boolean
        }));

        const users = await User.find({ isBlocked: true });
        console.log(`Found ${users.length} blocked users:`);
        users.forEach(u => console.log(`- ${u.email}`));
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkBlockedUsers();
