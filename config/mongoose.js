import mongoose from 'mongoose';

const mongoURI = 'mongodb://localhost:27017/bologdb';  // Replace 'yourdbname' with your actual database name

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
