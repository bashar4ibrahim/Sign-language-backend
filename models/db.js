const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection
pool.connect()
  .then(() => {
    console.log("✅ Connected to PostgreSQL successfully!");
  })
  .catch((err) => {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
  });

module.exports = pool;
