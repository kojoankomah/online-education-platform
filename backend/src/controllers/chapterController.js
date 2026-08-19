const pool = require("../db/connection");


/**
 * Create chapter
 * Instructor owner only
 */
const createChapter = async (req, res) => {

    try {

        const {
            lesson_id,
            title,
            description,
            chapter_order,
            estimated_minutes,
            is_required,
            status
        } = req.body;


        // =========================
        // BASIC VALIDATION
        // =========================

        const cleanTitle =
            typeof title === "string"
                ? title.trim()
                : "";


        if (!cleanTitle) {

            return res.status(400).json({
                message:
                    "Chapter title is required"
            });

        }


        const lessonId =
            Number(lesson_id);


        const chapterOrder =
            Number(chapter_order);


        if (
            !Number.isInteger(lessonId) ||
            lessonId <= 0
        ) {

            return res.status(400).json({
                message:
                    "A valid lesson ID is required"
            });

        }


        if (
            !Number.isInteger(chapterOrder) ||
            chapterOrder <= 0
        ) {

            return res.status(400).json({
                message:
                    "Chapter order must be a positive integer"
            });

        }


        // =========================
        // ESTIMATED MINUTES
        // =========================

        let estimatedMinutes = null;


        if (
            estimated_minutes !== undefined &&
            estimated_minutes !== null &&
            estimated_minutes !== ""
        ) {

            estimatedMinutes =
                Number(estimated_minutes);


            if (
                !Number.isInteger(
                    estimatedMinutes
                ) ||
                estimatedMinutes <= 0
            ) {

                return res.status(400).json({
                    message:
                        "Estimated minutes must be a positive integer"
                });

            }

        }


        // =========================
        // REQUIRED FLAG
        // =========================

        const required =
            is_required === undefined
                ? true
                : (
                    is_required === true ||
                    is_required === "true"
                );


        // =========================
        // STATUS
        // =========================

        const chapterStatus =
            status || "published";


        if (
            ![
                "draft",
                "published"
            ].includes(chapterStatus)
        ) {

            return res.status(400).json({
                message:
                    "Chapter status must be draft or published"
            });

        }


        // =========================
        // CHECK LESSON + OWNERSHIP
        // =========================

        const lessonResult =
            await pool.query(
                `
                SELECT
                    lessons.id,
                    lessons.course_id,
                    courses.instructor_id
                FROM lessons

                JOIN courses
                    ON courses.id =
                    lessons.course_id

                WHERE lessons.id = $1
                `,
                [lessonId]
            );


        if (
            lessonResult.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Lesson not found"
            });

        }


        const lesson =
            lessonResult.rows[0];


        if (
            Number(
                lesson.instructor_id
            ) !==
            Number(
                req.user.id
            )
        ) {

            return res.status(403).json({
                message:
                    "You can only add chapters to lessons in your own courses"
            });

        }


        // =========================
        // CHECK CHAPTER ORDER
        // =========================

        const orderResult =
            await pool.query(
                `
                SELECT id
                FROM chapters
                WHERE lesson_id = $1
                AND chapter_order = $2
                `,
                [
                    lessonId,
                    chapterOrder
                ]
            );


        if (
            orderResult.rows.length > 0
        ) {

            return res.status(409).json({
                message:
                    "A chapter with this order already exists in the lesson"
            });

        }


        // =========================
        // CREATE CHAPTER
        // =========================

        const result =
            await pool.query(
                `
                INSERT INTO chapters (
                    lesson_id,
                    title,
                    description,
                    chapter_order,
                    estimated_minutes,
                    is_required,
                    status
                )

                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7
                )

                RETURNING *
                `,
                [
                    lessonId,
                    cleanTitle,
                    typeof description === "string"
                        ? description.trim() || null
                        : null,
                    chapterOrder,
                    estimatedMinutes,
                    required,
                    chapterStatus
                ]
            );


        res.status(201).json({

            message:
                "Chapter created successfully",

            chapter:
                result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "Create chapter error:",
            error
        );


        res.status(500).json({
            error:
                error.message
        });

    }

};


/**
 * Get chapters for a lesson
 * Instructor owner only
 */
