const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  enrollInCourse,
  getMyCourses,
  getCourseStudents
} = require("../controllers/enrollmentController");

/**
 * Student enroll in course
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("student"),
  enrollInCourse
);

/**
 * Student view own courses
 */
router.get(
  "/my-courses",
  authMiddleware,
  roleMiddleware("student"),
  getMyCourses
);

/**
 * Instructor view enrolled students
 */
router.get(
  "/course/:courseId/students",
  authMiddleware,
  roleMiddleware("instructor"),
  getCourseStudents
);

module.exports = router;