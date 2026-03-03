const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// AUTH
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/auth/refresh", authController.refreshToken);

// ADMIN USERS
router.get("/users", verifyToken, authController.getAllUsers);

module.exports = router;