const getChaptersByLesson = async (req, res) => {

    try {

        const lessonId =
            Number(req.params.lessonId);


        if (
            !Number.isInteger(lessonId) ||
            lessonId <= 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid lesson ID"
            });

        }


        // =========================
        // CHECK LESSON + OWNERSHIP
        // =========================

        const lessonResult =
            await pool.query(
                `
                SELECT
                    lessons.id,
                    lessons.course_id,
                    courses.instructor_id
                FROM lessons

                JOIN courses
                    ON courses.id =
                    lessons.course_id

                WHERE lessons.id = $1
                `,
                [lessonId]
            );


        if (
            lessonResult.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Lesson not found"
            });

        }


        const lesson =
            lessonResult.rows[0];


        if (
            Number(lesson.instructor_id) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({
                message:
                    "You can only view chapters in lessons from your own courses"
            });

        }


        // =========================
        // GET CHAPTERS
        // =========================

        const result =
            await pool.query(
                `
                SELECT
                    id,
                    lesson_id,
                    title,
                    description,
                    chapter_order,
                    estimated_minutes,
                    is_required,
                    status,
                    created_at

                FROM chapters

                WHERE lesson_id = $1

                ORDER BY chapter_order ASC
                `,
                [lessonId]
            );


        res.json({
            lesson_id:
                lessonId,

            chapter_count:
                result.rows.length,

            chapters:
                result.rows
        });

    }

    catch (error) {

        console.error(
            "Get chapters error:",
            error
        );


        res.status(500).json({
            error:
                error.message
        });

    }

};





/**
 * Update chapter
 * Instructor owner only
 */
const updateChapter = async (req, res) => {

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
        // GET EXISTING CHAPTER
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


        const chapter =
            chapterResult.rows[0];


        // =========================
        // CHECK OWNERSHIP
        // =========================

        if (
            Number(chapter.instructor_id) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({
                message:
                    "You can only update chapters in your own courses"
            });

        }


        const {
            title,
            description,
            chapter_order,
            estimated_minutes,
            is_required,
            status
        } = req.body;


        // =========================
        // TITLE
        // =========================

        let cleanTitle =
            chapter.title;


        if (title !== undefined) {

            cleanTitle =
                typeof title === "string"
                    ? title.trim()
                    : "";


            if (!cleanTitle) {

                return res.status(400).json({
                    message:
                        "Chapter title is required"
                });

            }

        }


        // =========================
        // DESCRIPTION
        // =========================

        let cleanDescription =
            chapter.description;


        if (description !== undefined) {

            cleanDescription =
                typeof description === "string"
                    ? description.trim() || null
                    : null;

        }


        // =========================
        // CHAPTER ORDER
        // =========================

        let chapterOrder =
            Number(chapter.chapter_order);


        if (chapter_order !== undefined) {

            chapterOrder =
                Number(chapter_order);


            if (
                !Number.isInteger(chapterOrder) ||
                chapterOrder <= 0
            ) {

                return res.status(400).json({
                    message:
                        "Chapter order must be a positive integer"
                });

            }

        }


        // =========================
        // ESTIMATED MINUTES
        // =========================

        let estimatedMinutes =
            chapter.estimated_minutes;


        if (
            estimated_minutes !== undefined
        ) {

            if (
                estimated_minutes === null ||
                estimated_minutes === ""
            ) {

                estimatedMinutes =
                    null;

            }

            else {

                estimatedMinutes =
                    Number(estimated_minutes);


                if (
                    !Number.isInteger(
                        estimatedMinutes
                    ) ||
                    estimatedMinutes <= 0
                ) {

                    return res.status(400).json({
                        message:
                            "Estimated minutes must be a positive integer"
                    });

                }

            }

        }


        // =========================
        // REQUIRED FLAG
        // =========================

        let required =
            chapter.is_required;


        if (is_required !== undefined) {

            if (
                is_required === true ||
                is_required === "true"
            ) {

                required = true;

            }

            else if (
                is_required === false ||
                is_required === "false"
            ) {

                required = false;

            }

            else {

                return res.status(400).json({
                    message:
                        "is_required must be true or false"
                });

            }

        }


        // =========================
        // STATUS
        // =========================

        let chapterStatus =
            chapter.status;


        if (status !== undefined) {

            if (
                ![
                    "draft",
                    "published"
                ].includes(status)
            ) {

                return res.status(400).json({
                    message:
                        "Chapter status must be draft or published"
                });

            }


            chapterStatus =
                status;

        }


        // =========================
        // CHECK ORDER CONFLICT
        // =========================

        const orderResult =
            await pool.query(
                `
                SELECT id
                FROM chapters

                WHERE lesson_id = $1
                AND chapter_order = $2
                AND id <> $3
                `,
                [
                    chapter.lesson_id,
                    chapterOrder,
                    chapterId
                ]
            );


        if (
            orderResult.rows.length > 0
        ) {

            return res.status(409).json({
                message:
                    "A chapter with this order already exists in the lesson"
            });

        }


        // =========================
        // UPDATE CHAPTER
        // =========================

        const result =
            await pool.query(
                `
                UPDATE chapters

                SET
                    title = $1,
                    description = $2,
                    chapter_order = $3,
                    estimated_minutes = $4,
                    is_required = $5,
                    status = $6

                WHERE id = $7

                RETURNING *
                `,
                [
                    cleanTitle,
                    cleanDescription,
                    chapterOrder,
                    estimatedMinutes,
                    required,
                    chapterStatus,
                    chapterId
                ]
            );


        res.json({

            message:
                "Chapter updated successfully",

            chapter:
                result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "Update chapter error:",
            error
        );


        res.status(500).json({
            error:
                error.message
        });

    }

};



