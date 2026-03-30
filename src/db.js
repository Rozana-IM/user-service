const mysql = require("mysql2/promise");

/*
=========================================
Create MySQL Connection Pool
=========================================
*/

const pool = mysql.createPool({
  host: process.env.DB_HOST,   // ⚠️ MUST be RDS endpoint (not localhost)
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 10000 // ⏱️ prevents hanging (VERY IMPORTANT)
});

/*
=========================================
Test Database Connection
=========================================
*/

async function connect() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ DB CONNECTED SUCCESSFULLY");
    connection.release();
  } catch (err) {
    console.error("❌ DB CONNECTION FAILED:", err);
  }
}

/*
=========================================
Query Helper (USE THIS ALWAYS)
=========================================
*/

async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error("❌ DB QUERY ERROR:", err);
    throw err;
  }
}

/*
=========================================
Exports
=========================================
*/

module.exports = {
  pool,
  connect,
  query
};
