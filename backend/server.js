require("dotenv").config();

console.log("PORT:", process.env.PORT);
console.log("DB URL exists:", !!process.env.DATABASE_URL);

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});