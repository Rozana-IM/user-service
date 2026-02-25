const express = require("express");
const cors = require("cors");
const db = require("./db");

// 👉 IMPORT ROUTES EXPLICITLY
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 4000;

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
db.connect();

// ================= Routes =================
// 🔥 IMPORTANT: mount at ROOT
app.use("/", authRoutes);

// ================= Health =================
app.get("/health", (req, res) => {
  res.status(200).send("User Service is healthy");
});

// ================= Start =================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ User Service running on port ${PORT}`);
});
