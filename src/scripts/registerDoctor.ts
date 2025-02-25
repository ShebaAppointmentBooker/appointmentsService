require("dotenv").config()
import path from 'path';
import mongoose from "mongoose";
import { registerDoctor } from "../controllers/doctorController";

// dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// console.log(process.env)
// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log(process.env.MONGODB_URI, "lol");
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Run the registration
const register = async () => {
  await connectDB();

  // Static data for doctor registration
  const name = "Dr. John Doe";
  const email = "john.doe@example.com";
  const nationalId = "065165482";
  const specialization = "Cardiology";

  await registerDoctor(name, email, nationalId, specialization);
};

register().then(() => {
  console.log("Doctor registration complete");
  process.exit();
});
