/**
 * Database Configuration
 * MySQL Connection Pool using mysql2/promise
 */

const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'restaurant_db',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+00:00',
  dateStrings: false,
  supportBigNumbers: true,
  bigNumberStrings: false
});

/**
 * Test database connection
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

/**
 * Execute a query with error handling
 */
async function query(sql, params = []) {
  try {
    // Use pool.query instead of pool.execute to avoid prepared statement issues
    // with dynamic LIMIT/OFFSET values
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    logger.error('Database query error:', { sql, error: error.message });
    throw error;
  }
}

/**
 * Get a connection from the pool for transactions
 */
async function getConnection() {
  return await pool.getConnection();
}

module.exports = {
  pool,
  query,
  getConnection,
  testConnection
};
