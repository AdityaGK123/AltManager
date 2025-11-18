import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

/**
 * Database Health Check & Auto-Recovery Middleware
 * Ensures database is available before processing requests
 */

let lastDbCheck = Date.now();
let dbHealthy = true;
const CHECK_INTERVAL = 5000; // Check every 5 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

/**
 * Check database connectivity
 */
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    if (!dbHealthy) {
      logger.info('✅ Database connection restored');
      dbHealthy = true;
    }
    return true;
  } catch (error: any) {
    if (dbHealthy) {
      logger.error('❌ Database connection lost', { error: error.message });
      dbHealthy = false;
    }
    return false;
  }
}

/**
 * Attempt to reconnect to database
 */
async function attemptReconnect(retries: number = MAX_RETRIES): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    logger.warn(`🔄 Attempting database reconnection (${i + 1}/${retries})...`);
    
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    
    const healthy = await checkDatabaseHealth();
    if (healthy) {
      logger.info('✅ Database reconnection successful');
      return true;
    }
  }
  
  logger.error('❌ Database reconnection failed after all retries');
  return false;
}

/**
 * Database health check middleware
 */
export async function dbHealthCheckMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Skip health check endpoint to avoid recursion
  if (req.path === '/api/health' || req.path === '/api/health/db') {
    return next();
  }
  
  const now = Date.now();
  
  // Only check periodically to avoid overhead
  if (now - lastDbCheck > CHECK_INTERVAL) {
    lastDbCheck = now;
    const healthy = await checkDatabaseHealth();
    
    if (!healthy) {
      // Attempt immediate reconnection
      const reconnected = await attemptReconnect(1);
      
      if (!reconnected) {
        res.status(503).json({
          error: 'Database temporarily unavailable',
          message: 'The system is attempting to reconnect. Please try again in a moment.',
          retryAfter: 5,
        });
        return;
      }
    }
  }
  
  // If we know DB is unhealthy, return error immediately
  if (!dbHealthy) {
    res.status(503).json({
      error: 'Database unavailable',
      message: 'The system is experiencing connectivity issues. Please try again shortly.',
      retryAfter: 5,
    });
    return;
  }
  
  next();
}

/**
 * Get current database health status
 */
export function getDatabaseHealthStatus(): {
  healthy: boolean;
  lastCheck: Date;
} {
  return {
    healthy: dbHealthy,
    lastCheck: new Date(lastDbCheck),
  };
}

/**
 * Force database health check
 */
export async function forceDatabaseHealthCheck(): Promise<boolean> {
  lastDbCheck = Date.now();
  return await checkDatabaseHealth();
}
