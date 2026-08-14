const pool = require("../db/connection");

/**
 * Create a new course (Instructor only)
 */
const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    // instructor_id comes from JWT middleware
    const instructor_id = req.user.id;

    const result = await pool.query(
      "INSERT INTO courses (title, description, instructor_id) VALUES ($1, $2, $3) RETURNING *",
      [title, description, instructor_id]
    );

    res.status(201).json({
      message: "Course created successfully",
      course: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all courses (public access)
 */
const getAllCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        courses.*,
        users.name AS instructor_name
       FROM courses
       JOIN users ON users.id = courses.instructor_id
       ORDER BY courses.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get single course for learning/viewing
 *
 * Student:
 * Must be enrolled
 *
 * Instructor:
 * Must own the course
 */
const getCourseById = async (req, res) => {
  try {

    const { id } = req.params;

    // Get course information
    const courseResult = await pool.query(
      `
      SELECT
        courses.*,
        users.name AS instructor_name
      FROM courses
      JOIN users
        ON users.id = courses.instructor_id
      WHERE courses.id = $1
      `,
      [id]
    );

    if (courseResult.rows.length === 0) {

      return res.status(404).json({
        message: "Course not found"
      });

    }

    const course = courseResult.rows[0];

    // =====================================
    // INSTRUCTOR ACCESS
    // =====================================

    if (req.user.role === "instructor") {

      if (
        Number(course.instructor_id) !==
        Number(req.user.id)
      ) {

        return res.status(403).json({
          message:
            "You can only access your own course content"
        });

      }

    }

    // =====================================
    // STUDENT ACCESS
    // =====================================

    else if (req.user.role === "student") {

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
          id
        ]
      );

      if (
        enrollmentResult.rows.length === 0
      ) {

        return res.status(403).json({
          message:
            "You must be enrolled in this course to access its content"
        });

      }

    }

    else {

      return res.status(403).json({
        message: "Access denied"
      });

    }

    // =====================================
    // GET LESSONS AFTER AUTHORIZATION
    // =====================================

    const lessonsResult =
    await pool.query(
      `
      SELECT
        id,
        title,
        content,
        lesson_order
      FROM lessons
      WHERE course_id = $1
      ORDER BY lesson_order ASC
      `,
      [id]
    );

    res.json({
      ...course,
      lessons: lessonsResult.rows
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};


/**
 * Get course for management
 * Instructor owner only
 */
const getCourseForManagement = async (req, res) => {
  try {

    const { id } = req.params;

    // Get course
    const courseResult = await pool.query(
      `
      SELECT
        courses.*,
        users.name AS instructor_name
      FROM courses
      JOIN users
        ON users.id = courses.instructor_id
      WHERE courses.id = $1
      `,
      [id]
    );

    if (courseResult.rows.length === 0) {

      return res.status(404).json({
        message: "Course not found"
      });

    }

    const course = courseResult.rows[0];

    // Verify ownership
    if (
      Number(course.instructor_id) !==
      Number(req.user.id)
    ) {

      return res.status(403).json({
        message:
          "You can only manage your own courses"
      });

    }

    // Get lessons only after ownership is verified
    const lessonsResult = await pool.query(
      `
      SELECT
        id,
        title,
        content,
        lesson_order
      FROM lessons
      WHERE course_id = $1
      ORDER BY lesson_order ASC
      `,
      [id]
    );

    res.json({
      ...course,
      lessons: lessonsResult.rows
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};


/**
 * Update a course
 * Only the course owner can update it
 */
const updateCourse = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      title,
      description
    } = req.body;


    // ----------------------------
    // VALIDATE TITLE
    // ----------------------------

    const cleanTitle =
      typeof title === "string"
        ? title.trim()
        : "";


    if (!cleanTitle) {

      return res.status(400).json({
        message:
          "Course title is required"
      });

    }


    // Description is optional
    const cleanDescription =
      typeof description === "string"
        ? description.trim()
        : "";


    // ----------------------------
    // CHECK COURSE EXISTS
    // ----------------------------

    const courseResult =
      await pool.query(
        `
        SELECT *
        FROM courses
        WHERE id = $1
        `,
        [id]
      );


    if (
      courseResult.rows.length === 0
    ) {

      return res.status(404).json({
        message:
          "Course not found"
      });

    }


    const course =
      courseResult.rows[0];


    // ----------------------------
    // VERIFY OWNERSHIP
    // ----------------------------

    if (
      Number(course.instructor_id) !==
      Number(req.user.id)
    ) {

      return res.status(403).json({
        message:
          "You can only update your own courses"
      });

    }


    // ----------------------------
    // UPDATE COURSE
    // ----------------------------

    const updatedCourse =
      await pool.query(
        `
        UPDATE courses

        SET
          title = $1,
          description = $2

        WHERE id = $3

        RETURNING *
        `,
        [
          cleanTitle,
          cleanDescription || null,
          id
        ]
      );


    res.json({

      message:
        "Course updated successfully",

      course:
        updatedCourse.rows[0]

    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      error:
        error.message
    });

  }

};


/**
 * Delete a course
 * Only the course owner can delete it
 */
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const courseResult = await pool.query(
      "SELECT * FROM courses WHERE id = $1",
      [id]
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
        message: "You can only delete your own courses"
      });
    }

    await pool.query(
      "DELETE FROM courses WHERE id = $1",
      [id]
    );

    res.json({
      message: "Course deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};


module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  getCourseForManagement,
  updateCourse,
  deleteCourse
};