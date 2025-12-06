// app/controllers/reader.controller.js
const MongoDB = require("../utils/mongodb.util");
const ReaderService = require("../services/reader.service");
const svc = () => new ReaderService(MongoDB.getClient());

exports.create = async (req, res, next) => {
  try { res.status(201).json(await svc().create(req.body)); } catch (e) { next(e); }
};
exports.findAll = async (req, res, next) => {
  try { res.json(await svc().findAll()); } catch (e) { next(e); }
};
