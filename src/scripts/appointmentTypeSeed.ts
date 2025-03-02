import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import AppointmentType from '../models/appointmentTypeModel'; // Assuming you have an AppointmentType model

// dotenv.config();

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

// Seed data for appointment types
const appointmentTypeData = [
  { name: 'Routine Check-up' },
  { name: 'First Appointment' },
  { name: 'Follow-up' },
  { name: 'Emergency' },
  { name: 'Consultation' },
  { name: 'Physical Examination' },
];

// Seed the appointment type collection
const seedAppointmentTypes = async () => {
  try {
    await connectDB();
    
    // Remove existing documents in AppointmentType collection (Optional, if you want to reset)
    await AppointmentType.deleteMany({});
    console.log('Appointment types collection cleared.');

    // Insert the new appointment types
    const result = await AppointmentType.insertMany(appointmentTypeData);
    console.log('Appointment types seeded:', result);
    process.exit();
  } catch (error) {
    console.error('Error seeding appointment types:', error);
    process.exit(1);
  }
};

seedAppointmentTypes();
