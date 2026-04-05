const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const { saveAddress, getUserAddresses } = require("../controllers/addressController");

/* ================= AUTH ================= */

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/auth/refresh", authController.refreshToken);
router.post("/addresses", authMiddleware, saveAddress);

/* ================= ADMIN ================= */

// ✅ MUST have both middlewares
router.get("/all", verifyToken, verifyAdmin, authController.getAllUsers);
router.get("/addresses", authMiddleware, getUserAddresses);


module.exports = router;
