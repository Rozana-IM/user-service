const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// AUTH
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/auth/refresh", authController.refreshToken);

// ADMIN USERS
router.get("/", authController.getAllUsers);
router.get("/all", verifyToken, verifyAdmin, getAllUsers);
module.exports = router;
