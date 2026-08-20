const pool = require("../db/connection");

/**
 * Mark lesson as completed
 * Student must be enrolled in the lesson's course
 */
const completeLesson = async (req, res) => {
  try {

    const studentId = req.user.id;
    const { lessonId } = req.params;

    // Find lesson and its course
    const lessonResult = await pool.query(
      `
      SELECT
        id,
        course_id,
        lesson_order
      FROM lessons
      WHERE id = $1
      `,
      [lessonId]
    );

    if (lessonResult.rows.length === 0) {

      return res.status(404).json({
        message: "Lesson not found"
      });

    }

    const courseId =
      lessonResult.rows[0].course_id;

    
    const lessonOrder =
      lessonResult.rows[0].lesson_order;


    // Verify enrollment
    const enrollmentResult = await pool.query(
      `
      SELECT id
      FROM enrollments
      WHERE student_id = $1
      AND course_id = $2
      `,
      [
        studentId,
        courseId
      ]
    );

    if (enrollmentResult.rows.length === 0) {

      return res.status(403).json({
        message:
          "You must be enrolled in this course to complete this lesson"
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
          studentId,
          courseId,
          lessonOrder
        ]
      );


    if (
      previousLessonsResult.rows.length > 0
    ) {

      return res.status(403).json({
        message:
          "Complete the previous lessons before completing this lesson"
      });

    }

    
    // =========================
    // CHECK REQUIRED CHAPTERS
    // =========================

    const chapterProgressResult =
      await pool.query(
        `
        SELECT

          COUNT(c.id) FILTER (
            WHERE
              c.is_required = TRUE
              AND c.status = 'published'
          )::INTEGER
          AS required_count,

          COUNT(c.id) FILTER (
            WHERE
              c.is_required = TRUE
              AND c.status = 'published'
              AND cp.status = 'completed'
          )::INTEGER
          AS completed_count

        FROM chapters c

        LEFT JOIN chapter_progress cp
          ON cp.chapter_id = c.id
          AND cp.student_id = $1

        WHERE c.lesson_id = $2
        `,
        [
          studentId,
          lessonId
        ]
      );


    const requiredChapterCount =
      Number(
        chapterProgressResult.rows[0]
          .required_count
      );

    const completedChapterCount =
      Number(
        chapterProgressResult.rows[0]
          .completed_count
      );


    if (
      requiredChapterCount > 0 &&
      completedChapterCount <
        requiredChapterCount
    ) {

      return res.status(400).json({
        message:
          "You must complete all required chapters before completing this lesson."
      });

    }

    // Find the quiz belonging to this lesson
    const quizResult = await pool.query(
        `
        SELECT id
        FROM quizzes
        WHERE lesson_id = $1
        `,
        [lessonId]
    );


    if (quizResult.rows.length === 0) {

        return res.status(400).json({
            message:
                "You must complete and pass the lesson quiz before marking this lesson as completed."
        });

    }


    const quizId =
        quizResult.rows[0].id;


    // Check whether the student has passed the quiz
    const attemptResult = await pool.query(
        `
        SELECT passed
        FROM quiz_attempts
        WHERE student_id = $1
        AND quiz_id = $2
        `,
        [
            studentId,
            quizId
        ]
    );


    if (
        attemptResult.rows.length === 0 ||
        attemptResult.rows[0].passed !== true
    ) {

        return res.status(400).json({
            message:
                "You must pass the quiz with at least 70% before completing this lesson."
        });

    }
    // Record completion
    const result = await pool.query(
      `
      INSERT INTO lesson_progress
      (student_id, lesson_id)

      VALUES ($1, $2)

      ON CONFLICT
      (student_id, lesson_id)
      DO NOTHING

      RETURNING *
      `,
      [
        studentId,
        lessonId
      ]
    );

    res.json({
      message: "Lesson marked as completed",
      data:
        result.rows[0] ||
        "Already completed"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};


/**
 * Check whether a lesson is completed
 * Student must be enrolled
 */
/**
 * Check lesson completion status
 * and whether the student has passed the lesson quiz
 */
const checkLessonCompletion = async (req, res) => {
    try {

        const studentId = req.user.id;
        const { lessonId } = req.params;


        // Find the lesson and its course
        const lessonResult = await pool.query(
            `
            SELECT course_id
            FROM lessons
            WHERE id = $1
            `,
            [lessonId]
        );


        if (lessonResult.rows.length === 0) {

            return res.status(404).json({
                message: "Lesson not found"
            });

        }


        const courseId =
            lessonResult.rows[0].course_id;


        // Verify enrollment
        const enrollmentResult = await pool.query(
            `
            SELECT id
            FROM enrollments
            WHERE student_id = $1
            AND course_id = $2
            `,
            [
                studentId,
                courseId
            ]
        );


        if (enrollmentResult.rows.length === 0) {

            return res.status(403).json({
                message:
                    "You must be enrolled in this course"
            });

        }


        // Check whether lesson is already completed
        const completionResult = await pool.query(
            `
            SELECT id
            FROM lesson_progress
            WHERE student_id = $1
            AND lesson_id = $2
            `,
            [
                studentId,
                lessonId
            ]
        );


        const completed =
            completionResult.rows.length > 0;



        // =========================
        // CHECK CHAPTER COMPLETION
        // =========================

        const chapterProgressResult =
            await pool.query(
                `
                SELECT

                    COUNT(c.id) FILTER (
                        WHERE
                            c.is_required = TRUE
                            AND c.status = 'published'
                    )::INTEGER
                    AS required_count,

                    COUNT(c.id) FILTER (
                        WHERE
                            c.is_required = TRUE
                            AND c.status = 'published'
                            AND cp.status = 'completed'
                    )::INTEGER
                    AS completed_count

                FROM chapters c

                LEFT JOIN chapter_progress cp
                    ON cp.chapter_id = c.id
                    AND cp.student_id = $1

                WHERE c.lesson_id = $2
                `,
                [
                    studentId,
                    lessonId
                ]
            );


        const requiredChapterCount =
            Number(
                chapterProgressResult.rows[0]
                    .required_count
            );


        const completedRequiredChapters =
            Number(
                chapterProgressResult.rows[0]
                    .completed_count
            );


        /*
        * Lessons with no chapters keep
        * the old LMS behavior.
        */
        const chaptersCompleted =
            requiredChapterCount === 0 ||
            completedRequiredChapters ===
                requiredChapterCount;




        // Find quiz belonging to lesson
        const quizResult = await pool.query(
            `
            SELECT id
            FROM quizzes
            WHERE lesson_id = $1
            `,
            [lessonId]
        );


        // Lesson has no quiz
        if (quizResult.rows.length === 0) {

           return res.json({
              completed,

              chaptersCompleted,
              requiredChapterCount,
              completedRequiredChapters,

              quizExists: false,
              quizPassed: false,

              canComplete: completed
          });

        }


        const quizId =
            quizResult.rows[0].id;


        // Check student's quiz result
        const attemptResult = await pool.query(
            `
            SELECT passed
            FROM quiz_attempts
            WHERE student_id = $1
            AND quiz_id = $2
            `,
            [
                studentId,
                quizId
            ]
        );


        const quizPassed =
            attemptResult.rows.length > 0 &&
            attemptResult.rows[0].passed === true;


        res.json({
          completed,

          chaptersCompleted,
          requiredChapterCount,
          completedRequiredChapters,

          quizExists: true,
          quizPassed,

          canComplete:
              completed ||
              (
                  chaptersCompleted &&
                  quizPassed
              )
        });

    }

    catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};



// Get course progress
const getCourseProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    // Verify student is enrolled

    const enrollmentResult = await pool.query(
      `
      SELECT id
      FROM enrollments
      WHERE student_id = $1
      AND course_id = $2
      `,
      [
        studentId,
        courseId
      ]
    );

    if (enrollmentResult.rows.length === 0) {

      return res.status(403).json({
        message:
          "You must be enrolled in this course to view progress"
      });

    }
    // ---------------- LESSONS ----------------
    const totalLessonsResult = await pool.query(
      "SELECT COUNT(*) FROM lessons WHERE course_id = $1",
      [courseId]
    );

    const completedLessonsResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      WHERE l.course_id = $1 AND lp.student_id = $2
      `,
      [courseId, studentId]
    );

    const totalLessons = parseInt(totalLessonsResult.rows[0].count);
    const completedLessons = parseInt(completedLessonsResult.rows[0].count);

    const lessonPercent =
      totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);


    // ---------------- CHAPTERS ----------------

    const chapterProgressResult =
      await pool.query(
        `
        SELECT

          COUNT(c.id)::INTEGER
          AS total_required,

          COUNT(c.id) FILTER (
            WHERE cp.status = 'completed'
          )::INTEGER
          AS completed_required

        FROM chapters c

        JOIN lessons l
          ON l.id = c.lesson_id

        LEFT JOIN chapter_progress cp
          ON cp.chapter_id = c.id
          AND cp.student_id = $2

        WHERE l.course_id = $1

        AND c.is_required = TRUE

        AND c.status = 'published'
        `,
        [
          courseId,
          studentId
        ]
      );


    const totalRequiredChapters =
      Number(
        chapterProgressResult.rows[0]
          .total_required
      );


    const completedRequiredChapters =
      Number(
        chapterProgressResult.rows[0]
          .completed_required
      );


    const chapterPercent =
      totalRequiredChapters === 0
        ? 0
        : Math.round(
            (
              completedRequiredChapters /
              totalRequiredChapters
            ) * 100
          );


    // ---------------- QUIZZES ----------------
    const totalQuizzesResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM quizzes q
      JOIN lessons l ON q.lesson_id = l.id
      WHERE l.course_id = $1
      `,
      [courseId]
    );

    const passedQuizzesResult = await pool.query(
      `
    SELECT COUNT(*)
    FROM quiz_attempts qa
    WHERE qa.student_id = $1
    AND (
        CASE
            WHEN qa.total_questions = 0 THEN FALSE
            ELSE (qa.score::decimal / qa.total_questions) >= 0.7
        END
    )
    AND qa.quiz_id IN (
        SELECT q.id
        FROM quizzes q
        JOIN lessons l
            ON q.lesson_id = l.id
        WHERE l.course_id = $2
    )
      `,
      [studentId, courseId]
    );

    const totalQuizzes = parseInt(totalQuizzesResult.rows[0].count);
    const passedQuizzes = parseInt(passedQuizzesResult.rows[0].count);

    const quizPercent =
      totalQuizzes === 0 ? 0 : Math.round((passedQuizzes / totalQuizzes) * 100);

      
  // ---------------- OVERALL ----------------

  let overallProgress;


  // Course uses chapters and quizzes
  if (
    totalRequiredChapters > 0 &&
    totalQuizzes > 0
  ) {

    overallProgress =
      Math.round(
        (
          lessonPercent +
          chapterPercent +
          quizPercent
        ) / 3
      );

  }


  // Course uses chapters but has no quizzes
  else if (
    totalRequiredChapters > 0
  ) {

    overallProgress =
      Math.round(
        (
          lessonPercent +
          chapterPercent
        ) / 2
      );

  }


// Legacy course with quizzes but no chapters
else if (
  totalQuizzes > 0
) {

  overallProgress =
    Math.round(
      (
        lessonPercent +
        quizPercent
      ) / 2
    );

}


// Legacy course with lessons only
else {

  overallProgress =
    lessonPercent;

}


// Send the response
    res.json({
      courseId,

      lessonProgress: {
        total: totalLessons,
        completed: completedLessons,
        percent: lessonPercent
      },

      chapterProgress: {
        total: totalRequiredChapters,
        completed: completedRequiredChapters,
        percent: chapterPercent
      },

      quizProgress: {
        total: totalQuizzes,
        passed: passedQuizzes,
        percent: quizPercent
      },
      overallProgress
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/**
 * Get completed lessons for a course
 */
const getCompletedLessons = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    const result = await pool.query(
      `
      SELECT lp.lesson_id
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      WHERE lp.student_id = $1
      AND l.course_id = $2
      `,
      [studentId, courseId]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




module.exports = {
  completeLesson,
  getCompletedLessons,
  getCourseProgress,
  checkLessonCompletion
};