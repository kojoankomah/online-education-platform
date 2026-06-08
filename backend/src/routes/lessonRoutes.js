const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createLesson,
  getCourseLessons
} = require("../controllers/lessonController");

/**
 * View lessons in a course
 */
router.get(
  "/course/:courseId",
  getCourseLessons
);

/**
 * Create lesson
 */
router.post(
  "/course/:courseId",
  authMiddleware,
  roleMiddleware("instructor"),
  createLesson
);

module.exports = router;