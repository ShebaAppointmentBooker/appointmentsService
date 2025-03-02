import * as dotenv from 'dotenv'
dotenv.config();
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import appointmentRoutes from './routes/appointmentRoutes';



const app = express();
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

connectDB();

// Use routes
app.use('/appointments', appointmentRoutes);

app.listen(5001, () => {
  console.log('Server running on port 5001');
});
