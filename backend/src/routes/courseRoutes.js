const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseById
} = require("../controllers/courseController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/**
 * PUBLIC: View all courses
 */
router.get("/", getAllCourses);

/**
 * PUBLIC: View single course
 */
router.get("/:id", getCourseById);

/**
 * PROTECTED: Create course (instructor only)
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("instructor"),
  createCourse
);

module.exports = router;