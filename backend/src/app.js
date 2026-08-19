const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.get(
    "/api/health",
    (req, res) => {

        res.status(200).json({
            message:
                "EduPlatform API is running"
        });

    }
);


// Test route
app.get("/", (req, res) => {
  res.send("On-line Education Platform API is running");
});

/**
 * AUTH ROUTES
 * Handles registration and login
 */
app.use("/api/auth", require("./routes/authRoutes"));


// Course routes
app.use("/api/courses", require("./routes/courseRoutes"));


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


// Chapter routes
app.use(
  "/api/chapters",
  require("./routes/chapterRoutes")
);


// Chapter content routes
app.use(
  "/api/chapter-content",
  require("./routes/chapterContentRoutes")
);


// Quiz routes
app.use(
  "/api/quizzes",
  require("./routes/quizRoutes")
);


// Progress routes
app.use(
  "/api/progress",
   require("./routes/progressRoutes"));


// Dashboard routes
   app.use(
    "/api/dashboard",
     require("./routes/dashboardRoutes"));



module.exports = app;