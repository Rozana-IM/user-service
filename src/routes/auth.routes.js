const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

// ================= AUTH =================
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/auth/refresh", authController.refreshToken);

module.exports = router;
