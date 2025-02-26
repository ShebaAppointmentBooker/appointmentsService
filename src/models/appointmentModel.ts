import mongoose, { Schema, Document } from "mongoose";

interface IAppointment extends Document {
  doctor: Schema.Types.ObjectId;
  patient?: Schema.Types.ObjectId; // Optional for available appointments
  date: Date;
  type: Schema.Types.ObjectId; // Reference to Specialization
  subtype: Schema.Types.ObjectId; // Reference to AppointmentType
  status: "Available" | "Booked" | "Completed" | "Cancelled";
}

const appointmentSchema = new Schema<IAppointment>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", default: null }, // Optional
    date: { type: Date, required: true },
    type: { type: Schema.Types.ObjectId, ref: "Specialization", required: true },
    subtype: { type: Schema.Types.ObjectId, ref: "AppointmentType", required: true },
    status: {
      type: String,
      enum: ["Available", "Booked", "Completed", "Cancelled"],
      default: "Available",
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model<IAppointment>("Appointment", appointmentSchema);
export default Appointment;
