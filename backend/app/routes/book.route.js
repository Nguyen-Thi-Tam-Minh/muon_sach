// app/routes/book.route.js
const express = require("express");
const books = require("../controllers/book.controller");
const { auth } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .get(books.findAll)   // GET /api/books?q=keyword
  .post(auth(["admin"]), books.create)  // POST /api/books
  .delete(auth(["admin"]), books.deleteAll); // DELETE /api/books

router
  .route("/:id")
  .get(books.findOne)   // GET /api/books/:id
  .put(auth(["admin"]), books.update)    // PUT /api/books/:id
  .delete(auth(["admin"]), books.delete); // DELETE /api/books/:id

module.exports = router;
