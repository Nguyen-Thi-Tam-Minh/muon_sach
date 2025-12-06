// app/config/index.js
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  app: {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || "supersecret123",
  },
  db: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/book_borrow_management",
  },
};