/**
 * Delete chapter
 * Instructor owner only
 */
const deleteChapter = async (req, res) => {

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
                    c.id,
                    c.title,
                    c.lesson_id,
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


        const chapter =
            chapterResult.rows[0];


        if (
            Number(chapter.instructor_id) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({
                message:
                    "You can only delete chapters from your own courses"
            });

        }


        // =========================
        // DELETE CHAPTER
        // =========================

        await pool.query(
            `
            DELETE FROM chapters
            WHERE id = $1
            `,
            [chapterId]
        );


        res.json({

            message:
                "Chapter deleted successfully",

            chapter_id:
                chapterId

        });

    }

    catch (error) {

        console.error(
            "Delete chapter error:",
            error
        );


        res.status(500).json({
            error:
                error.message
        });

    }

};



/**
 * Reorder chapters in a lesson
 * Instructor owner only
 */
const reorderChapters = async (req, res) => {

    const client =
        await pool.connect();

    try {

        const lessonId =
            Number(req.params.lessonId);

        const {
            chapter_ids
        } = req.body;


        // =========================
        // BASIC VALIDATION
        // =========================

        if (
            !Number.isInteger(lessonId) ||
            lessonId <= 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid lesson ID"
            });

        }


        if (
            !Array.isArray(chapter_ids) ||
            chapter_ids.length === 0
        ) {

            return res.status(400).json({
                message:
                    "chapter_ids must be a non-empty array"
            });

        }


        const chapterIds =
            chapter_ids.map(
                id => Number(id)
            );


        if (
            chapterIds.some(
                id =>
                    !Number.isInteger(id) ||
                    id <= 0
            )
        ) {

            return res.status(400).json({
                message:
                    "All chapter IDs must be positive integers"
            });

        }


        if (
            new Set(chapterIds).size !==
            chapterIds.length
        ) {

            return res.status(400).json({
                message:
                    "Duplicate chapter IDs are not allowed"
            });

        }


        // =========================
        // CHECK LESSON + OWNERSHIP
        // =========================

        const lessonResult =
            await client.query(
                `
                SELECT
                    lessons.id,
                    courses.instructor_id

                FROM lessons

                JOIN courses
                    ON courses.id =
                    lessons.course_id

                WHERE lessons.id = $1
                `,
                [lessonId]
            );


        if (
            lessonResult.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Lesson not found"
            });

        }


        if (
            Number(
                lessonResult.rows[0]
                    .instructor_id
            ) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({
                message:
                    "You can only reorder chapters in your own courses"
            });

        }


        // =========================
        // GET ALL LESSON CHAPTERS
        // =========================

        const existingResult =
            await client.query(
                `
                SELECT
                    id,
                    chapter_order

                FROM chapters

                WHERE lesson_id = $1

                ORDER BY chapter_order ASC
                `,
                [lessonId]
            );


        const existingIds =
            existingResult.rows.map(
                chapter =>
                    Number(chapter.id)
            );


        // Every chapter must be included
        if (
            existingIds.length !==
            chapterIds.length
        ) {

            return res.status(400).json({
                message:
                    "You must include every chapter in the lesson when reordering"
            });

        }


        const existingSet =
            new Set(existingIds);


        const invalidChapter =
            chapterIds.some(
                id =>
                    !existingSet.has(id)
            );


        if (invalidChapter) {

            return res.status(400).json({
                message:
                    "One or more chapters do not belong to this lesson"
            });

        }


        // =========================
        // BEGIN TRANSACTION
        // =========================

        await client.query(
            "BEGIN"
        );


        /*
         * Temporarily move all chapter
         * order values above the current
         * range so final 1..N assignments
         * cannot violate the unique
         * lesson/order constraint.
         */
        const maxOrder =
            existingResult.rows.reduce(
                (max, chapter) =>
                    Math.max(
                        max,
                        Number(
                            chapter.chapter_order
                        )
                    ),
                0
            );


        const offset =
            maxOrder +
            chapterIds.length +
            1000;


        await client.query(
            `
            UPDATE chapters

            SET chapter_order =
                chapter_order + $1

            WHERE lesson_id = $2
            `,
            [
                offset,
                lessonId
            ]
        );


        // =========================
        // APPLY FINAL ORDER
        // =========================

        for (
            let index = 0;
            index < chapterIds.length;
            index++
        ) {

            await client.query(
                `
                UPDATE chapters

                SET chapter_order = $1

                WHERE id = $2
                AND lesson_id = $3
                `,
                [
                    index + 1,
                    chapterIds[index],
                    lessonId
                ]
            );

        }


        await client.query(
            "COMMIT"
        );


        // =========================
        // RETURN NEW ORDER
        // =========================

        const result =
            await client.query(
                `
                SELECT
                    id,
                    lesson_id,
                    title,
                    description,
                    chapter_order,
                    estimated_minutes,
                    is_required,
                    status,
                    created_at

                FROM chapters

                WHERE lesson_id = $1

                ORDER BY chapter_order ASC
                `,
                [lessonId]
            );


        res.json({

            message:
                "Chapters reordered successfully",

            lesson_id:
                lessonId,

            chapters:
                result.rows

        });

    }

    catch (error) {

        await client.query(
            "ROLLBACK"
        );


        console.error(
            "Reorder chapters error:",
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
 * Get published chapters for student learning
 * Student must be enrolled
 */
const getStudentChaptersByLesson = async (req, res) => {

    try {

        const lessonId =
            Number(req.params.lessonId);


        if (
            !Number.isInteger(lessonId) ||
            lessonId <= 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid lesson ID"
            });

        }


        // =========================
        // GET LESSON + COURSE
        // =========================

        const lessonResult =
            await pool.query(
                `
                SELECT
                    lessons.id,
                    lessons.course_id,
                    lessons.title,
                    lessons.lesson_order,
                    courses.title AS course_title

                FROM lessons

                JOIN courses
                    ON courses.id =
                    lessons.course_id

                WHERE lessons.id = $1
                `,
                [lessonId]
            );


        if (
            lessonResult.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Lesson not found"
            });

        }


        const lesson =
            lessonResult.rows[0];


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
                    lesson.course_id
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
                    lesson.course_id,
                    lesson.lesson_order
                ]
            );


        if (
            previousLessonsResult.rows.length > 0
        ) {

            return res.status(403).json({
                message:
                    "Complete the previous lessons before accessing this lesson"
            });

        }



        // =========================
        // GET PUBLISHED CHAPTERS
        // =========================

        const chaptersResult =
            await pool.query(
                `
                SELECT
                    id,
                    lesson_id,
                    title,
                    description,
                    chapter_order,
                    estimated_minutes,
                    is_required

                FROM chapters

                WHERE lesson_id = $1
                AND status = 'published'

                ORDER BY chapter_order ASC
                `,
                [lessonId]
            );


        const chapters =
            chaptersResult.rows;


        // =========================
        // GET STUDENT PROGRESS
        // =========================

        const progressResult =
            await pool.query(
                `
                SELECT
                    cp.chapter_id,
                    cp.status,
                    cp.last_accessed_at,
                    cp.completed_at

                FROM chapter_progress cp

                JOIN chapters c
                    ON c.id =
                    cp.chapter_id

                WHERE cp.student_id = $1
                AND c.lesson_id = $2
                `,
                [
                    req.user.id,
                    lessonId
                ]
            );


        const progressMap =
            new Map();


        for (
            const progress
            of progressResult.rows
        ) {

            progressMap.set(
                Number(progress.chapter_id),
                progress
            );

        }


        // =========================
        // CALCULATE LOCK STATUS
        // =========================

        let previousRequiredCompleted =
            true;


        const studentChapters =
            chapters.map(
                (chapter) => {

                    const progress =
                        progressMap.get(
                            Number(chapter.id)
                        );


                    const progressStatus =
                        progress
                            ? progress.status
                            : "not_started";


                    /*
                     * A chapter is available when
                     * all required chapters before it
                     * have been completed.
                     *
                     * Optional chapters do not block
                     * later chapters.
                     */
                    const isLocked =
                        !previousRequiredCompleted;


                    if (
                        chapter.is_required &&
                        progressStatus !==
                            "completed"
                    ) {

                        previousRequiredCompleted =
                            false;

                    }


                    return {

                        ...chapter,

                        progress_status:
                            progressStatus,

                        is_locked:
                            isLocked,

                        last_accessed_at:
                            progress
                                ? progress.last_accessed_at
                                : null,

                        completed_at:
                            progress
                                ? progress.completed_at
                                : null

                    };

                }
            );


        const completedRequired =
            studentChapters.filter(
                chapter =>
                    chapter.is_required &&
                    chapter.progress_status ===
                        "completed"
            ).length;


        const totalRequired =
            studentChapters.filter(
                chapter =>
                    chapter.is_required
            ).length;


        res.json({

            lesson: {
                id:
                    lesson.id,

                title:
                    lesson.title,

                course_id:
                    lesson.course_id,

                course_title:
                    lesson.course_title
            },

            chapter_count:
                studentChapters.length,

            required_chapter_count:
                totalRequired,

            completed_required_chapters:
                completedRequired,

            all_required_completed:
                totalRequired > 0 &&
                completedRequired ===
                    totalRequired,

            chapters:
                studentChapters

        });

    }

    catch (error) {

        console.error(
            "Get student chapters error:",
            error
        );


        res.status(500).json({
            error:
                error.message
        });

    }

};



