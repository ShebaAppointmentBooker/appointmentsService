// /controllers/patientController.ts
import Patient from "../models/patientModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { refreshTokenHandler } from "../handlers/refreshTokenHandler";
import { loginWithOtpHandler, requestOtpHandler } from "../handlers/otpHandler";
import AppointmentType, { IAppointmentType } from "../models/appointmentTypeModel";
import Appointment from "../models/appointmentModel";
import { IDoctor } from "../models/doctorModel";
import { ISpecialization } from "../models/specializationModel";
export const getAvailableAppointmentsByType = async (req: Request, res: Response):Promise<any> => {
  try {
    const { type } = req.body;

    if (!type || typeof type !== "string" || type.trim() === "") {
      return res.status(400).json({ error: "Appointment type is required and must be a non-empty string." });
    }

    // Find the matching AppointmentType by name
    const appointmentType = await AppointmentType.findOne({ name: type });
    if (!appointmentType) {
      return res.status(404).json({ error: "Appointment type not found." });
    }

    // Find all available appointments with the specified subtype
    const appointments = await Appointment.find({
      status: "Available",
      subtype: appointmentType._id,
    })
      .populate("doctor", "name email")
      .populate("type", "name")
      .populate("subtype", "name");

    // Format the data for frontend
    const formattedAppointments = appointments.map((appointment) => ({
      appointmentId: appointment._id,
      date: appointment.date,
      doctor: {
        doctorId: (appointment.doctor as IDoctor)._id, // Safely access _id
        name: (appointment.doctor as IDoctor).name,
        email: (appointment.doctor as IDoctor).email,
      },
      specialization: (appointment.type as ISpecialization).name,
      appointmentType: (appointment.subtype as IAppointmentType).name,
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
