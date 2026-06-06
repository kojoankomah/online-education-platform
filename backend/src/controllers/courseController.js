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
 * Get single course by ID
 */
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        courses.*,
        users.name AS instructor_name
       FROM courses
       JOIN users ON users.id = courses.instructor_id
       WHERE courses.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById
};