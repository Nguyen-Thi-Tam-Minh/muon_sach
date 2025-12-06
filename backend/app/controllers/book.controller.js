// app/controllers/book.controller.js
const MongoDB = require("../utils/mongodb.util");
const BookService = require("../services/book.service");

const getService = () => new BookService(MongoDB.getClient());

exports.create = async (req, res, next) => {
  try {
    const service = getService();
    const book = await service.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const service = getService();
    const books = await service.findAll({ q: req.query.q });
    res.json(books);
  } catch (err) {
    next(err);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const service = getService();
    const book = await service.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const service = getService();
    const book = await service.update(req.params.id, req.body);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const service = getService();
    const book = await service.delete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Deleted", book });
  } catch (err) {
    next(err);
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const service = getService();
    const result = await service.deleteAll();
    res.json(result);
  } catch (err) {
    next(err);
  }
};
