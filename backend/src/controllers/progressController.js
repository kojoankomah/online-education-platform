const pool = require("../db/connection");

/**
 * Mark lesson as completed
 */
const completeLesson = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { lessonId } = req.params;

    const result = await pool.query(
      `INSERT INTO lesson_progress (student_id, lesson_id)
       VALUES ($1, $2)
       ON CONFLICT (student_id, lesson_id) DO NOTHING
       RETURNING *`,
      [studentId, lessonId]
    );

    res.json({
      message: "Lesson marked as completed",
      data: result.rows[0] || "Already completed"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const getCourseProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

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
      AND qa.passed = true
      AND qa.quiz_id IN (
        SELECT q.id
        FROM quizzes q
        JOIN lessons l ON q.lesson_id = l.id
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
    const overallProgress = Math.round((lessonPercent + quizPercent) / 2);

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
  getCourseProgress
};