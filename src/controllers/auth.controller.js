const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

// REGISTER
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.pool.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
    [name, email, hashedPassword],
    (err, result) => {
      if (err) {
        return res
          .status(409)
          .json({ error: "User already exists. Please login." });
      }

      const token = jwt.sign(
        { id: result.insertId, email, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        user: { id: result.insertId, name, email, role: "user" },
        token,
      });
    }
  );
};

// LOGIN
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  db.pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    }
  );
};

// ADMIN – GET USERS
exports.getAllUsers = (req, res) => {
  db.pool.query("SELECT id, name, email, role FROM users", (err, results) => {
    res.json(results);
  });
};
