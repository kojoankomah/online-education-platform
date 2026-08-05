const pool = require("../db/connection");

/**
 * Create quiz for a lesson
 */
const createQuiz = async (req, res) => {
  try {

    const { lessonId } = req.params;
    const { title } = req.body;


    // Check lesson and course ownership
    const lessonResult = await pool.query(
      `
      SELECT 
        lessons.id,
        courses.instructor_id

      FROM lessons

      JOIN courses
      ON lessons.course_id = courses.id

      WHERE lessons.id = $1
      `,
      [lessonId]
    );


    if (lessonResult.rows.length === 0) {

      return res.status(404).json({
        message: "Lesson not found"
      });

    }


    const lesson = lessonResult.rows[0];


    // Verify instructor owns the course
    if (lesson.instructor_id !== req.user.id) {

      return res.status(403).json({
        message:
        "You can only create quizzes for your own courses"
      });

    }

    // Create quiz
    const quiz = await pool.query(

      `
      INSERT INTO quizzes
      (
        lesson_id,
        title
      )

      VALUES ($1,$2)

      RETURNING *
      `,

      [
        lessonId,
        title
      ]

    );


    res.status(201).json({

      message:
      "Quiz created successfully",

      quiz:
      quiz.rows[0]

    });


  } catch(error) {

    res.status(500).json({

      error:
      error.message

    });

  }

};




/**
 * Get quizzes for a lesson
 */
const getLessonQuizzes = async (req, res) => {

  try {

    const { lessonId } = req.params;


    const quizzes = await pool.query(
      `
      SELECT *
      FROM quizzes
      WHERE lesson_id = $1
      ORDER BY created_at ASC
      `,
      [lessonId]
    );


    res.json(quizzes.rows);


  } catch(error){

    res.status(500).json({
      error:error.message
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

    // Check if quiz exists
    const quizResult = await pool.query(
      "SELECT * FROM quizzes WHERE id = $1",
      [quizId]
    );


    // Check if quiz exists
    const quiz = quizResult.rows[0];

    // Verify ownership of the quiz by checking the instructor_id of the course associated with the lesson of the quiz
    const ownershipCheck = await pool.query(
    `
    SELECT courses.instructor_id
    FROM quizzes
    JOIN lessons
    ON quizzes.lesson_id = lessons.id
    JOIN courses
    ON lessons.course_id = courses.id
    WHERE quizzes.id=$1
    `,
    [quizId]
    );


    const instructorId =
    ownershipCheck.rows[0].instructor_id;


    if(Number(instructorId)!==Number(req.user.id)){

        return res.status(403).json({
            message:"You can only add questions to your own quizzes"
        });

    }


    // Verify that the quiz belongs to a lesson owned by the instructor
    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    // Verify ownership
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


const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user.id;
    const { answers } = req.body;

    // Get all correct answers
    const questionsResult = await pool.query(
      "SELECT id, correct_answer FROM quiz_questions WHERE quiz_id = $1",
      [quizId]
    );

    const questions = questionsResult.rows;

    if (questions.length === 0) {
      return res.status(404).json({
        message: "No questions found for this quiz"
      });
    }

    let score = 0;

    // Compare answers
    questions.forEach((q) => {
      const studentAnswer = answers.find(a => a.questionId === q.id);

      if (studentAnswer && studentAnswer.answer === q.correct_answer) {
        score++;
      }
    });

    const totalQuestions = questions.length;


    const percentage = Math.round((score / totalQuestions) * 100);

    const passed = percentage >= 70;


    // Save attempt
    const attempt = await pool.query(
      `INSERT INTO quiz_attempts
        (quiz_id, student_id, score, total_questions, passed)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
      [
        quizId,
        studentId,
        score,
        totalQuestions,
        passed
      ]
    );

res.json({
  message: "Quiz submitted successfully",
  score,
  totalQuestions,
  percentage,
  passed,
  attempt: attempt.rows[0]
});


  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }


};


module.exports = {
  createQuiz,
  getLessonQuizzes,
  addQuestion,
  getQuizQuestions,
  submitQuiz
};