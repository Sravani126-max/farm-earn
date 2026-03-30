import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const testConnection = async () => {
    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('URI:', process.env.MONGO_URI ? 'Found' : 'MISSING');
    
    if (!process.env.MONGO_URI) {
        console.error('Error: MONGO_URI not found in .env file');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds
        });
        console.log(`✅ MongoDB Connected successfully!`);
        console.log(`Host: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        
        // Try a simple operation to "work well" test
        const collections = await conn.connection.db.listCollections().toArray();
        console.log(`✅ Successfully fetched collections: ${collections.length} found`);
        
        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit(0);
    } catch (error) {
        console.error(`❌ Connection failed!`);
        console.error(`Error Message: ${error.message}`);
        if (error.message.includes('ETIMEOUT') || error.message.includes('selection timeout')) {
            console.error('Possible cause: Your IP address might not be whitelisted in MongoDB Atlas Network Access.');
        }
        process.exit(1);
    }
};

testConnection();
