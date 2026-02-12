const mysql = require("mysql2");

console.log("🔥 DB.JS VERSION 2026-02-12 FIXED");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const connect = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("❌ User Service DB connection failed:", err.message);
      return;
    }
    console.log("✅ User Service DB connected");
    connection.release();
  });
};

module.exports = { pool, connect };

