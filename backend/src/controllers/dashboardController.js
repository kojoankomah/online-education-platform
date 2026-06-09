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
      SELECT c.id, c.title, c.description
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.student_id = $1
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

    res.json({
      courses: courses.rows,
      recentAttempts: attempts.rows
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