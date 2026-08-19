const pool = require("../db/connection");


/**
 * Create content block
 * Instructor owner only
 */
const createContentBlock = async (req, res) => {

    try {

        const {
            chapter_id,
            block_type,
            text_content,
            media_url,
            media_public_id,
            block_order
        } = req.body;


        const chapterId =
            Number(chapter_id);

        const blockOrder =
            Number(block_order);


        // =========================
        // BASIC VALIDATION
        // =========================

        if (
            !Number.isInteger(chapterId) ||
            chapterId <= 0
        ) {

            return res.status(400).json({
                message:
                    "A valid chapter ID is required"
            });

        }


        if (
            !Number.isInteger(blockOrder) ||
            blockOrder <= 0
        ) {

            return res.status(400).json({
                message:
                    "Block order must be a positive integer"
            });

        }


        const allowedTypes = [
            "text",
            "video",
            "image",
            "resource"
        ];


        if (
            !allowedTypes.includes(block_type)
        ) {

            return res.status(400).json({
                message:
                    "Invalid content block type"
            });

        }


        // =========================
        // VALIDATE CONTENT TYPE
        // =========================

        let cleanText = null;
        let cleanMediaUrl = null;


        if (block_type === "text") {

            cleanText =
                typeof text_content === "string"
                    ? text_content.trim()
                    : "";


            if (!cleanText) {

                return res.status(400).json({
                    message:
                        "Text content is required for a text block"
                });

            }

        }

        else {

            cleanMediaUrl =
                typeof media_url === "string"
                    ? media_url.trim()
                    : "";


            if (!cleanMediaUrl) {

                return res.status(400).json({
                    message:
                        "Media URL is required for this content type"
                });

            }

        }


        // =========================
        // CHECK CHAPTER + OWNERSHIP
        // =========================

        const chapterResult =
            await pool.query(
                `
                SELECT
                    chapters.id,
                    chapters.lesson_id,
                    lessons.course_id,
                    courses.instructor_id

                FROM chapters

                JOIN lessons
                    ON lessons.id =
                    chapters.lesson_id

                JOIN courses
                    ON courses.id =
                    lessons.course_id

                WHERE chapters.id = $1
                `,
                [chapterId]
            );


        if (
            chapterResult.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Chapter not found"
            });

        }


        const chapter =
            chapterResult.rows[0];


        if (
            Number(chapter.instructor_id) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({
                message:
                    "You can only add content to chapters in your own courses"
            });

        }


        // =========================
        // CHECK BLOCK ORDER
        // =========================

        const orderResult =
            await pool.query(
                `
                SELECT id
                FROM chapter_content_blocks
                WHERE chapter_id = $1
                AND block_order = $2
                `,
                [
                    chapterId,
                    blockOrder
                ]
            );


        if (
            orderResult.rows.length > 0
        ) {

            return res.status(409).json({
                message:
                    "A content block with this order already exists"
            });

        }


        // =========================
        // CREATE CONTENT BLOCK
        // =========================

        const result =
            await pool.query(
                `
                INSERT INTO chapter_content_blocks (
                    chapter_id,
                    block_type,
                    text_content,
                    media_url,
                    media_public_id,
                    block_order
                )

                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6
                )

                RETURNING *
                `,
                [
                    chapterId,
                    block_type,
                    cleanText,
                    cleanMediaUrl,
                    media_public_id || null,
                    blockOrder
                ]
            );


        res.status(201).json({

            message:
                "Content block created successfully",

            content_block:
                result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "Create content block error:",
            error
        );


        res.status(500).json({
            error:
                error.message
        });

    }

};


/**
 * Get content blocks for a chapter
 * Instructor owner only
 */
