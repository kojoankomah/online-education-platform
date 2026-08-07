const express = require("express");


const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseById,
  getCourseForManagement,
  updateCourse,
  deleteCourse
} = require("../controllers/courseController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/**
 * PUBLIC: View all courses
 */
router.get("/", getAllCourses);

/**
 * PROTECTED:
 * Instructor can manage only their own course
 */
router.get(
  "/:id/manage",
  authMiddleware,
  roleMiddleware("instructor"),
  getCourseForManagement
);


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

/**
 * Update course
 * Instructor owner only
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("instructor"),
  updateCourse
);

/**
 * Delete course
 * Instructor owner only
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("instructor"),
  deleteCourse
);

module.exports = router;