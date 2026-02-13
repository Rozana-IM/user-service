const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

// ======================
// Middleware
// ======================
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://rozana-projects.online",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ======================
// Connect to Database
// ======================
db.connect();

// ======================
// REGISTER USER
// ======================
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      (err) => {
        if (err) {
          console.error("❌ Register error:", err.message);
          return res
            .status(409)
            .json({ error: "User already exists or DB error" });
        }

        res.status(201).json({ message: "User registered successfully" });
      }
    );
  } catch (error) {
    console.error("❌ Register exception:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================
// LOGIN USER
// ======================
app.post("/login", async (req, res) => {
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
          console.error("❌ Login DB error:", err.message);
          return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
          return res.status(401).json({ error: "User not found" });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        res.json({
          message: "Login successful",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      }
    );
  } catch (error) {
    console.error("❌ Login exception:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================
// GET USERS
// ======================
app.get("/users", (req, res) => {
  db.pool.query("SELECT id, name, email FROM users", (err, results) => {
    if (err) {
      console.error("❌ Error fetching users:", err.message);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ======================
// HEALTH CHECK
// ======================
app.get("/health", (req, res) => {
  res.status(200).send("User Service is healthy");
});

// ======================
// START SERVER
// ======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ User Service running on port ${PORT}`);
});
