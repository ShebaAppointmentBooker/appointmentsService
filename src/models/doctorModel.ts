import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  email: string;
  nationalId: string;
  specializations: Schema.Types.ObjectId[]; // Updated to an array for multiple specializations
  phone?: string;
  refreshToken?: string;
  createdAt: Date;
}

const doctorSchema = new Schema<IDoctor>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  nationalId: { type: String, required: true, unique: true },
  specializations: [{ type: Schema.Types.ObjectId, ref: "Specialization", required: true }], // Array of specializations
  phone: { type: String },
  refreshToken: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const Doctor = mongoose.model<IDoctor>("Doctor", doctorSchema);

export default Doctor;
