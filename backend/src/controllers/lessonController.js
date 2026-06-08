const pool = require("../db/connection");

/**
 * Create lesson
 * Instructor must own the course
 */
const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, lesson_order } = req.body;

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
    if (course.instructor_id !== req.user.id) {
      return res.status(403).json({
        message: "You can only add lessons to your own courses"
      });
    }

    const lesson = await pool.query(
      `INSERT INTO lessons
      (course_id, title, content, lesson_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [courseId, title, content, lesson_order]
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
 * Get lessons in a course
 */
const getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lessons = await pool.query(
      `SELECT *
       FROM lessons
       WHERE course_id = $1
       ORDER BY lesson_order ASC`,
      [courseId]
    );

    res.json(lessons.rows);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  createLesson,
  getCourseLessons
};