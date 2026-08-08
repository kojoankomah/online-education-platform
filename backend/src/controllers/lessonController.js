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
    const lessons = await pool.query(
      `
      SELECT *
      FROM lessons
      WHERE course_id = $1
      ORDER BY lesson_order ASC
      `,
      [courseId]
    );

    res.json({
      courseId,
      lessons: lessons.rows
    });

  } catch (error) {

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
  getCourseLessons,
  getLessonById
};