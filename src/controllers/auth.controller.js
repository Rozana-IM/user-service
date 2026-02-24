const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const generateAccessToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });

// ================= REGISTER =================
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.pool.query(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?, 'user')",
    [name, email, hashed],
    (err, result) => {
      if (err) return res.status(409).json({ error: "User exists" });

      const payload = { id: result.insertId, email, role: "user" };
      const token = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      db.pool.query(
        "UPDATE users SET refresh_token=? WHERE id=?",
        [refreshToken, result.insertId]
      );

      res.json({ user: payload, token, refreshToken });
    }
  );
};

// ================= LOGIN =================
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  db.pool.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, rows) => {
      if (!rows.length) return res.status(401).json({ error: "Invalid login" });

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: "Invalid login" });

      const payload = { id: user.id, email, role: user.role };
      const token = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      db.pool.query(
        "UPDATE users SET refresh_token=? WHERE id=?",
        [refreshToken, user.id]
      );

      res.json({ user: payload, token, refreshToken });
    }
  );
};

// ================= REFRESH =================
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    db.pool.query(
      "SELECT * FROM users WHERE id=? AND refresh_token=?",
      [user.id, refreshToken],
      (err, rows) => {
        if (!rows.length) return res.sendStatus(403);

        const token = generateAccessToken({
          id: user.id,
          email: user.email,
          role: user.role,
        });

        res.json({ token });
      }
    );
  });
};
