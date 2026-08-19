const pool = require("../db/connection");

/**
 * Create lesson
 * Instructor must own the course
 */
const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, lesson_order } = req.body;


  if (
  !title ||
  !title.trim() ||
  !content ||
  !content.trim()
  ) {

      return res.status(400).json({
          message:
              "Lesson title and content are required"
      });

  }


  const lessonOrder =
      Number(lesson_order);


  if (
      !Number.isInteger(lessonOrder) ||
      lessonOrder <= 0
  ) {

      return res.status(400).json({
          message:
              "Lesson order must be a positive whole number"
      });

  }
    // Verify course exists
    const courseResult = await pool.query(
      "SELECT * FROM courses WHERE id = $1",
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    const course = courseResult.rows[0];

    // Verify ownership
    if (Number(course.instructor_id) !== Number(req.user.id)) {
      return res.status(403).json({
        message: "You can only add lessons to your own courses"
      });
    }

    const lesson = await pool.query(
      `INSERT INTO lessons
      (course_id, title, content, lesson_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [courseId, title.trim(), content.trim(), lesson_order]
    );

    res.status(201).json({
      message: "Lesson created successfully",
      lesson: lesson.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};


/**
 * Update lesson
 * Instructor must own the course
 */
const updateLesson = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            title,
            content,
            lesson_order
        } = req.body;


        /**
         * Validate input
         */
        if (
            !title ||
            !title.trim() ||
            !content ||
            !content.trim() ||
            !lesson_order
        ) {

            return res.status(400).json({
                message:
                    "Title, content, and lesson order are required"
            });

        }


        const lessonOrder =
            Number(lesson_order);


        if (
            !Number.isInteger(lessonOrder) ||
            lessonOrder <= 0
        ) {

            return res.status(400).json({
                message:
                    "Lesson order must be a positive whole number"
            });

        }


        /**
         * Find lesson and course owner
         */
        const lessonResult =
            await pool.query(
                `
                SELECT
                    lessons.id,
                    lessons.course_id,
                    courses.instructor_id
                FROM lessons
                JOIN courses
                    ON lessons.course_id = courses.id
                WHERE lessons.id = $1
                `,
                [id]
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


        /**
         * Verify instructor ownership
         */
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
                    "You can only edit lessons from your own courses"
            });

        }


        /**
         * Update lesson
         */
        const updatedLesson =
            await pool.query(
                `
                UPDATE lessons

                SET
                    title = $1,
                    content = $2,
                    lesson_order = $3

                WHERE id = $4

                RETURNING *
                `,
                [
                    title.trim(),
                    content.trim(),
                    lessonOrder,
                    id
                ]
            );


        return res.json({
            message:
                "Lesson updated successfully",

            lesson:
                updatedLesson.rows[0]
        });

    }

    catch (error) {

        /**
         * Duplicate lesson order
         *
         * UNIQUE(course_id, lesson_order)
         */
        if (
            error.code === "23505"
        ) {

            return res.status(400).json({
                message:
                    "Another lesson in this course already uses that lesson order"
            });

        }


        console.error(
            "Update lesson error:",
            error
        );


        return res.status(500).json({
            error:
                "Unable to update lesson"
        });

    }

};


/**
 * Get lessons in a course
 * Instructor must own the course
 * Student must be enrolled
 */
const getCourseLessons = async (req, res) => {
  try {

    const { courseId } = req.params;

    // Check course
    const courseResult = await pool.query(
      `
      SELECT id, instructor_id
      FROM courses
      WHERE id = $1
      `,
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    const course = courseResult.rows[0];

    // Instructor must own course
    if (req.user.role === "instructor") {

      if (
        Number(course.instructor_id) !==
        Number(req.user.id)
      ) {
        return res.status(403).json({
          message:
            "You can only access lessons from your own courses"
        });
      }

    }

    // Student must be enrolled
    else if (req.user.role === "student") {

      const enrollmentResult = await pool.query(
        `
        SELECT id
        FROM enrollments
        WHERE student_id = $1
        AND course_id = $2
        `,
        [
          req.user.id,
          courseId
        ]
      );

      if (enrollmentResult.rows.length === 0) {
        return res.status(403).json({
          message:
            "You must be enrolled in this course"
        });
      }

    }

    else {

      return res.status(403).json({
        message: "Access denied"
      });

    }

    // Authorization passed
    const lessonsResult = await pool.query(
      `
      SELECT *
      FROM lessons
      WHERE course_id = $1
      ORDER BY lesson_order ASC
      `,
      [courseId]
    );


    let lessons =
      lessonsResult.rows;


    // =========================
    // STUDENT LESSON LOCKING
    // =========================

    if (req.user.role === "student") {

      const progressResult =
        await pool.query(
          `
          SELECT lesson_id
          FROM lesson_progress

          WHERE student_id = $1

          AND lesson_id IN (
            SELECT id
            FROM lessons
            WHERE course_id = $2
          )
          `,
          [
            req.user.id,
            courseId
          ]
        );


      const completedLessonIds =
        new Set(
          progressResult.rows.map(
            row => Number(row.lesson_id)
          )
        );


      /*
      * First lesson is available.
      *
      * Each later lesson becomes available
      * only when every lesson before it
      * has been completed.
      */
      let allPreviousCompleted =
        true;


      lessons =
        lessons.map(
          lesson => {

            const completed =
              completedLessonIds.has(
                Number(lesson.id)
              );


            const isLocked =
              !allPreviousCompleted;


            /*
            * Once an incomplete lesson is
            * encountered, every lesson after
            * it remains locked.
            */
            if (!completed) {

              allPreviousCompleted =
                false;

            }


            return {
              ...lesson,

              completed,

              is_locked:
                isLocked
            };

          }
        );

    }


    res.json({
      courseId,
      lessons
    });

  } catch (error) {

    console.error(
      "Get course lessons error:",
      error
    );

    res.status(500).json({
      error: error.message
    });

  }
};


/**
 * Get lesson by ID
 * Instructor must own the course
 * Student must be enrolled
 */
const getLessonById = async (req, res) => {
  try {

    const { id } = req.params;

    // Get lesson and its course information
    const result = await pool.query(
      `
      SELECT
        lessons.*,
        courses.instructor_id
      FROM lessons
      JOIN courses
        ON lessons.course_id = courses.id
      WHERE lessons.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        message: "Lesson not found"
      });

    }

    const lesson = result.rows[0];

    // Instructor must own course
    if (req.user.role === "instructor") {

      if (
        Number(lesson.instructor_id) !==
        Number(req.user.id)
      ) {

        return res.status(403).json({
          message:
            "You can only access lessons from your own courses"
        });

      }

    }

    // Student must be enrolled
    else if (req.user.role === "student") {

      const enrollmentResult = await pool.query(
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

      if (enrollmentResult.rows.length === 0) {

        return res.status(403).json({
          message:
            "You must be enrolled in this course to access this lesson"
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

    }

    else {

      return res.status(403).json({
        message: "Access denied"
      });

    }

    res.json(lesson);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};

module.exports = {
    createLesson,
    updateLesson,
    getCourseLessons,
    getLessonById
};