const getContentBlocksByChapter = async (req, res) => {

    try {

        const chapterId =
            Number(req.params.chapterId);


        if (
            !Number.isInteger(chapterId) ||
            chapterId <= 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid chapter ID"
            });

        }


        // =========================
        // CHECK CHAPTER + OWNERSHIP
        // =========================

        const chapterResult =
            await pool.query(
                `
                SELECT
                    chapters.id,
                    chapters.lesson_id,
                    lessons.course_id,
                    courses.instructor_id

                FROM chapters

                JOIN lessons
                    ON lessons.id =
                    chapters.lesson_id

                JOIN courses
                    ON courses.id =
                    lessons.course_id

                WHERE chapters.id = $1
                `,
                [chapterId]
            );


        if (
            chapterResult.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Chapter not found"
            });

        }


        const chapter =
            chapterResult.rows[0];


        if (
            Number(chapter.instructor_id) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({
                message:
                    "You can only view content from chapters in your own courses"
            });

        }


        // =========================
        // GET CONTENT BLOCKS
        // =========================

        const result =
            await pool.query(
                `
                SELECT
                    id,
                    chapter_id,
                    block_type,
                    text_content,
                    media_url,
                    media_public_id,
                    block_order,
                    created_at

                FROM chapter_content_blocks

                WHERE chapter_id = $1

                ORDER BY block_order ASC
                `,
                [chapterId]
            );


        res.json({

            chapter_id:
                chapterId,

            block_count:
                result.rows.length,

            content_blocks:
                result.rows

        });

    }

    catch (error) {

        console.error(
            "Get content blocks error:",
            error
        );


        res.status(500).json({
            error:
                error.message
        });

    }

};




/**
 * Update content block
 * Instructor owner only
 */
const updateContentBlock = async (req, res) => {

    try {

        const blockId =
            Number(req.params.blockId);


        if (
            !Number.isInteger(blockId) ||
            blockId <= 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid content block ID"
            });

        }


        // =========================
        // GET EXISTING BLOCK
        // =========================

        const blockResult =
            await pool.query(
                `
                SELECT
                    b.id,
                    b.chapter_id,
                    b.block_type,
                    b.text_content,
                    b.media_url,
                    b.media_public_id,
                    b.block_order,

                    courses.instructor_id

                FROM chapter_content_blocks b

                JOIN chapters c
                    ON c.id =
                    b.chapter_id

                JOIN lessons
                    ON lessons.id =
                    c.lesson_id

                JOIN courses
                    ON courses.id =
                    lessons.course_id

                WHERE b.id = $1
                `,
                [blockId]
            );


        if (
            blockResult.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Content block not found"
            });

        }


        const block =
            blockResult.rows[0];


        // =========================
        // CHECK OWNERSHIP
        // =========================

        if (
            Number(block.instructor_id) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({
                message:
                    "You can only update content in your own courses"
            });

        }


        const {
            block_type,
            text_content,
            media_url,
            media_public_id,
            block_order
        } = req.body;


        // =========================
        // BLOCK TYPE
        // =========================

        const allowedTypes = [
            "text",
            "video",
            "image",
            "resource"
        ];


        const finalBlockType =
            block_type !== undefined
                ? block_type
                : block.block_type;


        if (
            !allowedTypes.includes(
                finalBlockType
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid content block type"
            });

        }


        // =========================
        // BLOCK ORDER
        // =========================

        let finalBlockOrder =
            Number(block.block_order);


        if (
            block_order !== undefined
        ) {

            finalBlockOrder =
                Number(block_order);


            if (
                !Number.isInteger(
                    finalBlockOrder
                ) ||
                finalBlockOrder <= 0
            ) {

                return res.status(400).json({
                    message:
                        "Block order must be a positive integer"
                });

            }

        }


        // =========================
        // CONTENT VALUES
        // =========================

        let finalText = null;

        let finalMediaUrl = null;

        let finalMediaPublicId = null;


        if (
            finalBlockType === "text"
        ) {

            const value =
                text_content !== undefined
                    ? text_content
                    : (
                        block.block_type === "text"
                            ? block.text_content
                            : null
                    );


            finalText =
                typeof value === "string"
                    ? value.trim()
                    : "";


            if (!finalText) {

                return res.status(400).json({
                    message:
                        "Text content is required for a text block"
                });

            }

        }

        else {

            const value =
                media_url !== undefined
                    ? media_url
                    : (
                        block.block_type !== "text"
                            ? block.media_url
                            : null
                    );


            finalMediaUrl =
                typeof value === "string"
                    ? value.trim()
                    : "";


            if (!finalMediaUrl) {

                return res.status(400).json({
                    message:
                        "Media URL is required for this content type"
                });

            }


            if (
                media_public_id !== undefined
            ) {

                finalMediaPublicId =
                    typeof media_public_id === "string"
                        ? media_public_id.trim() || null
                        : null;

            }

            else if (
                block.block_type !== "text"
            ) {

                finalMediaPublicId =
                    block.media_public_id;

            }

        }


        // =========================
        // CHECK ORDER CONFLICT
        // =========================

        const orderResult =
            await pool.query(
                `
                SELECT id

                FROM chapter_content_blocks

                WHERE chapter_id = $1
                AND block_order = $2
                AND id <> $3
                `,
                [
                    block.chapter_id,
                    finalBlockOrder,
                    blockId
                ]
            );


        if (
            orderResult.rows.length > 0
        ) {

            return res.status(409).json({
                message:
                    "A content block with this order already exists"
            });

        }


        // =========================
        // UPDATE BLOCK
        // =========================

        const result =
            await pool.query(
                `
                UPDATE chapter_content_blocks

                SET
                    block_type = $1,
                    text_content = $2,
                    media_url = $3,
                    media_public_id = $4,
                    block_order = $5

                WHERE id = $6

                RETURNING *
                `,
                [
                    finalBlockType,
                    finalText,
                    finalMediaUrl,
                    finalMediaPublicId,
                    finalBlockOrder,
                    blockId
                ]
            );


        res.json({

            message:
                "Content block updated successfully",

            content_block:
                result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "Update content block error:",
            error
        );


        res.status(500).json({
            error:
                error.message
        });

    }

};



