const express = require("express");
const ctrl = require("../controllers/publisher.controller");
const { auth } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .get(ctrl.findAll)
  .post(auth(["admin"]), ctrl.create);

router
  .route("/:id")
  .get(ctrl.findOne)
  .put(auth(["admin"]), ctrl.update)
  .delete(auth(["admin"]), ctrl.delete);

module.exports = router;
