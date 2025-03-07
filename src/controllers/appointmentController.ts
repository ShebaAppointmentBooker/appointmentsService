// /controllers/patientController.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import AppointmentType, {
  IAppointmentType,
} from "../models/appointmentTypeModel";
import Appointment from "../models/appointmentModel";
import { IDoctor } from "../models/doctorModel";
import Specialization, { ISpecialization } from "../models/specializationModel";
import mongoose from "mongoose";
import Patient from "../models/patientModel";
import Doctor from "../models/doctorModel";
import { transporter } from "../tools/mailer"; // Import the transporter
import { generateAppointmentEmail } from "../helpers/emailConstructorPatient";
import { scheduleAppointmentReminder } from "../helpers/emailCron";
require("../models/doctorModel");
require("../models/appointmentTypeModel");
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
export const getDoctorsBySpecialization = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("entered");
    const { specializationId } = req.body;

    if (specializationId && typeof specializationId !== "string") {
      res
        .status(400)
        .json({ message: "Specialization ID must be a valid string." });
      return;
    }

    // Fetch doctors based on specialization or all if none provided
    const filter = specializationId
      ? { specializations: specializationId }
      : {};

    const doctors = await Doctor.find(filter)
      .populate("specializations", "name")
      .select("name email phone specializations");

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors by specialization:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getAvailableAppointmentsByType = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { type, subtype, doctorId, date } = req.body;
    console.log("Filters received:", { type, subtype, doctorId, date });
    if (!type || typeof type !== "string" || type.trim() === "") {
      return res.status(400).json({
        error: "Appointment type is required and must be a non-empty string.",
      });
    }
    if (subtype && (typeof subtype !== "string" || subtype.trim() === "")) {
      return res.status(400).json({
        error: "Subtype must be a non-empty string if provided.",
      });
    }
    if (doctorId && (typeof doctorId !== "string" || doctorId.trim() === "")) {
      return res.status(400).json({
        error: "Doctor ID must be a non-empty string if provided.",
      });
    }
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime()) || parsedDate < new Date()) {
        return res.status(400).json({
          error: "Invalid date. Please provide a valid future or today’s date.",
        });
      }
    }
    // Find the matching AppointmentType by name
    // const appointmentType = await Specialization.findOne({ _id: type });
    // if (!appointmentType) {
    //   return res.status(404).json({ error: "Appointment type not found." });
    // }
    const query: any = {
      status: "Available",
      type: type,
      date: { $gte: new Date() },
    };
    if (subtype) {
      // const appointmentSubtype = await AppointmentType.findOne({
      //   _di: subtype,
      // });
      // if (!appointmentSubtype) {
      //   return res
      //     .status(404)
      //     .json({ error: "Appointment subtype not found." });
      // }
      query.subtype = subtype;
    }

    if (doctorId) {
      query.doctor = doctorId;
    }

    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setUTCHours(0, 0, 0, 0); // Set to start of day

      const nextDay = new Date(selectedDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1); // Move to the next day

      query.date = { $gte: selectedDate, $lt: nextDay };
    }
    console.log(query);
    // Find all available appointments with the specified subtype
    const appointments = await Appointment.find(query)
      .populate("doctor", "name email")
      .populate("type", "name")
      .populate("subtype", "name")
      .sort({ date: 1 });

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
    console.log(formattedAppointments);
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

    if (!patientId) throw { status: 400, message: "Invalid patient ID." };
    if (!appointmentId)
      throw { status: 400, message: "Appointment ID is required." };

    // Fetch the appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate("type")
      .populate("doctor")
      .populate("subtype");

    if (!appointment) throw { status: 404, message: "Appointment not found." };
    if (appointment.status !== "Available")
      throw { status: 400, message: "Appointment is not available." };

    // Convert patientId to ObjectId
    const patientObjectId = new mongoose.Types.ObjectId(patientId);

    // Update the appointment status and assign the patient
    appointment.status = "Booked";
    appointment.patient = patientObjectId;
    await appointment.save();

    // Update the patient's appointment list
    const patient = await Patient.findByIdAndUpdate(
      patientObjectId,
      { $push: { appointments: appointment._id } },
      { new: true }
    );

    if (!patient || !patient.email)
      throw { status: 500, message: "Patient email not found." };

    // Generate the email content
    const emailContent = generateAppointmentEmail(patient.name, {
      date: appointment.date,
      doctor: (appointment.doctor as IDoctor).name,
      specialization: (appointment.type as ISpecialization).name,
      subtype: (appointment.subtype as IAppointmentType).name,
    });

    // Try sending the email

    await transporter.sendMail({
      from: "liorhospitalfake@gmx.com",
      to: patient.email,
      subject: "Appointment Confirmation",
      html: emailContent,
    });
    try {
      scheduleAppointmentReminder(appointment, patient);
      console.log("croned it");
    } catch {
      console.log("tried to cron but failed");
    }

    res.json({ message: "Appointment booked successfully." });
  } catch (error: any) {
    console.error("Error booking appointment:", error.message || error);

    // Rollback changes
    if (error.status !== 400 && error.status !== 404) {
      console.log("Rolling back appointment booking...");

      const { appointmentId, patientId } = req.body;
      if (appointmentId) {
        await Appointment.findByIdAndUpdate(appointmentId, {
          status: "Available",
          patient: null,
        });
      }
      if (patientId) {
        await Patient.findByIdAndUpdate(patientId, {
          $pull: { appointments: appointmentId },
        });
      }
      console.log("Rolled back appointment booking...");
    }

    // Send error response
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal server error." });
  }
};
export const getPatientAppointments = async (req: Request, res: Response) => {
  try {
    const patientId = typeof req.user === "string" ? req.user : undefined;
    const { happened } = req.body; // "happened" or "didn't happen"

    if (!patientId) {
      throw { status: 401, message: "Unauthorized: Invalid patient ID." };
    }
    if (!happened && happened != false) {
      throw { status: 400, message: "Invalid happened. Use true or false." };
    }

    // Convert patientId to ObjectId
    const patientObjectId = new mongoose.Types.ObjectId(patientId);

    // Find the patient and populate their appointments
    const patient = await Patient.findById(patientObjectId).populate(
      "appointments"
    );

    if (!patient) {
      throw { status: 404, message: "Patient not found." };
    }

    const now = new Date(); // Current date and time

    // Define query based on "happened" or "didn't happen"
    const query: any = {
      _id: { $in: patient.appointments }, // Get only this patient's appointments
      date: happened ? { $lt: now } : { $gte: now },
    };

    if (happened) {
      query.status = { $in: ["Booked", "Completed", "Cancelled"] }; // Only include completed/cancelled ones
    }

    // Fetch appointments with doctor and type info
    const appointments = await Appointment.find(query)
      .populate("doctor", "name email")
      .populate("type", "name")
      .populate("subtype", "name")
      .sort({ date: 1 });

    // Format response
    const formattedAppointments = appointments.map((appointment) => ({
      appointmentId: appointment._id,
      date: appointment.date,
      doctor: {
        doctorId: (appointment.doctor as any)._id,
        name: (appointment.doctor as any).name,
        email: (appointment.doctor as any).email,
      },
      specialization: (appointment.type as any).name,
      appointmentType: (appointment.subtype as any).name,
      resolution: happened ? appointment.resolution : undefined, // Include resolution only for past ones
    }));

    res.json(formattedAppointments);
  } catch (error: any) {
    console.error("Error fetching patient appointments:", error);
    res
      .status(error?.status || 500)
      .json({ error: error?.message || "Internal server error." });
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
    const now = new Date();
    if (appointment.date < now) {
      return res
        .status(400)
        .json({ error: "Cannot cancel past appointments." });
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
