const express = require("express");
const ctrl = require("../controllers/borrow.controller");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Danh sách / Tạo yêu cầu mượn
router
  .route("/")
  .get(auth(["admin", "user"]), ctrl.findAll) // cả user và admin xem danh sách (tuỳ query)
  .post(auth(["user"]), ctrl.create);        // chỉ user được tạo yêu cầu

// Chi tiết phiếu
router.get("/:id", auth(["admin", "user"]), ctrl.findOne);

// Thao tác trạng thái (admin)
router.patch("/:id/approve", auth(["admin"]), ctrl.approve);
router.patch("/:id/mark-borrowed", auth(["admin"]), ctrl.markBorrowed);
router.patch("/:id/mark-returned", auth(["admin"]), ctrl.markReturned);

module.exports = router;
