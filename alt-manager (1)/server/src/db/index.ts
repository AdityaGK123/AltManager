import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ensure DATABASE_URL is a string
if (!process.env.DATABASE_URL || typeof process.env.DATABASE_URL !== 'string') {
  throw new Error('DATABASE_URL environment variable is not set or invalid');
}

// Optimized connection pool for Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  max: 10, // Maximum pool size (reduced for better stability)
  min: 2, // Minimum pool size (keep connections warm)
  idleTimeoutMillis: 20000, // Close idle clients after 20s
  connectionTimeoutMillis: 30000, // Timeout after 30s (handles Neon cold starts)
  allowExitOnIdle: false, // Keep pool alive
  statement_timeout: 15000, // 15s query timeout
});

// Pool error handling
pool.on('error', (err) => {
  console.error('[DB Pool] ❌ Unexpected error on idle client:', err.message);
});

pool.on('connect', (client) => {
  console.log('[DB Pool] ✅ New client connected - Total:', pool.totalCount, 'Idle:', pool.idleCount, 'Waiting:', pool.waitingCount);
});

pool.on('remove', (client) => {
  console.log('[DB Pool] 🔄 Client removed - Total:', pool.totalCount, 'Idle:', pool.idleCount);
});

export const db = drizzle(pool, { schema });
export { pool };
