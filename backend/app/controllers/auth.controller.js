const jwt = require("jsonwebtoken");
const MongoDB = require("../utils/mongodb.util");
const UserService = require("../services/user.service");
const config = require("../config");

const svc = () => new UserService(MongoDB.getClient());
const SECRET = config.app.jwtSecret;

exports.register = async (req, res, next) => {
  try {
    // luôn là user thường khi tự đăng ký
    req.body.role = "user";
    const user = await svc().register(req.body);
    res.json({
      message: "Registered",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        readerId: user.readerId || null,
      },
    });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await svc().login(req.body.username, req.body.password);
    const token = jwt.sign(
      { id: user._id, role: user.role, readerId: user.readerId || null },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        readerId: user.readerId || null,
      },
    });
  } catch (e) {
    next(e);
  }
};