/**
 * Update student chapter progress
 * Student only
 */
const updateStudentChapterProgress = async (req, res) => {

    try {

        const chapterId =
            Number(req.params.chapterId);

        const {
            status
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


        const allowedStatuses = [
            "in_progress",
            "completed"
        ];


        if (
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({
                message:
                    "Status must be in_progress or completed"
            });

        }


        // =========================
        // GET CHAPTER + COURSE
        // =========================

        const chapterResult =
            await pool.query(
                `
                SELECT
                    chapters.id,
                    chapters.lesson_id,
                    chapters.chapter_order,
                    chapters.is_required,
                    chapters.status AS chapter_status,
                    lessons.course_id,
                    lessons.lesson_order

                FROM chapters

                JOIN lessons
                    ON lessons.id =
                    chapters.lesson_id

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
            chapter.chapter_status !==
            "published"
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
                    "Complete the previous lessons before accessing this lesson"
            });

        }



        // =========================
        // CHECK PREVIOUS REQUIRED
        // CHAPTERS
        // =========================

        const previousResult =
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
            previousResult.rows.length > 0
        ) {

            return res.status(403).json({
                message:
                    "Complete the previous required chapter first"
            });

        }


        // =========================
        // CHECK EXISTING PROGRESS
        // =========================

        const existingResult =
            await pool.query(
                `
                SELECT status
                FROM chapter_progress

                WHERE student_id = $1
                AND chapter_id = $2
                `,
                [
                    req.user.id,
                    chapterId
                ]
            );


        /*
         * Completed chapters should never
         * be moved back to in_progress.
         */
        if (
            existingResult.rows.length > 0 &&
            existingResult.rows[0].status ===
                "completed" &&
            status === "in_progress"
        ) {

            return res.status(400).json({
                message:
                    "A completed chapter cannot be moved back to in progress"
            });

        }


        // =========================
        // SAVE PROGRESS
        // =========================

        const result =
            await pool.query(
                `
                INSERT INTO chapter_progress (
                    student_id,
                    chapter_id,
                    status,
                    last_accessed_at,
                    completed_at
                )

                VALUES (
                    $1,
                    $2,
                    $3::VARCHAR(20),
                    CURRENT_TIMESTAMP,
                    CASE
                        WHEN $3::VARCHAR(20) = 'completed'
                        THEN CURRENT_TIMESTAMP
                        ELSE NULL
                    END
                )

                ON CONFLICT (
                    student_id,
                    chapter_id
                )

                DO UPDATE SET

                    status =
                        EXCLUDED.status,

                    last_accessed_at =
                        CURRENT_TIMESTAMP,

                    completed_at =
                        CASE
                            WHEN EXCLUDED.status =
                                'completed'
                            THEN CURRENT_TIMESTAMP
                            ELSE chapter_progress.completed_at
                        END

                RETURNING *
                `,
                [
                    req.user.id,
                    chapterId,
                    status
                ]
            );


        res.json({

            message:
                status === "completed"
                    ? "Chapter completed successfully"
                    : "Chapter progress updated",

            progress:
                result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "Update chapter progress error:",
            error
        );


        res.status(500).json({
            error:
                error.message
        });

    }

};





module.exports = {
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    getChaptersByLesson,
    getStudentChaptersByLesson,
    updateStudentChapterProgress
};