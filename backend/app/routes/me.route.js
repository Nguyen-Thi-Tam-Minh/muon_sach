const express = require("express");
const { auth } = require("../middleware/auth");
const ctrl = require("../controllers/me.controller");

const router = express.Router();

router.get("/profile", auth(["user", "admin"]), ctrl.getProfile);
router.put("/profile", auth(["user"]), ctrl.updateProfile);
router.put("/password", auth(["user", "admin"]), ctrl.changePassword);

module.exports = router;
