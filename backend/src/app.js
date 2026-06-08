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

app.use(
  "/api/protected",
  require("./routes/protectedRoutes")
);


app.use("/api/courses", require("./routes/courseRoutes"));

app.use("/api/protected", require("./routes/protectedRoutes"));

app.use(
  "/api/enrollments",
  require("./routes/enrollmentRoutes")
);

module.exports = app;