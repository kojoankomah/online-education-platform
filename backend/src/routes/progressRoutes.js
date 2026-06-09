const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  completeLesson,
  getCompletedLessons,
  getCourseProgress
} = require("../controllers/progressController");

/**
 * Mark lesson complete
 */
router.post(
  "/lesson/:lessonId/complete",
  auth,
  completeLesson
);

/**
 * Get completed lessons in a course
 */
router.get(
  "/course/:courseId/lessons",
  auth,
  getCompletedLessons
);


/**
 * Full course progress
 */
router.get(
  "/course/:courseId",
  auth,
  getCourseProgress
);



module.exports = router;