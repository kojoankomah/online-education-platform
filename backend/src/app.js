const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Online Education Platform API is running");
});

/**
 * AUTH ROUTES
 * Handles registration and login
 */
app.use("/api/auth", require("./routes/authRoutes"));

// Protected route example
app.use(
  "/api/protected",
  require("./routes/protectedRoutes")
);

// Course routes
app.use("/api/courses", require("./routes/courseRoutes"));

// Protected route example
app.use("/api/protected", require("./routes/protectedRoutes"));

// Enrollment routes
app.use(
  "/api/enrollments",
  require("./routes/enrollmentRoutes")
);

// Lessons routes
app.use(
  "/api/lessons",
  require("./routes/lessonRoutes")
);
module.exports = app;