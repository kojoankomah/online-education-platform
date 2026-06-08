const pool = require("../db/connection");

/**
 * Student enrolls in a course
 */
const enrollInCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    // Ensure only students can enroll
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can enroll in courses"
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

    // Check for existing enrollment
    const existingEnrollment = await pool.query(
      `SELECT * FROM enrollments
       WHERE student_id = $1
       AND course_id = $2`,
      [studentId, courseId]
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(400).json({
        message: "Already enrolled in this course"
      });
    }

    // Create enrollment
    const enrollment = await pool.query(
      `INSERT INTO enrollments
       (student_id, course_id)
       VALUES ($1, $2)
       RETURNING *`,
      [studentId, courseId]
    );

    res.status(201).json({
      message: "Enrollment successful",
      enrollment: enrollment.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};


/**
 * View courses enrolled by current student
 */
const getMyCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        courses.id,
        courses.title,
        courses.description,
        users.name AS instructor_name,
        enrollments.enrolled_at

      FROM enrollments

      JOIN courses
        ON enrollments.course_id = courses.id

      JOIN users
        ON courses.instructor_id = users.id

      WHERE enrollments.student_id = $1
      `,
      [studentId]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};


/**
 * Instructor views students enrolled in a course
 */
const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify instructor owns course
    const course = await pool.query(
      "SELECT * FROM courses WHERE id = $1",
      [courseId]
    );

    if (course.rows.length === 0) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    if (course.rows[0].instructor_id !== req.user.id) {
      return res.status(403).json({
        message: "You can only view your own courses"
      });
    }

    const students = await pool.query(
      `
      SELECT
        users.id,
        users.name,
        users.email,
        enrollments.enrolled_at

      FROM enrollments

      JOIN users
        ON enrollments.student_id = users.id

      WHERE enrollments.course_id = $1
      `,
      [courseId]
    );

    res.json(students.rows);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  enrollInCourse,
  getMyCourses,
  getCourseStudents
};