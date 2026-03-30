const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();   // ✅ CREATE FIRST

// ✅ REMOVE CSP HEADER
app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  next();
});

// 👉 IMPORT ROUTES
const authRoutes = require("./routes/auth.routes");
const addressRoutes = require("./routes/addressRoutes");

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || "https://rozana-projects.online",
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use("/users", authRoutes);
app.use("/", addressRoutes);

// HEALTH
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// START
app.listen(4000, "0.0.0.0", () => {
  console.log("✅ User Service running");
});
