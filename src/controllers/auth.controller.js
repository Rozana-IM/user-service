const bcrypt = require("bcryptjs");
const db = require("../db");

// ================= REGISTER (AUTO LOGIN) =================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      (err, result) => {
        if (err) {
          return res
            .status(409)
            .json({ error: "User already exists. Please login." });
        }

        // ✅ RETURN USER FOR FRONTEND AUTO LOGIN
        res.status(201).json({
          user: {
            id: result.insertId,
            name,
            email,
          },
        });
      }
    );
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ================= LOGIN =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    db.pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
          return res
            .status(401)
            .json({ error: "Invalid email or password" });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return res
            .status(401)
            .json({ error: "Invalid email or password" });
        }

        res.json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      }
    );
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ================= ADMIN – GET ALL USERS =================
exports.getAllUsers = (req, res) => {
  db.pool.query(
    "SELECT id, name, email FROM users",
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    }
  );
};
