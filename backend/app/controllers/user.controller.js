const MongoDB = require("../utils/mongodb.util");
const UserService = require("../services/user.service");

const svc = () => new UserService(MongoDB.getClient());

const sanitize = (u) => {
  if (!u) return u;
  const { password, ...rest } = u;
  return rest;
};

exports.list = async (req, res, next) => {
  try {
    const users = await svc().findAll();
    res.json(users.map(sanitize));
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const user = await svc().register(req.body); // admin có thể set role
    res.status(201).json(sanitize(user));
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const user = await svc().update(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(sanitize(user));
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const user = await svc().delete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Deleted", user: sanitize(user) });
  } catch (e) { next(e); }
};
