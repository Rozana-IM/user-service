const express = require("express");
const cors = require("cors");

const app = express();

// REMOVE CSP
app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  next();
});

app.use(express.json());

// ✅ FIXED CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://rozana-projects.online",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ROUTES
const authRoutes = require("./routes/auth.routes");
app.use("/users", authRoutes);

// HEALTH
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// START
app.listen(4000, "0.0.0.0", () => {
  console.log("✅ User Service running");
});
