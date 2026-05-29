import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

export const verifyToken = (req, res, next) => {
  try {
    // Read token from Authorization header or cookie
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );

    // Store user details
    req.user = decodedToken;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};