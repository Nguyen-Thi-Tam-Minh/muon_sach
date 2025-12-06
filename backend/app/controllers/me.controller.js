const bcrypt = require("bcryptjs");
const MongoDB = require("../utils/mongodb.util");
const UserService = require("../services/user.service");
const ReaderService = require("../services/reader.service");

const userSvc = () => new UserService(MongoDB.getClient());
const readerSvc = () => new ReaderService(MongoDB.getClient());

const sanitizeUser = (u) => {
  if (!u) return null;
  return {
    id: u._id,
    username: u.username,
    role: u.role,
    readerId: u.readerId || null,
  };
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await userSvc().findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let reader = null;
    if (user.readerId) {
      reader = await readerSvc().findById(user.readerId);
    }

    res.json({ user: sanitizeUser(user), reader });
  } catch (e) {
    next(e);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await userSvc().findById(req.user.id);
    if (!user || !user.readerId) {
      return res.status(400).json({ message: "User has no reader profile" });
    }

    const updated = await readerSvc().update(user.readerId, req.body);
    res.json(updated);
  } catch (e) {
    next(e);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Missing password fields" });
    }

    const userService = userSvc();
    const user = await userService.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    await userService.update(req.user.id, { password: newPassword });
    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (e) {
    next(e);
  }
};
