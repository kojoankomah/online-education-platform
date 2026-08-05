const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const roleMiddleware =
require("../middleware/roleMiddleware");

const {
  completeLesson,
  getCompletedLessons,
  getCourseProgress,
  checkLessonCompletion
} = require("../controllers/progressController");


// Mark lesson complete
router.post(
"/lesson/:lessonId/complete",
auth,
roleMiddleware("student"),
completeLesson
);


// Check lesson completion
router.get(
  "/lesson/:lessonId",
  auth,
  checkLessonCompletion
);


// Get completed lessons in a course
router.get(
  "/course/:courseId/lessons",
  auth,
  getCompletedLessons
);


// Full course progress
router.get(
  "/course/:courseId",
  auth,
  getCourseProgress
);


module.exports = router;