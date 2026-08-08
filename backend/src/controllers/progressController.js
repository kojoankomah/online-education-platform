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
      SELECT id, course_id
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
          "You must be enrolled in this course to complete this lesson"
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
const checkLessonCompletion = async (req, res) => {
  try {

    const studentId = req.user.id;
    const { lessonId } = req.params;

    // Get lesson course
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

    const result = await pool.query(
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

    res.json({
      completed:
        result.rows.length > 0
    });

  } catch (error) {

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

// Calculate overall progress as the average of lesson and quiz progress
let overallProgress;


if(totalQuizzes === 0){

    overallProgress = lessonPercent;

}
else{

    overallProgress =
    Math.round(
        (lessonPercent + quizPercent) / 2
    );

}


// Send the response
    res.json({
      courseId,
      lessonProgress: {
        total: totalLessons,
        completed: completedLessons,
        percent: lessonPercent
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