// app/routes/reader.route.js
const express = require("express");
const ctrl = require("../controllers/reader.controller");
const router = express.Router();
const {auth} = require("../middleware/auth");

router.post("/", ctrl.create);
router.get("/", auth(["admin", "user"]), ctrl.findAll);

module.exports = router;
