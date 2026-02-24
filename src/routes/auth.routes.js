const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/auth.controller");

router.post("/register", ctrl.registerUser);
router.post("/login", ctrl.loginUser);
router.post("/auth/refresh", ctrl.refreshToken);

module.exports = router;
