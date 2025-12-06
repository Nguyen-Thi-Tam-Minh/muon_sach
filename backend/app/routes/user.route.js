const express = require("express");
const { auth } = require("../middleware/auth");
const ctrl = require("../controllers/user.controller");

const router = express.Router();

// tất cả route này đều chỉ cho admin
router.use(auth(["admin"]));

router.route("/")
  .get(ctrl.list)
  .post(ctrl.create);

router.route("/:id")
  .put(ctrl.update)
  .delete(ctrl.remove);

module.exports = router;
