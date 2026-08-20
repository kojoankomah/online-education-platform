const pool = require("../db/connection");

const {
  uploadImage,
  deleteImage
} = require("../utils/cloudinaryUpload");

/**
 * Create a new course
 * Instructor only
 */
const createCourse = async (req, res) => {

  let uploadedImagePublicId = null;

  try {

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


    // Instructor ID comes from JWT
    const instructor_id =
      req.user.id;


    // ----------------------------
    // COURSE THUMBNAIL
    // ----------------------------

    let image_url = null;
    let image_public_id = null;


    if (req.file) {

      const uploadResult =
        await uploadImage(
          req.file.buffer
        );


      image_url =
        uploadResult.secure_url;


      image_public_id =
        uploadResult.public_id;


      uploadedImagePublicId =
        uploadResult.public_id;
    }


    // ----------------------------
    // CREATE COURSE
    // ----------------------------

    const result =
      await pool.query(
        `
        INSERT INTO courses (
          title,
          description,
          image_url,
          image_public_id,
          instructor_id
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5
        )

        RETURNING *
        `,
        [
          cleanTitle,
          cleanDescription || null,
          image_url,
          image_public_id,
          instructor_id
        ]
      );


    res.status(201).json({

      message:
        "Course created successfully",

      course:
        result.rows[0]

    });

  }

  catch (error) {

    console.error(
      "Create course error:",
      error
    );


    if (uploadedImagePublicId) {

      try {

        await deleteImage(
          uploadedImagePublicId
        );

      }

      catch (cleanupError) {

        console.error(
          "Failed course thumbnail cleanup error:",
          cleanupError
        );

      }

    }


    res.status(500).json({
      error:
        error.message
    });

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

  let newImagePublicId = null;

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
    // START WITH EXISTING IMAGE
    // ----------------------------

    let image_url =
      course.image_url;

    let image_public_id =
      course.image_public_id;


    // ----------------------------
    // NEW THUMBNAIL SELECTED
    // ----------------------------

    if (req.file) {

      const uploadResult =
        await uploadImage(
          req.file.buffer
        );


      image_url =
        uploadResult.secure_url;


      image_public_id =
        uploadResult.public_id;


      // Remember this in case
      // database update fails
      newImagePublicId =
        uploadResult.public_id;

    }


    // ----------------------------
    // UPDATE DATABASE
    // ----------------------------

    const updatedCourse =
      await pool.query(
        `
        UPDATE courses

        SET
          title = $1,
          description = $2,
          image_url = $3,
          image_public_id = $4

        WHERE id = $5

        RETURNING *
        `,
        [
          cleanTitle,
          cleanDescription || null,
          image_url,
          image_public_id,
          id
        ]
      );


    // ----------------------------
    // DELETE OLD CLOUDINARY IMAGE
    // ONLY AFTER DATABASE UPDATE
    // SUCCEEDS
    // ----------------------------

    if (
      req.file &&
      course.image_public_id &&
      course.image_public_id !==
        image_public_id
    ) {

      try {

        await deleteImage(
          course.image_public_id
        );

      }

      catch (deleteError) {

        // Course update succeeded,
        // so do not fail the request
        // just because old-image
        // cleanup failed.
        console.error(
          "Old thumbnail cleanup error:",
          deleteError
        );

      }

    }


    res.json({

      message:
        "Course updated successfully",

      course:
        updatedCourse.rows[0]

    });

  }

  catch (error) {

    console.error(
      "Update course error:",
      error
    );


    // If a new image reached Cloudinary
    // but the database update failed,
    // remove the new image so it
    // does not become orphaned.
    if (newImagePublicId) {

      try {

        await deleteImage(
          newImagePublicId
        );

      }

      catch (cleanupError) {

        console.error(
          "New thumbnail cleanup error:",
          cleanupError
        );

      }

    }


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

    if (course.image_public_id) {

      try {

        await deleteImage(
          course.image_public_id
        );

      }

      catch (deleteError) {

        console.error(
          "Course thumbnail cleanup error:",
          deleteError
        );

      }

    }

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