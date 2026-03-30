const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

// ================= TOKEN HELPERS =================

const generateAccessToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });


// =================================================
// ================= REGISTER USER =================
// =================================================

exports.registerUser = async (req, res) => {
  try {
    console.log("🔥 REGISTER HIT");

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
      [name, email, hashedPassword]
    );

    const user = {
      id: result.insertId,
      name,
      email,
      role: "user",
    };

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await db.query(
      "UPDATE users SET refresh_token=? WHERE id=?",
      [refreshToken, user.id]
    );

    return res.status(201).json({
      message: "User registered successfully",
      user,
      token,
      refreshToken,
    });

  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);
    return res.status(500).json({
      error: "Server error",
    });
  }
};


// =================================================
// ================= LOGIN USER ====================
// =================================================
exports.loginUser = async (req, res) => {
  console.log("🔥 LOGIN HIT");

  try {
    console.log("👉 BODY:", req.body);

    const { email, password } = req.body;

    console.log("⏳ Running DB query...");

    const results = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    console.log("✅ DB RESULT:", results);

    if (!results || results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.json({ message: "LOGIN WORKING" });

  } catch (err) {
    console.error("❌ LOGIN ERROR FULL:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// =================================================
// ================= REFRESH TOKEN =================
// =================================================

exports.refreshToken = async (req, res) => {
  try {
    console.log("🔥 REFRESH TOKEN HIT");

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: "Refresh token missing",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const results = await db.query(
      "SELECT * FROM users WHERE id=? AND refresh_token=?",
      [decoded.id, refreshToken]
    );

    if (!results || results.length === 0) {
      return res.status(403).json({
        error: "Refresh token revoked",
      });
    }

    const dbUser = results[0];

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    };

    const newToken = generateAccessToken(user);

    return res.status(200).json({
      token: newToken,
    });

  } catch (err) {
    console.error("❌ REFRESH ERROR:", err);
    return res.status(500).json({
      error: "Server error",
    });
  }
};


// =================================================
// ================= ADMIN - GET USERS =============
// =================================================

exports.getAllUsers = async (req, res) => {
  try {
    console.log("🔥 GET USERS HIT");

    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Admin access only",
      });
    }

    const users = await db.query(
      "SELECT id, name, email, role FROM users"
    );

    return res.status(200).json(users);

  } catch (err) {
    console.error("❌ GET USERS ERROR:", err);
    return res.status(500).json({
      error: "Database error",
    });
  }
};
