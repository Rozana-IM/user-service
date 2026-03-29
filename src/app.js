const express = require("express");
const cors = require("cors");
const db = require("./db");

// 👉 IMPORT ROUTES EXPLICITLY
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 4000;

const addressRoutes = require("./routes/addressRoutes");

app.use("/users", authRoutes);

// ================= Middleware =================
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://rozana-projects.online",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// ================= DB Connection =================
// ✅ Non-blocking DB connection
db.connect()
  .then(() => console.log("DB connected"))
  .catch(err => console.error("DB error:", err));

// ================= Routes =================
// 🔥 IMPORTANT: mount at ROOT
app.use("/users", authRoutes);

// ================= Health =================
app.get("/health", (req, res) => {
res.status(200).json({ status: "ok" });});

// ================= Start =================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ User Service running on port ${PORT}`);
});
