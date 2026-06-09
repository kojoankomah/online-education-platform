const pool = require("../db/connection");

/**
 * Create quiz for a lesson
 */
const createQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title } = req.body;

    const lessonResult = await pool.query(
      "SELECT * FROM lessons WHERE id = $1",
      [lessonId]
    );

    if (lessonResult.rows.length === 0) {
      return res.status(404).json({
        message: "Lesson not found"
      });
    }

    const quiz = await pool.query(
      `INSERT INTO quizzes (lesson_id, title)
       VALUES ($1, $2)
       RETURNING *`,
      [lessonId, title]
    );

    res.status(201).json({
      message: "Quiz created successfully",
      quiz: quiz.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};


/**
 * Add question to quiz
 */
const addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;

    const {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer
    } = req.body;

    const quizResult = await pool.query(
      "SELECT * FROM quizzes WHERE id = $1",
      [quizId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO quiz_questions
      (
        quiz_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        quizId,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer
      ]
    );

    res.status(201).json({
      message: "Question added successfully",
      question: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};


/**
 * Get questions for a quiz
 */
const getQuizQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;

    const questions = await pool.query(
      `
      SELECT
        id,
        question,
        option_a,
        option_b,
        option_c,
        option_d
      FROM quiz_questions
      WHERE quiz_id = $1
      `,
      [quizId]
    );

    res.json(questions.rows);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};



module.exports = {
  createQuiz,
  addQuestion,
  getQuizQuestions
};