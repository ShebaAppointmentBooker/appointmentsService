import mongoose, { Schema, Document } from "mongoose";

export interface ISpecialization extends Document {
  name: string;
}

const specializationSchema = new Schema<ISpecialization>({
  name: { type: String, required: true, unique: true },
});

const Specialization = mongoose.model<ISpecialization>("Specialization", specializationSchema);

export default Specialization;
