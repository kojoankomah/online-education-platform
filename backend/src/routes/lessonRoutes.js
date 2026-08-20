const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createLesson,
    updateLesson,
    deleteLesson,
    getCourseLessons,
    getLessonById
} = require("../controllers/lessonController");

/**
 * View lessons in a course
 */
router.get(
  "/course/:courseId",
  authMiddleware,
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

/**
 * Update lesson
 */
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("instructor"),
    updateLesson
);

/**
 * Delete lesson
 */
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("instructor"),
    deleteLesson
);


// Get lesson by ID
router.get(
"/:id",
authMiddleware,
getLessonById
);

module.exports = router;