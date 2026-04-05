const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");
const { saveAddress, getUserAddresses } = require("../controllers/addressController");
const { saveAddress, getUserAddresses, deleteAddress } = require("../controllers/addressController");

/* ================= AUTH ================= */

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/auth/refresh", authController.refreshToken);

/* ================= ADDRESS ================= */

router.post("/addresses", verifyToken, saveAddress);
router.get("/addresses", verifyToken, getUserAddresses);
router.delete("/addresses/:id", verifyToken, deleteAddress);

/* ================= ADMIN ================= */

router.get("/all", verifyToken, verifyAdmin, authController.getAllUsers);

module.exports = router;
