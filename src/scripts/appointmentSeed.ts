require("dotenv").config();
import mongoose from "mongoose";
import Doctor from "../models/doctorModel";
import Appointment from "../models/appointmentModel";
import Specialization from "../models/specializationModel";
import AppointmentType from "../models/appointmentTypeModel";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Generate random future dates for appointments
const getRandomFutureDate = () => {
  const daysToAdd = Math.floor(Math.random() * 30) + 1; // Random date within the next 30 days
  const hoursToAdd = Math.floor(Math.random() * 8) + 9; // Random hour between 9AM and 5PM
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  date.setHours(hoursToAdd, 0, 0, 0);
  return date;
};

// Generate available appointments
const generateAppointments = async () => {
  await connectDB();
  console.log("getting doctors...");
  const appointmentTypes = await AppointmentType.find(); // All appointment types

  if (!appointmentTypes.length) {
    console.error("No appointment types found!");
    return;
  }
  const Specializationypes = await Specialization.find(); // All appointment types

  if (!Specializationypes.length) {
    console.error("No Specialization types found!");
    return;
  }
  const doctors = await Doctor.find().populate("specializations");
  console.log("fetched doctors succsessfully");

  for (const doctor of doctors) {
    console.log(doctor.name);
    const { specializations } = doctor;

    for (let i = 0; i < 5; i++) {
      const randomSpecialization =
        specializations[Math.floor(Math.random() * specializations.length)];

      // Filter relevant appointment types based on specialization (if needed)
      const relevantAppointmentTypes = appointmentTypes; // Modify if needed for specialization-specific types
      const randomAppointmentType =
        relevantAppointmentTypes[
          Math.floor(Math.random() * relevantAppointmentTypes.length)
        ];

      const appointment = new Appointment({
        doctor: doctor._id,
        date: getRandomFutureDate(),
        type: randomSpecialization,
        subtype: randomAppointmentType._id,
        status: "Available",
      });

      await appointment.save();
      console.log(
        `Created appointment for Dr. ${doctor.name} (${randomSpecialization}) - ${randomAppointmentType.name}`
      );
    }
  }

  console.log("All appointments created successfully!");
  process.exit();
};

generateAppointments().catch((err) => {
  console.error("Error generating appointments:", err);
  process.exit(1);
});
