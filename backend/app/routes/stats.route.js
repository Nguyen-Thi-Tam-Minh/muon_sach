// app/routes/stats.route.js
const express = require("express");
const { auth } = require("../middleware/auth");
const ctrl = require("../controllers/stats.controller");

const router = express.Router();

router.get("/", auth(["admin"]), ctrl.overview);

module.exports = router;
