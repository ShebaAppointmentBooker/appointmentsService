// /controllers/doctorController.ts
import Doctor from "../models/doctorModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { refreshTokenHandler } from "../handlers/refreshTokenHandler";
import { loginWithOtpHandler, requestOtpHandler } from "../handlers/otpHandler";
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "yourRefreshSecret";
const JWT_EXPIRES_IN = "1h";
export const registerDoctor = async (
  name: string,
  email: string,
  nationalId: string,
  specialization: string
) => {
  try {
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      console.log("Doctor with this email already exists");
      return;
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new Doctor({
      name,
      email,
      // password: hashedPassword,
      nationalId,
      specialization,
      phone: "N/A", // You can customize this to include a phone or other properties
    });

    await newDoctor.save();
    console.log(`Doctor ${name} registered successfully`);
  } catch (error) {
    console.error("Error registering doctor:", error);
  }
};
export const requestOtpDoctor = async (
  req: Request,
  res: Response
): Promise<any> => {
  requestOtpHandler(Doctor, req, res);
};
export const loginDoctorOtp = async (
  req: Request,
  res: Response
): Promise<any> => {
  loginWithOtpHandler(Doctor,req, res);
};
// export const loginDoctor = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { email, password } = req.body;

//   try {
//     const doctor = await Doctor.findOne({ email });
//     if (!doctor) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const isMatch = await bcrypt.compare(password, doctor.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     // Generate Access Token
//     const accessToken = jwt.sign(
//       { userId: doctor._id, role: "doctor" },
//       JWT_SECRET,
//       { expiresIn: JWT_EXPIRES_IN }
//     );

//     // Generate Refresh Token
//     const refreshToken = jwt.sign(
//       { userId: doctor._id, role: "doctor" },
//       REFRESH_TOKEN_SECRET,
//       { expiresIn: "7d" }
//     );

//     doctor.refreshToken = refreshToken;
//     await doctor.save();

//     res.status(200).json({
//       user: doctor.name,
//       accessToken,
//       refreshToken,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const refreshDoctorToken = (req: Request, res: Response) => {
  refreshTokenHandler(Doctor, req, res);
};
// Doctor Logout
export const logoutDoctor = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { refreshToken } = req.body;

  try {
    const doctor = await Doctor.findOne({ refreshToken });
    if (!doctor) return res.status(400).json({ message: "Invalid token" });

    doctor.refreshToken = "";
    await doctor.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error during logout" });
  }
};
