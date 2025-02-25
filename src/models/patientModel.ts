// /models/patientModel.ts
import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  nationalId: { type: String, required: true, unique: true },
  medicalHistory: { type: String },
  phone: { type: String },
  refreshToken: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
