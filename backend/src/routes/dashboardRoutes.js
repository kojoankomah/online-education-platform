const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { getStudentDashboard,
        getInstructorDashboard
 } = require("../controllers/dashboardController");

/**
 * Student dashboard
 */
router.get(
  "/student",
  auth,
  getStudentDashboard
);


// Instructor dashboard
router.get(
  "/instructor",
  auth,
  getInstructorDashboard
);



module.exports = router;