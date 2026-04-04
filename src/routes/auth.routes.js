const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

// ✅ IMPORT BOTH
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");

// ================= AUTH =================
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/auth/refresh", authController.refreshToken);

// ================= ADMIN =================

// ❌ REMOVE THIS (UNPROTECTED ROUTE)
// router.get("/", authController.getAllUsers);

// ✅ ONLY THIS
router.get("/all", verifyToken, verifyAdmin, authController.getAllUsers);

module.exports = router;
