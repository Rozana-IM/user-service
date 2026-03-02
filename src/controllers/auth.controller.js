const db = require("../config/db"); // adjust path if needed
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/* ================= REGISTER ================= */

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await db.pool.query(
      "INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4)",
      [name, email, hashed, role || "user"]
    );

    res.json({ message: "User registered" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= LOGIN ================= */

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ message: "User not found" });

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= REFRESH ================= */

exports.refreshToken = async (req, res) => {
  res.json({ message: "refresh working" });
};

/* ================= ADMIN GET USERS ================= */

exports.getAllUsers = async (req, res) => {
  try {

    // optional admin check
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const users = await db.pool.query(
      "SELECT id,name,email,role FROM users"
    );

    res.json(users.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
