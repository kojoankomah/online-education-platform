const pool = require("./connection");

async function testDB() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("DB connected:", result.rows[0]);
  } catch (err) {
    console.error("DB connection failed:", err.message);
  }
}

testDB();