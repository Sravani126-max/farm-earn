import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const unblockUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            isBlocked: Boolean
        }));

        const result = await User.updateOne(
            { email: 'ramaiah5496@gmail.com' },
            { isBlocked: false }
        );

        if (result.modifiedCount > 0) {
            console.log(`✅ Success! ramaiah5496@gmail.com has been unblocked.`);
        } else {
            console.log(`⚠️ User was not found or already unblocked.`);
        }
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

unblockUser();
