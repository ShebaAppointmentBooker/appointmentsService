// /controllers/patientController.ts
import Patient from "../models/patientModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { refreshTokenHandler } from "../handlers/refreshTokenHandler";
import { loginWithOtpHandler, requestOtpHandler } from "../handlers/otpHandler";

// const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
// const REFRESH_TOKEN_SECRET =
//   process.env.REFRESH_TOKEN_SECRET || "yourRefreshSecret";

export const registerPatient = async (
  name: string,
  email: string,
  // password: string,
  nationalId: string,
  medicalHistory: string
) => {
  try {
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      console.log("Patient with this email already exists");
      return;
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = new Patient({
      name,
      email,
      // password: hashedPassword,
      nationalId,
      medicalHistory,
      phone: "N/A", // You can customize this to include a phone or other properties
    });

    await newPatient.save();
    console.log(`Patient ${name} registered successfully`);
  } catch (error) {
    console.error("Error registering patient:", error);
  }
};
export const requestOtpPatient = async (
  req: Request,
  res: Response
): Promise<any> => {
  requestOtpHandler(Patient, req, res);
};
export const loginPatientOtp = async (
  req: Request,
  res: Response
): Promise<any> => {
  loginWithOtpHandler(Patient, req, res);
};
// Patient Login
// export const loginPatient = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { email, password } = req.body;

//   try {
//     const patient = await Patient.findOne({ email });
//     if (!patient) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const isMatch = await bcrypt.compare(password, patient.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     // Generate Access Token
//     const accessToken = jwt.sign(
//       { userId: patient._id, role: "patient" },
//       JWT_SECRET,
//       { expiresIn: JWT_EXPIRES_IN }
//     );

//     // Generate Refresh Token
//     const refreshToken = jwt.sign(
//       { userId: patient._id, role: "patient" },
//       REFRESH_TOKEN_SECRET,
//       { expiresIn: "7d" }
//     );

//     patient.refreshToken = refreshToken;
//     await patient.save();

//     res.status(200).json({
//       user: patient.name,
//       accessToken,
//       refreshToken,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const refreshPatientToken = (req: Request, res: Response) => {
  refreshTokenHandler(Patient, req, res);
};
// Patient Logout
export const logoutPatient = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { refreshToken } = req.body;

  try {
    const patient = await Patient.findOne({ refreshToken });
    if (!patient) return res.status(400).json({ message: "Invalid token" });

    patient.refreshToken = "";
    await patient.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error during logout" });
  }
};
