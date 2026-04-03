const express = require("express");
const router = express.Router();

const addressController = require("../controllers/addressController");
const { refreshToken } = require("../controllers/auth.controller"); // ✅ FIX

router.post("/users/:id/address", addressController.addAddress);

router.get("/users/:id/addresses", addressController.getAddresses);

// ✅ REFRESH TOKEN ROUTE
router.post("/refresh-token", refreshToken);

module.exports = router;
