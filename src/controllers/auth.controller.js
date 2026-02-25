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
  const { name, email, password } = req.body;

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

      res.json({
        user,
        token,
        refreshToken,
      });
    }
  );
};

// ================= LOGIN =================
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

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
        role: dbUser.role, // ✅ THIS WAS MISSING
      };

      const token = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      db.pool.query(
        "UPDATE users SET refresh_token=? WHERE id=?",
        [refreshToken, user.id]
      );

      res.json({
        user,        // ✅ role now sent to frontend
        token,
        refreshToken,
      });
    }
  );
};

// ================= REFRESH TOKEN =================
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);

    db.pool.query(
      "SELECT * FROM users WHERE id=? AND refresh_token=?",
      [decoded.id, refreshToken],
      (err, results) => {
        if (err || results.length === 0) {
          return res.sendStatus(403);
        }

        const dbUser = results[0];

        const user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
        };

        const newToken = generateAccessToken(user);

        res.json({ token: newToken });
      }
    );
  });
};
