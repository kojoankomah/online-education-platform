const express = require("express");
const router = express.Router();
const pool = require("../db/connection");


router.get("/test-db", async (req, res) => {
  console.log("ROUTE HIT: /api/test-db");

  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      time: result.rows[0],
    });
  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;