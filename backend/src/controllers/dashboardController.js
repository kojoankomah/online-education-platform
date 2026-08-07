const pool = require("../db/connection");

/**
 * Student dashboard summary
 */
const getStudentDashboard = async (req, res) => {
  try { 
    const studentId = req.user.id;

    // ---------------- ENROLLED COURSES ----------------
    const courses = await pool.query(
    `
    SELECT 
        c.id,
        c.title,
        c.description,

        COUNT(l.id) AS total_lessons,

        COUNT(lp.id) AS completed_lessons


    FROM courses c


    JOIN enrollments e
    ON c.id = e.course_id


    LEFT JOIN lessons l
    ON c.id = l.course_id


    LEFT JOIN lesson_progress lp
    ON l.id = lp.lesson_id
    AND lp.student_id = $1


    WHERE e.student_id = $1


    GROUP BY c.id

    `,
    [studentId]
    );

    // ---------------- RECENT QUIZ ATTEMPTS ----------------
    const attempts = await pool.query(
      `
      SELECT qa.*, q.title AS quiz_title
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.student_id = $1
      ORDER BY qa.submitted_at DESC
      LIMIT 5
      `,
      [studentId]
    );

    // ---------------- TOTAL QUIZZES ATTEMPTED ----------------
    const attemptCount = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM quiz_attempts
      WHERE student_id = $1
      `,
      [studentId]
    );

    // ---------------- COMPLETED LESSONS ----------------
    const progress = await pool.query(
      `
      SELECT COUNT(*) AS completed
      FROM lesson_progress
      WHERE student_id = $1
      `,
      [studentId]
    );


    res.json({
      courses: courses.rows,
      courseCount: courses.rows.length,

      recentAttempts: attempts.rows,
      quizAttemptCount: Number(attemptCount.rows[0].total),

      completedLessons: Number(progress.rows[0].completed)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




/**
 * Instructor dashboard summary
 */
const getInstructorDashboard = async (req, res) => {
  try {
    const instructorId = req.user.id;

    // ---------------- COURSES ----------------
    const courses = await pool.query(
      `
      SELECT c.*
      FROM courses c
      WHERE c.instructor_id = $1
      `,
      [instructorId]
    );

    // ---------------- STUDENT COUNT PER COURSE ----------------
    const stats = await pool.query(
      `
      SELECT 
        c.id,
        c.title,
        COUNT(e.student_id) AS students
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.instructor_id = $1
      GROUP BY c.id
      `,
      [instructorId]
    );

    res.json({
      courses: courses.rows,
      courseStats: stats.rows
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






module.exports = {
  getStudentDashboard,
  getInstructorDashboard
};