/**
 * Delete content block
 * Instructor owner only
 */
const deleteContentBlock = async (req, res) => {

    try {

        const blockId =
            Number(req.params.blockId);


        if (
            !Number.isInteger(blockId) ||
            blockId <= 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid content block ID"
            });

        }


        // =========================
        // GET BLOCK + OWNERSHIP
        // =========================

        const blockResult =
            await pool.query(
                `
                SELECT
                    b.id,
                    b.chapter_id,
                    b.block_type,
                    b.media_public_id,
                    courses.instructor_id

                FROM chapter_content_blocks b

                JOIN chapters c
                    ON c.id =
                    b.chapter_id

                JOIN lessons
                    ON lessons.id =
                    c.lesson_id

                JOIN courses
                    ON courses.id =
                    lessons.course_id

                WHERE b.id = $1
                `,
                [blockId]
            );


        if (
            blockResult.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Content block not found"
            });

        }


        const block =
            blockResult.rows[0];


        if (
            Number(block.instructor_id) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({
                message:
                    "You can only delete content from your own courses"
            });

        }


        // =========================
        // DELETE CONTENT BLOCK
        // =========================

        await pool.query(
            `
            DELETE FROM chapter_content_blocks
            WHERE id = $1
            `,
            [blockId]
        );


        res.json({

            message:
                "Content block deleted successfully",

            block_id:
                blockId

        });

    }

    catch (error) {

        console.error(
            "Delete content block error:",
            error
        );


        res.status(500).json({
            error:
                error.message
        });

    }

};


/**
 * Reorder content blocks in a chapter
 * Instructor owner only
 */
