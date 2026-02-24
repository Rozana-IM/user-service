const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllUsers,
} = require("../controllers/auth.controller");

const {
  verifyToken,
  isAdmin,
} = require("../middleware/auth.middleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

// 🔐 ADMIN PROTECTED
router.get("/admin/users", verifyToken, isAdmin, getAllUsers);

module.exports = router;
