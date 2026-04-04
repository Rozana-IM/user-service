console.log("verifyToken:", verifyToken);
console.log("verifyAdmin:", verifyAdmin);
console.log("getAllUsers:", authController.getAllUsers);
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

// ✅ MUST MATCH EXACT EXPORT NAME
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");

// ================= AUTH =================
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/auth/refresh", authController.refreshToken);

// ================= ADMIN =================
router.get("/all", verifyToken, verifyAdmin, authController.getAllUsers);

module.exports = router;