const reorderContentBlocks = async (req, res) => {

    const client =
        await pool.connect();

    let transactionStarted =
        false;

    try {

        const chapterId =
            Number(req.params.chapterId);

        const {
            block_ids
        } = req.body;


        // =========================
        // BASIC VALIDATION
        // =========================

        if (
            !Number.isInteger(chapterId) ||
            chapterId <= 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid chapter ID"
            });

        }


        if (
            !Array.isArray(block_ids) ||
            block_ids.length === 0
        ) {

            return res.status(400).json({
                message:
                    "block_ids must be a non-empty array"
            });

        }


        const blockIds =
            block_ids.map(
                id => Number(id)
            );


        if (
            blockIds.some(
                id =>
                    !Number.isInteger(id) ||
                    id <= 0
            )
        ) {

            return res.status(400).json({
                message:
                    "All content block IDs must be positive integers"
            });

        }


        if (
            new Set(blockIds).size !==
            blockIds.length
        ) {

            return res.status(400).json({
                message:
                    "Duplicate content block IDs are not allowed"
            });

        }


        // =========================
        // CHECK CHAPTER + OWNERSHIP
        // =========================

        const chapterResult =
            await client.query(
                `
                SELECT
                    c.id,
                    courses.instructor_id

                FROM chapters c

                JOIN lessons
                    ON lessons.id =
                    c.lesson_id

                JOIN courses
                    ON courses.id =
                    lessons.course_id

                WHERE c.id = $1
                `,
                [chapterId]
            );


        if (
            chapterResult.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Chapter not found"
            });

        }


        if (
            Number(
                chapterResult.rows[0]
                    .instructor_id
            ) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({
                message:
                    "You can only reorder content in your own courses"
            });

        }


        // =========================
        // GET ALL CHAPTER BLOCKS
        // =========================

        const existingResult =
            await client.query(
                `
                SELECT
                    id,
                    block_order

                FROM chapter_content_blocks

                WHERE chapter_id = $1

                ORDER BY block_order ASC
                `,
                [chapterId]
            );


        const existingIds =
            existingResult.rows.map(
                block =>
                    Number(block.id)
            );


        // Every block must be included
        if (
            existingIds.length !==
            blockIds.length
        ) {

            return res.status(400).json({
                message:
                    "You must include every content block in the chapter when reordering"
            });

        }


        const existingSet =
            new Set(existingIds);


        const invalidBlock =
            blockIds.some(
                id =>
                    !existingSet.has(id)
            );


        if (invalidBlock) {

            return res.status(400).json({
                message:
                    "One or more content blocks do not belong to this chapter"
            });

        }


        // =========================
        // BEGIN TRANSACTION
        // =========================

        await client.query(
            "BEGIN"
        );

        transactionStarted =
            true;


        /*
         * Temporarily move all block
         * orders above the current range.
         * This prevents unique-order
         * collisions during reordering.
         */
        const maxOrder =
            existingResult.rows.reduce(
                (max, block) =>
                    Math.max(
                        max,
                        Number(
                            block.block_order
                        )
                    ),
                0
            );


        const offset =
            maxOrder +
            blockIds.length +
            1000;


        await client.query(
            `
            UPDATE chapter_content_blocks

            SET block_order =
                block_order + $1

            WHERE chapter_id = $2
            `,
            [
                offset,
                chapterId
            ]
        );


        // =========================
        // APPLY FINAL ORDER
        // =========================

        for (
            let index = 0;
            index < blockIds.length;
            index++
        ) {

            await client.query(
                `
                UPDATE chapter_content_blocks

                SET block_order = $1

                WHERE id = $2
                AND chapter_id = $3
                `,
                [
                    index + 1,
                    blockIds[index],
                    chapterId
                ]
            );

        }


        await client.query(
            "COMMIT"
        );

        transactionStarted =
            false;


        // =========================
        // RETURN NEW ORDER
        // =========================

        const result =
            await client.query(
                `
                SELECT
                    id,
                    chapter_id,
                    block_type,
                    text_content,
                    media_url,
                    media_public_id,
                    block_order,
                    created_at

                FROM chapter_content_blocks

                WHERE chapter_id = $1

                ORDER BY block_order ASC
                `,
                [chapterId]
            );


        res.json({

            message:
                "Content blocks reordered successfully",

            chapter_id:
                chapterId,

            content_blocks:
                result.rows

        });

    }

    catch (error) {

        if (transactionStarted) {

            try {

                await client.query(
                    "ROLLBACK"
                );

            }

            catch (rollbackError) {

                console.error(
                    "Content block reorder rollback error:",
                    rollbackError
                );

            }

        }


        console.error(
            "Reorder content blocks error:",
            error
        );


        res.status(500).json({
            error:
                error.message
        });

    }

    finally {

        client.release();

    }

};

/**
 * Get chapter content for student
 * Student must be enrolled
 * Lesson and chapter must be unlocked
 */
