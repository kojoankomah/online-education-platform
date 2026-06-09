const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createQuiz,
  addQuestion,
  getQuizQuestions,
  submitQuiz
} = require("../controllers/quizController");

/**
 * Create quiz
 */
router.post(
  "/lesson/:lessonId",
  authMiddleware,
  roleMiddleware("instructor"),
  createQuiz
);

/**
 * Add question
 */
router.post(
  "/:quizId/questions",
  authMiddleware,
  roleMiddleware("instructor"),
  addQuestion
);

/**
 * View questions
 */
router.get(
  "/:quizId/questions",
  getQuizQuestions
);


router.post(
  "/:quizId/submit",
  authMiddleware,
  roleMiddleware("student"),
  submitQuiz
);


module.exports = router;