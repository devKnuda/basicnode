import pg from 'pg';
import dotenv from 'dotenv';
import { logger } from '../modules/log.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from db.env using absolute path
dotenv.config({ path: path.join(__dirname, '..', 'db.env') });

// Log env variables (remove in production)
logger.log('DEBUG', 'Database config', { 
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE
});

const { Pool } = pg;

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  connectionTimeoutMillis: 5000
});

// Test the connection with better error logging
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Raw database error:', err); // Log raw error to console
    logger.log('ERROR', 'Database connection failed', { 
      error: err.message || 'Unknown error',
      code: err.code || 'No error code',
      details: err.stack || 'No stack trace',
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE
    });
  } else {
    logger.log('INFO', 'Database connected successfully', { timestamp: res.rows[0].now });
  }
});

export default {
  query: (text, params) => {
    logger.log('DEBUG', 'Executing query', { query: text });
    return pool.query(text, params)
      .then(res => {
        logger.log('DEBUG', 'Query success', { rows: res.rowCount });
        return res;
      })
      .catch(err => {
        logger.log('ERROR', 'Query failed', { error: err.message, query: text });
        throw err;
      });
  },
  getClient: () => pool.connect(),
};