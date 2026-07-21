import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async(): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URI!)

        console.log('Database connected');
        
    } catch (error) {
        console.log('Database connection failed');

        process.exit(1);
        
    }
}