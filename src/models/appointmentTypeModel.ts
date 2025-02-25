import mongoose, { Schema, Document } from "mongoose";

export interface IAppointmentType extends Document {
  name: string;
}

const appointmentTypeSchema = new Schema<IAppointmentType>({
  name: { type: String, required: true, unique: true },
});

const AppointmentType = mongoose.model<IAppointmentType>("AppointmentType", appointmentTypeSchema);

export default AppointmentType;
