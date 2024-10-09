import mongoose from 'mongoose';
import dotenv from 'dotenv'

dotenv.config();
// const mongoURI = 'mongodb://localhost:27017/bologdb';  // Replace 'yourdbname' with your actual database name

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            // serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
