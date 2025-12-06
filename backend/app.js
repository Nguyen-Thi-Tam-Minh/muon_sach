const express = require("express");
const cors = require("cors");
const booksRouter = require("./app/routes/book.route");
const borrowsRouter = require("./app/routes/borrow.route");
const readersRouter = require("./app/routes/reader.route");
const authRouter = require("./app/routes/auth.route");
const usersRouter = require("./app/routes/user.route");
const statsRouter = require("./app/routes/stats.route");
const meRouter = require("./app/routes/me.route");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to book borrow application." });
});

app.use("/api/auth", authRouter);
app.use("/api/books", booksRouter);
app.use("/api/borrows", borrowsRouter);
app.use("/api/readers", readersRouter);
app.use("/api/users", usersRouter);
app.use("/api/stats", statsRouter);
app.use("/api/me", meRouter);

// 404 + error handler như trước
app.use((req, res) => res.status(404).json({ message: "Resource not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

module.exports = app;
