const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createQuiz,
  addQuestion,
  getQuizQuestions
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

module.exports = router;