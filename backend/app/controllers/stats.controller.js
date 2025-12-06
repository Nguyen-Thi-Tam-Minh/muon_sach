// app/controllers/stats.controller.js
const MongoDB = require("../utils/mongodb.util");
const StatsService = require("../services/stats.service");

exports.overview = async (req, res, next) => {
  try {
    const svc = new StatsService(MongoDB.getClient());
    const data = await svc.getOverview();
    res.json(data);
  } catch (e) {
    next(e);
  }
};
