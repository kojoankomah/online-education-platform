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

module.exports = app;