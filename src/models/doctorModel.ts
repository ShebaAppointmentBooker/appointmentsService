// /models/doctorModel.ts
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  nationalId: { type: String, required: true, unique: true },
  specialization: {
    type: String,
    enum: ["Cardiology", "Neurology", "Dermatology"],
    required: true,
  },
  phone: { type: String },
  refreshToken: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
