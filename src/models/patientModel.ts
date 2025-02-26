// /models/patientModel.ts
import mongoose, { Schema, Document } from "mongoose";

interface IPatient extends Document {
  name: string;
  email: string;
  nationalId: string;
  phone?: string;
  medicalHistory?:string;
  refreshToken:string;
  appointments: Schema.Types.ObjectId[]; // Array of appointment references
}

const patientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    nationalId: { type: String, required: true, unique: true },
    phone: { type: String },
    medicalHistory: { type: String },
    refreshToken: { type: String, default: "" },
    appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }], // Reference to Appointment model
  },
  { timestamps: true }
);

const Patient = mongoose.model<IPatient>("Patient", patientSchema);

export default Patient;
