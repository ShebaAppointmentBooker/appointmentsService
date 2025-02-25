// /controllers/authController.ts
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import Doctor from "../models/doctorModel"; // Doctor model
import Patient from "../models/patientModel"; // Patient model
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "yourRefreshSecret";

// Reusable function to handle both Doctor and Patient
export const refreshTokenHandler = async (
  model: any,
  req: Request,
  res: Response
) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
      userId: string;
    };

    // Try finding the user in the passed model (Doctor or Patient)
    const user = await model.findById(decoded.userId);

    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    // Create new access token
    const newAccessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Invalidate the old refresh token by replacing it with a new one in the database
    user.refreshToken = newRefreshToken;
    await user.save();
    // Optionally rotate refresh token (in a real case, you could also generate and send a new refresh token)
    res.json({
      accessToken: newAccessToken,
      refreshToken:newRefreshToken, // You may rotate refresh tokens as well (send new refreshToken if you want to)
    });
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

// Specific routes for doctor and patient
