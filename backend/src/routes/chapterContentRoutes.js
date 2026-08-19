const express = require("express");

const router = express.Router();

const {
    createContentBlock,
    updateContentBlock,
    deleteContentBlock,
    reorderContentBlocks,
    getContentBlocksByChapter,
    getStudentContentBlocksByChapter
} = require("../controllers/chapterContentController");

const authMiddleware =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");


/**
 * Create chapter content block
 * Instructor only
 */
router.post(
    "/",
    authMiddleware,
    roleMiddleware("instructor"),
    createContentBlock
);


/**
 * Reorder content blocks in a chapter
 * Instructor owner only
 */
router.patch(
    "/chapter/:chapterId/reorder",
    authMiddleware,
    roleMiddleware("instructor"),
    reorderContentBlocks
);

/**
 * Update content block
 * Instructor owner only
 */
router.patch(
    "/:blockId",
    authMiddleware,
    roleMiddleware("instructor"),
    updateContentBlock
);


/**
 * Delete content block
 * Instructor owner only
 */
router.delete(
    "/:blockId",
    authMiddleware,
    roleMiddleware("instructor"),
    deleteContentBlock
);


/**
 * Get all content blocks for a chapter
 * Instructor owner only
 */
router.get(
    "/chapter/:chapterId",
    authMiddleware,
    roleMiddleware("instructor"),
    getContentBlocksByChapter
);


/**
 * Get chapter content
 * Student only
 * Student must be enrolled and chapter unlocked
 */
router.get(
    "/student/chapter/:chapterId",
    authMiddleware,
    roleMiddleware("student"),
    getStudentContentBlocksByChapter
);



module.exports = router;