const getStudentContentBlocksByChapter =
    async (req, res) => {

    try {

        const chapterId =
            Number(req.params.chapterId);


        if (
            !Number.isInteger(chapterId) ||
            chapterId <= 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid chapter ID"
            });

        }


        // =========================
        // GET CHAPTER + LESSON
        // =========================

        const chapterResult =
            await pool.query(
                `
                SELECT
                    c.id,
                    c.lesson_id,
                    c.title,
                    c.description,
                    c.chapter_order,
                    c.estimated_minutes,
                    c.is_required,
                    c.status,

                    l.course_id,
                    l.lesson_order

                FROM chapters c

                JOIN lessons l
                    ON l.id = c.lesson_id

                WHERE c.id = $1
                `,
                [chapterId]
            );


        if (
            chapterResult.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Chapter not found"
            });

        }


        const chapter =
            chapterResult.rows[0];


        // =========================
        // CHECK PUBLISHED STATUS
        // =========================

        if (
            chapter.status !== "published"
        ) {

            return res.status(403).json({
                message:
                    "This chapter is not available"
            });

        }


        // =========================
        // CHECK ENROLLMENT
        // =========================

        const enrollmentResult =
            await pool.query(
                `
                SELECT id
                FROM enrollments

                WHERE student_id = $1
                AND course_id = $2
                `,
                [
                    req.user.id,
                    chapter.course_id
                ]
            );


        if (
            enrollmentResult.rows.length === 0
        ) {

            return res.status(403).json({
                message:
                    "You must be enrolled in this course"
            });

        }


        // =========================
        // CHECK LESSON LOCK
        // =========================

        const previousLessonsResult =
            await pool.query(
                `
                SELECT
                    l.id

                FROM lessons l

                LEFT JOIN lesson_progress lp
                    ON lp.lesson_id = l.id
                    AND lp.student_id = $1

                WHERE l.course_id = $2

                AND l.lesson_order < $3

                AND lp.lesson_id IS NULL

                LIMIT 1
                `,
                [
                    req.user.id,
                    chapter.course_id,
                    chapter.lesson_order
                ]
            );


        if (
            previousLessonsResult.rows.length > 0
        ) {

            return res.status(403).json({
                message:
                    "Complete the previous lessons before accessing this chapter"
            });

        }


        // =========================
        // CHECK CHAPTER LOCK
        // =========================

        const previousChaptersResult =
            await pool.query(
                `
                SELECT
                    c.id

                FROM chapters c

                LEFT JOIN chapter_progress cp
                    ON cp.chapter_id = c.id
                    AND cp.student_id = $1

                WHERE c.lesson_id = $2

                AND c.status = 'published'

                AND c.is_required = TRUE

                AND c.chapter_order < $3

                AND (
                    cp.status IS NULL
                    OR cp.status <> 'completed'
                )

                LIMIT 1
                `,
                [
                    req.user.id,
                    chapter.lesson_id,
                    chapter.chapter_order
                ]
            );


        if (
            previousChaptersResult.rows.length > 0
        ) {

            return res.status(403).json({
                message:
                    "Complete the previous required chapter first"
            });

        }


        // =========================
        // GET CONTENT BLOCKS
        // =========================

        const contentResult =
            await pool.query(
                `
                SELECT
                    id,
                    chapter_id,
                    block_type,
                    text_content,
                    media_url,
                    block_order,
                    created_at

                FROM chapter_content_blocks

                WHERE chapter_id = $1

                ORDER BY block_order ASC
                `,
                [chapterId]
            );


        res.json({

            chapter: {
                id:
                    chapter.id,

                lesson_id:
                    chapter.lesson_id,

                title:
                    chapter.title,

                description:
                    chapter.description,

                chapter_order:
                    chapter.chapter_order,

                estimated_minutes:
                    chapter.estimated_minutes,

                is_required:
                    chapter.is_required
            },

            block_count:
                contentResult.rows.length,

            content_blocks:
                contentResult.rows

        });

    }

    catch (error) {

        console.error(
            "Get student chapter content error:",
            error
        );


        res.status(500).json({
            error:
                error.message
        });

    }

};







module.exports = {
    createContentBlock,
    updateContentBlock,
    deleteContentBlock,
    reorderContentBlocks,
    getContentBlocksByChapter,
    getStudentContentBlocksByChapter
};