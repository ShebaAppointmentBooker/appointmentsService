// /controllers/patientController.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { refreshTokenHandler } from "../handlers/refreshTokenHandler";
import { loginWithOtpHandler, requestOtpHandler } from "../handlers/otpHandler";
import AppointmentType, {
  IAppointmentType,
} from "../models/appointmentTypeModel";
import Appointment from "../models/appointmentModel";
import { IDoctor } from "../models/doctorModel";
import Specialization, { ISpecialization } from "../models/specializationModel";
import mongoose from "mongoose";
import Patient from "../models/patientModel";
import Doctor from "../models/doctorModel";
require("../models/doctorModel");
export const getAllAppointmentTypes = async (req: Request, res: Response) => {
  try {
    const appointmentTypes = await AppointmentType.find();

    const formattedTypes = appointmentTypes.map((type) => ({
      id: type._id,
      name: type.name,
    }));

    res.json(formattedTypes);
  } catch (error) {
    console.error("Error fetching appointment types:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
export const getAllSpecializations = async (req: Request, res: Response) => {
  try {
    const specializations = await Specialization.find();

    const formattedSpecializations = specializations.map((spec) => ({
      id: spec._id,
      name: spec.name,
    }));

    res.json(formattedSpecializations);
  } catch (error) {
    console.error("Error fetching specializations:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
export const getAvailableAppointmentsByType = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { type } = req.body;
    console.log(type)
    if (!type || typeof type !== "string" || type.trim() === "") {
      return res.status(400).json({
        error: "Appointment type is required and must be a non-empty string.",
      });
    }

    // Find the matching AppointmentType by name
    const appointmentType = await Specialization.findOne({ name: type });
    if (!appointmentType) {
      return res.status(404).json({ error: "Appointment type not found." });
    }

    // Find all available appointments with the specified subtype
    const appointments = await Appointment.find({
      status: "Available",
      type: appointmentType._id,
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
    console.log(formattedAppointments)
    res.json(formattedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
export const bookAppointment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const patientId = typeof req.user === "string" ? req.user : undefined;
    const { appointmentId } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "Invalid patient ID." });
    }

    if (!appointmentId) {
      return res.status(400).json({ error: "Appointment ID is required." });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    if (appointment.status !== "Available") {
      return res.status(400).json({ error: "Appointment is not available." });
    }

    // Convert patientId to ObjectId
    const patientObjectId = new mongoose.Types.ObjectId(patientId);

    // Update the appointment
    appointment.status = "Booked";
    appointment.patient = patientObjectId;
    await appointment.save();

    // Update the patient with the booked appointment
    await Patient.findByIdAndUpdate(patientObjectId, {
      $push: { appointments: appointment._id },
    });

    res.json({ message: "Appointment booked successfully." });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
export const cancelAppointment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const patientId = typeof req.user === "string" ? req.user : undefined;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ error: "Appointment ID is required." });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    // Convert patientId to ObjectId
    const patientObjectId = new mongoose.Types.ObjectId(patientId);

    if (appointment.patient?.toString() !== patientObjectId.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to cancel this appointment." });
    }

    // Update the appointment status and remove the patient
    appointment.status = "Available";
    appointment.patient = null;
    await appointment.save();

    // Remove the appointment from the patient's list
    await Patient.findByIdAndUpdate(patientObjectId, {
      $pull: { appointments: appointment._id },
    });

    res.json({ message: "Appointment cancelled successfully." });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
export const getUserAppointments = async (req: Request, res: Response) => {
  try {
    const patientId = typeof req.user === "string" ? req.user : undefined;

    if (!patientId) {
      res.status(400).json({ error: "Invalid patient ID." });
      return;
    }

    // Find the patient and populate the appointments
    const patient = await Patient.findById(patientId)
      .populate({
        path: "appointments",
        populate: [
          { path: "doctor", select: "name specializations" },
          { path: "type", select: "name" },
          { path: "subtype", select: "name" },
        ],
      })
      .exec();

    if (!patient) {
      res.status(404).json({ error: "Patient not found." });
      return;
    }

    // Format the response to be frontend-friendly
    const appointments = patient.appointments.map((appointment: any) => ({
      id: appointment._id,
      date: appointment.date,
      status: appointment.status,
      doctor: {
        id: appointment.doctor._id,
        name: appointment.doctor.name,
        specializations: appointment.doctor.specializations,
      },
      type: {
        id: appointment.type._id,
        name: appointment.type.name,
      },
      subtype: {
        id: appointment.subtype._id,
        name: appointment.subtype.name,
      },
    }));

    res.json({ appointments });
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
