const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getAllUsers,
} = require("../controllers/auth.controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/admin/users", getAllUsers);

module.exports = router;
