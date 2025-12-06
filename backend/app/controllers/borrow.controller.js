// app/controllers/borrow.controller.js
const MongoDB = require("../utils/mongodb.util");
const BorrowService = require("../services/borrow.service");

const svc = () => new BorrowService(MongoDB.getClient());

exports.create = async (req, res, next) => {
  try {
    // maDocGia lấy từ user đang đăng nhập
    if (!req.user?.readerId) {
      return res.status(400).json({ message: "User has no reader profile" });
    }
    const data = {
      maSach: req.body.maSach,
      maDocGia: req.user.readerId,
    };
    const created = await svc().create(data);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const { status, maDocGia } = req.query;
    const data = await svc().findAll({ status, maDocGia });
    res.json(data);
  } catch (e) { next(e); }
};

exports.findOne = async (req, res, next) => {
  try {
    const data = await svc().findById(req.params.id);
    if (!data) return res.status(404).json({ message: "Borrow not found" });
    res.json(data);
  } catch (e) { next(e); }
};

exports.approve = async (req, res, next) => {
  try {
    const data = await svc().approve(req.params.id, { msnv: req.body.msnv });
    res.json(data);
  } catch (e) { next(e); }
};

exports.markBorrowed = async (req, res, next) => {
  try {
    const data = await svc().markBorrowed(req.params.id);
    res.json(data);
  } catch (e) { next(e); }
};

exports.markReturned = async (req, res, next) => {
  try {
    const data = await svc().markReturned(req.params.id);
    res.json(data);
  } catch (e) { next(e); }
};