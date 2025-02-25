import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv'
import doctorRoutes from './routes/doctorRoutes';
import patientRoutes from './routes/patientRoutes';

dotenv.config();

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
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
