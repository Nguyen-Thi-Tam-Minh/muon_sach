const MongoDB = require("../utils/mongodb.util");
const PublisherService = require("../services/publisher.service");

const getService = () => new PublisherService(MongoDB.getClient());

exports.create = async (req, res, next) => {
  try {
    const result = await getService().create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const result = await getService().findAll();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const result = await getService().findById(req.params.id);
    if (!result)
      return res.status(404).json({ message: "Publisher not found" });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const result = await getService().update(req.params.id, req.body);
    if (!result)
      return res.status(404).json({ message: "Publisher not found" });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const result = await getService().delete(req.params.id);
    if (!result)
      return res.status(404).json({ message: "Publisher not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    next(error);
  }
};
