const mysql = require("mysql2/promise");

/*
=========================================
Create MySQL Connection Pool
=========================================
*/

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/*
=========================================
Test Database Connection (ASYNC)
=========================================
*/

async function connect() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ User Service DB connected");
    connection.release();
  } catch (err) {
    console.error("❌ User Service DB connection failed:", err.message);
  }
}

/*
=========================================
Helper Query Function (OPTIONAL)
=========================================
*/

async function query(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error("❌ DB query error:", err.message);
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
