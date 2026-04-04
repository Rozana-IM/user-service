const jwt = require("jsonwebtoken");

/* ================= VERIFY TOKEN ================= */

exports.verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, email, role }

    next();

  } catch (err) {
    console.error("❌ Token error:", err.message);

    return res.status(401).json({
      error: err.name === "TokenExpiredError"
        ? "Token expired"
        : "Invalid token"
    });
  }
};


/* ================= ADMIN CHECK ================= */

exports.verifyAdmin = (req, res, next) => {

  console.log("🔐 ADMIN CHECK");

  // ✅ SAFETY CHECK (VERY IMPORTANT)
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      error: "Admin access required"
    });
  }

  next();
};
