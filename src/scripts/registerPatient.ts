import * as dotenv from 'dotenv'
import mongoose from 'mongoose';
import { registerPatient } from '../controllers/patientController';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Run the registration
const register = async () => {
  await connectDB();

  // Static data for patient registration
  const name = 'Lior Aviv';
  const email = 'lioraviv1312@gmail.com';
  const nationalId = '323104059';
  const medicalHistory = 'IBS';

  await registerPatient(name, email, nationalId, medicalHistory);
};

register().then(() => {
  console.log('Patient registration complete');
  process.exit();
});
