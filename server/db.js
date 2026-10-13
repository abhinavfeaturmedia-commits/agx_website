// ============================================================================
// AGX Node.js Server - MySQL Database Connection Pool
// Compatible with Hostinger MySQL / phpMyAdmin
// ============================================================================
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agx_crm',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  timezone: '+00:00',
  dateStrings: true
};

let pool = null;
let isConnected = false;
let lastError = null;

try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  lastError = err.message;
  console.warn('[DB] Notice: MySQL pool initialization deferred:', err.message);
}

/**
 * Test connectivity to the MySQL database
 */
export async function checkDbConnection() {
  if (!pool) {
    return { connected: false, error: 'Database pool not initialized' };
  }
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    lastError = null;
    return { connected: true, database: dbConfig.database, host: dbConfig.host };
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    return { connected: false, error: err.message, host: dbConfig.host, database: dbConfig.database };
  }
}

/**
 * Execute a SQL query using the connection pool
 */
export async function query(sql, params = []) {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  const [rows, fields] = await pool.query(sql, params);
  return rows;
}

/**
 * Execute a parameterized statement (INSERT, UPDATE, DELETE)
 */
export async function execute(sql, params = []) {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  const [result] = await pool.execute(sql, params);
  return result;
}

export function getDbStatus() {
  return {
    connected: isConnected,
    host: dbConfig.host,
    database: dbConfig.database,
    user: dbConfig.user ? `${dbConfig.user.substring(0, 4)}***` : 'unspecified',
    lastError
  };
}

export default {
  pool,
  query,
  execute,
  checkDbConnection,
  getDbStatus
};
