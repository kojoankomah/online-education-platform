const express = require("express");

const router = express.Router();

const {
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    getChaptersByLesson,
    getStudentChaptersByLesson,
    updateStudentChapterProgress
} = require("../controllers/chapterController");

const authMiddleware =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");


/**
 * Create chapter
 * Instructor only
 */
router.post(
    "/",
    authMiddleware,
    roleMiddleware("instructor"),
    createChapter
);


/**
 * Reorder chapters in a lesson
 * Instructor owner only
 */
router.patch(
    "/lesson/:lessonId/reorder",
    authMiddleware,
    roleMiddleware("instructor"),
    reorderChapters
);


/**
 * Update chapter
 * Instructor owner only
 */
router.patch(
    "/:chapterId",
    authMiddleware,
    roleMiddleware("instructor"),
    updateChapter
);


/**
 * Delete chapter
 * Instructor owner only
 */
router.delete(
    "/:chapterId",
    authMiddleware,
    roleMiddleware("instructor"),
    deleteChapter
);


/**
 * Get all chapters for a lesson
 * Instructor owner only
 */
router.get(
    "/lesson/:lessonId",
    authMiddleware,
    roleMiddleware("instructor"),
    getChaptersByLesson
);


/**
 * Get chapters for student learning
 * Student only
 */
router.get(
    "/student/lesson/:lessonId",
    authMiddleware,
    roleMiddleware("student"),
    getStudentChaptersByLesson
);


/**
 * Update student chapter progress
 * Student only
 */
router.patch(
    "/student/:chapterId/progress",
    authMiddleware,
    roleMiddleware("student"),
    updateStudentChapterProgress
);


module.exports = router;