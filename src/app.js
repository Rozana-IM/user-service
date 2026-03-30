const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express(); // ✅ MUST COME FIRST

// 🔥 REMOVE CSP HEADER (FIX)
app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  next();
});

// 👉 IMPORT ROUTES
const authRoutes = require("./routes/auth.routes");
const addressRoutes = require("./routes/addressRoutes");

const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || "https://rozana-projects.online",
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use("/users", authRoutes);
app.use("/", addressRoutes);

// ================= DB =================
db.connect();

// ================= HEALTH =================
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ================= START =================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ User Service running on port ${PORT}`);
});
