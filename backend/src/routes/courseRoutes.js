const express = require("express");

const upload =
  require("../middleware/uploadMiddleware");

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
router.get(
  "/:id",
  authMiddleware,
  getCourseById
);

/**
 * PROTECTED: Create course (instructor only)
 */
/*router.post(
  "/",
  authMiddleware,
  roleMiddleware("instructor"),
  upload.single("image"),
  createCourse
);*/
router.post(
  "/",
  authMiddleware,
  roleMiddleware("instructor"),
  upload.single("image"),

  (req, res, next) => {

    console.log("=== CREATE COURSE DEBUG ===");

    console.log(
      "Content-Type:",
      req.headers["content-type"]
    );

    console.log(
      "Body:",
      req.body
    );

    console.log(
      "File:",
      req.file
        ? {
            fieldname: req.file.fieldname,
            mimetype: req.file.mimetype,
            size: req.file.size
          }
        : null
    );

    console.log("===========================");

    next();
  },

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
  upload.single("image"),
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