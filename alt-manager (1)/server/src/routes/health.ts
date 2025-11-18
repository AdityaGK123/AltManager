import { Router } from 'express';
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';
import { aiService } from '../services/ai.service.js';
import os from 'os';

const router = Router();
const startTime = Date.now();

// Comprehensive health check endpoint
router.get('/health', async (req, res) => {
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbLatency = Date.now() - dbStart;
    
    // Check critical tables
    const tableChecks: Record<string, boolean> = {};
    const criticalTables = ['users', 'manager_moments', 'conversations'];
    
    for (const table of criticalTables) {
      try {
        await db.execute(sql`SELECT 1 FROM ${sql.identifier(table)} LIMIT 1`);
        tableChecks[table] = true;
      } catch (err) {
        tableChecks[table] = false;
      }
    }
    
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const memUsage = process.memoryUsage();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${uptime}s`,
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`,
        tables: tableChecks
      },
      ai: {
        mode: aiService.getAPIKeyType() === 'makersuite' ? 'MakerSuite (Free)' : 'Google Cloud (Paid)',
        model: aiService.getModelName()
      },
      system: {
        memory: {
          used: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
        },
        cpu: os.cpus().length,
        platform: os.platform()
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Database health check
router.get('/health/db', async (req, res) => {
  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    const latency = Date.now() - start;
    
    res.json({
      status: 'ok',
      latency: `${latency}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Database connection failed'
    });
  }
});

export default router;
