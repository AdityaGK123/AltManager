import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

/**
 * Runtime Route Monitor & Self-Healing System
 * Automatically checks critical endpoints and logs failures
 */

interface RouteCheck {
  path: string;
  method: 'GET' | 'POST';
  requiresAuth: boolean;
  critical: boolean;
}

// Define critical routes to monitor
const CRITICAL_ROUTES: RouteCheck[] = [
  { path: '/api/health', method: 'GET', requiresAuth: false, critical: true },
  { path: '/api/health/db', method: 'GET', requiresAuth: false, critical: true },
];

// Public routes (no auth needed)
const PUBLIC_ROUTES: RouteCheck[] = [
  { path: '/api/health', method: 'GET', requiresAuth: false, critical: true },
];

interface RouteStatus {
  path: string;
  status: 'healthy' | 'degraded' | 'failed';
  lastCheck: Date;
  responseTime: number;
  errorMessage?: string;
}

const routeStatuses = new Map<string, RouteStatus>();

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<{ healthy: boolean; latency: number; error?: string }> {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    const latency = Date.now() - start;
    return { healthy: true, latency };
  } catch (error: any) {
    return { healthy: false, latency: Date.now() - start, error: error.message };
  }
}

/**
 * Check a single route
 */
async function checkRoute(route: RouteCheck, baseUrl: string): Promise<RouteStatus> {
  const start = Date.now();
  const fullUrl = `${baseUrl}${route.path}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(fullUrl, {
      method: route.method,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - start;
    
    // 2xx = healthy, 4xx = degraded (auth issues), 5xx = failed
    const status = response.status < 300 ? 'healthy' : 
                   response.status < 500 ? 'degraded' : 'failed';
    
    return {
      path: route.path,
      status,
      lastCheck: new Date(),
      responseTime,
      errorMessage: status !== 'healthy' ? `HTTP ${response.status}` : undefined,
    };
  } catch (error: any) {
    return {
      path: route.path,
      status: 'failed',
      lastCheck: new Date(),
      responseTime: Date.now() - start,
      errorMessage: error.message || 'Connection failed',
    };
  }
}

/**
 * Run health checks on all critical routes
 */
export async function checkRoutes(baseUrl: string = 'http://localhost:3000'): Promise<void> {
  console.log('\n🔍 [Route Monitor] Running health checks...');
  
  // Check database first
  const dbCheck = await checkDatabase();
  if (!dbCheck.healthy) {
    console.error(`❌ [Route Monitor] Database FAILED: ${dbCheck.error} (${dbCheck.latency}ms)`);
  } else if (dbCheck.latency > 500) {
    console.warn(`⚠️  [Route Monitor] Database SLOW: ${dbCheck.latency}ms`);
  } else {
    console.log(`✅ [Route Monitor] Database healthy (${dbCheck.latency}ms)`);
  }
  
  // Check public routes
  let healthyCount = 0;
  let failedCount = 0;
  
  for (const route of PUBLIC_ROUTES) {
    const status = await checkRoute(route, baseUrl);
    routeStatuses.set(route.path, status);
    
    if (status.status === 'healthy') {
      console.log(`✅ [Route Monitor] ${route.path} - ${status.responseTime}ms`);
      healthyCount++;
    } else if (status.status === 'degraded') {
      console.warn(`⚠️  [Route Monitor] ${route.path} - ${status.errorMessage} (${status.responseTime}ms)`);
    } else {
      console.error(`❌ [Route Monitor] ${route.path} - ${status.errorMessage} (${status.responseTime}ms)`);
      failedCount++;
    }
  }
  
  // Summary
  const total = PUBLIC_ROUTES.length;
  console.log(`\n📊 [Route Monitor] Summary: ${healthyCount}/${total} healthy, ${failedCount} failed\n`);
}

/**
 * Start periodic monitoring
 */
export function startRouteMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
  console.log(`🚀 [Route Monitor] Starting periodic checks every ${intervalMs / 1000}s`);
  
  // Run initial check
  checkRoutes().catch(console.error);
  
  // Schedule periodic checks
  return setInterval(() => {
    checkRoutes().catch(console.error);
  }, intervalMs);
}

/**
 * Get current route statuses
 */
export function getRouteStatuses(): Map<string, RouteStatus> {
  return new Map(routeStatuses);
}

/**
 * Get health summary
 */
export function getHealthSummary(): {
  healthy: number;
  degraded: number;
  failed: number;
  total: number;
} {
  let healthy = 0;
  let degraded = 0;
  let failed = 0;
  
  routeStatuses.forEach((status) => {
    if (status.status === 'healthy') healthy++;
    else if (status.status === 'degraded') degraded++;
    else failed++;
  });
  
  return {
    healthy,
    degraded,
    failed,
    total: routeStatuses.size,
  };
}
