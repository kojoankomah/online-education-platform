const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Verify JWT token
 * Protects routes from unauthorized access
 */
const authMiddleware = (req, res, next) => {
  try {
    // Expected format:
    // Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided."
      });
    }

    // Extract token from "Bearer TOKEN"
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;