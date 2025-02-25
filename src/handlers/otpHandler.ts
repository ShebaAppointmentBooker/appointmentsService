import jwt from "jsonwebtoken";
import { Request, Response } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "yourRefreshSecret";
const JWT_EXPIRES_IN = "1h";
export const requestOtpHandler = async (
  model: any,
  req: Request,
  res: Response
) => {
  const { nationalId } = req.body;

  try {
    const user = await model.findOne({ nationalId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create a short-lived JWT with the OTP and user ID
    const token = jwt.sign({ userId: user._id, otp }, JWT_SECRET, {
      expiresIn: "2m",
    });

    // Mock sending the OTP to the user (e.g., via SMS)
    console.log(`Your OTP is: ${otp}`);

    return res.json({ token, otp, user: user.name, expMinutes: 2 });
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const loginWithOtpHandler = async (
  model: any,
  req: Request,
  res: Response
) => {
  const { token, otp } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      otp: string;
    };

    // Check if the OTP matches
    if (decoded.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Generate a long-lived access token and refresh token
    const accessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    const refreshToken = jwt.sign(
      { userId: decoded.userId },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );
    await model.findByIdAndUpdate(decoded.userId, { refreshToken });
    return res.json({
      accessToken,
      refreshToken,
      message: "Logged in successfully",
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired:", error);
      return res
        .status(401)
        .json({ message: "OTP expired. Please request a new one." });
    } else {
      console.error("Invalid token:", error);
      return res.status(401).json({ message: "Invalid or malformed token" });
    }
  }
};
