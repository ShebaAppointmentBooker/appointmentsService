import mongoose, { Schema, Document, Types } from "mongoose";

// Doctor, Specialization, and AppointmentType interfaces
interface IDoctor {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

interface ISpecialization {
  _id: Types.ObjectId;
  name: string;
}

interface IAppointmentType {
  _id: Types.ObjectId;
  name: string;
}

interface IAppointment extends Document {
  doctor: Types.ObjectId | IDoctor;
  patient?: Types.ObjectId;
  date: Date;
  type: Types.ObjectId | ISpecialization; // Reference to Specialization
  subtype: Types.ObjectId | IAppointmentType; // Reference to AppointmentType
  status: "Available" | "Booked" | "Completed" | "Cancelled";
  resolution: string;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", default: null },
    date: { type: Date, required: true },
    type: {
      type: Schema.Types.ObjectId,
      ref: "Specialization",
      required: true,
    },
    subtype: {
      type: Schema.Types.ObjectId,
      ref: "AppointmentType",
      required: true,
    },
    status: {
      type: String,
      enum: ["Available", "Booked", "Completed", "Cancelled"],
      default: "Available",
    },
    resolution: { type: String, default: "" },
  },
  { timestamps: true }
);

const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);
export default Appointment;
