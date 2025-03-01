import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload | string;
  }
}

export const jwtRequired = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ message: "Authorization header missing or malformed" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    console.log(token)
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("valid token, next ",decoded)
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
