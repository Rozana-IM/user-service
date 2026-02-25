const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

// ================= TOKEN HELPERS =================
const generateAccessToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });

// ================= REGISTER =================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
      [name, email, hashedPassword],
      (err, result) => {
        if (err) {
          return res.status(409).json({ error: "User already exists" });
        }

        const user = {
          id: result.insertId,
          name,
          email,
          role: "user",
        };

        const token = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        db.pool.query(
          "UPDATE users SET refresh_token=? WHERE id=?",
          [refreshToken, user.id]
        );

        return res.status(201).json({
          user,
          token,
          refreshToken,
        });
      }
    );
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ================= LOGIN =================
exports.loginUser = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    db.pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err || results.length === 0) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const dbUser = results[0];
        const match = await bcrypt.compare(password, dbUser.password);

        if (!match) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role, // ✅ REQUIRED FOR ADMIN
        };

        const token = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        db.pool.query(
          "UPDATE users SET refresh_token=? WHERE id=?",
          [refreshToken, user.id]
        );

        return res.status(200).json({
          user,
          token,
          refreshToken,
        });
      }
    );
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ================= REFRESH TOKEN =================
exports.refreshToken = (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token missing" });
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid refresh token" });

      db.pool.query(
        "SELECT * FROM users WHERE id=? AND refresh_token=?",
        [decoded.id, refreshToken],
        (err, results) => {
          if (err || results.length === 0) {
            return res.status(403).json({ error: "Refresh token revoked" });
          }

          const dbUser = results[0];

          const user = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
          };

          const newToken = generateAccessToken(user);

          return res.status(200).json({ token: newToken });
        }
      );
    });
  } catch (err) {
    console.error("❌ Refresh token error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
