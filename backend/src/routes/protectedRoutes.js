console.log("Protected routes loaded");

const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


/**
 * Protected route
 * Requires valid JWT
 */
router.get(
  "/profile",
  authMiddleware,
  (req, res) => {

    res.json({
      message: "Protected route accessed successfully",
      user: req.user
    });

  }
);


/**
 * Returns currently authenticated user
 */
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Current user retrieved successfully",
    user: req.user
  });
});


module.exports = router;