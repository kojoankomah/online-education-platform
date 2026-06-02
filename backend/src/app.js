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

// Routes
app.use("/api", require("./routes/dbRoutes"));


module.exports = app;