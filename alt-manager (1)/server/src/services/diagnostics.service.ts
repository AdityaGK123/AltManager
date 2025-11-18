import { db } from '../db/index.js';
import { momentDiagnostics } from '../db/schema.js';
import { sql, desc, eq } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

/**
 * Self-Monitoring Diagnostics Service
 * Tracks API performance, errors, and provides actionable insights
 */

export interface DiagnosticEntry {
  slug: string;
  endpoint: string;
  status: 'success' | 'error' | 'timeout' | 'retry';
  durationMs: number;
  errorMessage?: string;
  userId?: number;
  metadata?: any;
}

export interface DiagnosticSummary {
  slug: string;
  endpoint: string;
  totalCalls: number;
  avgMs: number;
  errors: number;
  successRate: number;
  slowestMs: number;
  fastestMs: number;
}

/**
 * Log a moment diagnostic entry
 */
export async function logMomentDiagnostic(entry: DiagnosticEntry): Promise<void> {
  try {
    await db.insert(momentDiagnostics).values({
      slug: entry.slug,
      endpoint: entry.endpoint,
      status: entry.status,
      durationMs: entry.durationMs,
      errorMessage: entry.errorMessage,
      userId: entry.userId,
      metadata: entry.metadata,
    });
    
    // Log slow requests
    if (entry.durationMs > 1000) {
      logger.warn(`[Diagnostics] Slow moment request: ${entry.slug} (${entry.durationMs}ms)`, {
        endpoint: entry.endpoint,
        status: entry.status,
      });
    }
    
    // Log errors
    if (entry.status === 'error') {
      logger.error(`[Diagnostics] Moment error: ${entry.slug}`, {
        endpoint: entry.endpoint,
        error: entry.errorMessage,
        duration: entry.durationMs,
      });
    }
  } catch (error: any) {
    // Don't fail the request if diagnostics logging fails
    console.error('[Diagnostics] Failed to log diagnostic:', error.message);
  }
}

/**
 * Get diagnostics summary for all moments
 */
export async function getDiagnosticsSummary(limit: number = 50): Promise<DiagnosticSummary[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        slug,
        endpoint,
        COUNT(*)::INT AS total_calls,
        ROUND(AVG(duration_ms))::INT AS avg_ms,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END)::INT AS errors,
        ROUND((SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100))::INT AS success_rate,
        MAX(duration_ms)::INT AS slowest_ms,
        MIN(duration_ms)::INT AS fastest_ms
      FROM moment_diagnostics
      WHERE logged_at > NOW() - INTERVAL '24 hours'
      GROUP BY slug, endpoint
      ORDER BY errors DESC, avg_ms DESC
      LIMIT ${limit}
    `);
    
    return result.rows as any[];
  } catch (error: any) {
    logger.error('[Diagnostics] Failed to get summary', { error: error.message });
    return [];
  }
}

/**
 * Get diagnostics for a specific moment
 */
export async function getMomentDiagnostics(slug: string, limit: number = 100): Promise<any[]> {
  try {
    const diagnostics = await db
      .select()
      .from(momentDiagnostics)
      .where(eq(momentDiagnostics.slug, slug))
      .orderBy(desc(momentDiagnostics.loggedAt))
      .limit(limit);
    
    return diagnostics;
  } catch (error: any) {
    logger.error('[Diagnostics] Failed to get moment diagnostics', { slug, error: error.message });
    return [];
  }
}

/**
 * Analyze performance and detect issues
 */
export async function analyzeMomentPerformance(): Promise<{
  slow: DiagnosticSummary[];
  frequent_errors: DiagnosticSummary[];
  recommendations: string[];
}> {
  const summary = await getDiagnosticsSummary(100);
  
  const slow = summary.filter(s => s.avgMs > 800);
  const frequentErrors = summary.filter(s => s.errors > 2 || s.successRate < 90);
  
  const recommendations: string[] = [];
  
  if (slow.length > 0) {
    recommendations.push(`${slow.length} moments have avg response time > 800ms. Consider caching or optimization.`);
  }
  
  if (frequentErrors.length > 0) {
    recommendations.push(`${frequentErrors.length} moments have high error rates. Check data seeding and error handling.`);
  }
  
  const totalCalls = summary.reduce((sum, s) => sum + s.totalCalls, 0);
  const totalErrors = summary.reduce((sum, s) => sum + s.errors, 0);
  const overallErrorRate = totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0;
  
  if (overallErrorRate > 5) {
    recommendations.push(`Overall error rate is ${overallErrorRate.toFixed(1)}%. Target should be < 1%.`);
  }
  
  return {
    slow,
    frequent_errors: frequentErrors,
    recommendations,
  };
}

/**
 * Clean old diagnostic logs (keep last 7 days)
 */
export async function cleanOldDiagnostics(): Promise<number> {
  try {
    const result = await db.execute(sql`
      DELETE FROM moment_diagnostics
      WHERE logged_at < NOW() - INTERVAL '7 days'
    `);
    
    const deleted = (result as any).rowCount || 0;
    if (deleted > 0) {
      logger.info(`[Diagnostics] Cleaned ${deleted} old diagnostic entries`);
    }
    
    return deleted;
  } catch (error: any) {
    logger.error('[Diagnostics] Failed to clean old diagnostics', { error: error.message });
    return 0;
  }
}

/**
 * Get real-time health metrics
 */
export async function getHealthMetrics(): Promise<{
  last_hour: {
    total_requests: number;
    errors: number;
    avg_response_ms: number;
    error_rate: number;
  };
  last_24_hours: {
    total_requests: number;
    errors: number;
    avg_response_ms: number;
    error_rate: number;
  };
}> {
  try {
    const hourResult = await db.execute(sql`
      SELECT 
        COUNT(*)::INT AS total_requests,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END)::INT AS errors,
        ROUND(AVG(duration_ms))::INT AS avg_response_ms
      FROM moment_diagnostics
      WHERE logged_at > NOW() - INTERVAL '1 hour'
    `);
    
    const dayResult = await db.execute(sql`
      SELECT 
        COUNT(*)::INT AS total_requests,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END)::INT AS errors,
        ROUND(AVG(duration_ms))::INT AS avg_response_ms
      FROM moment_diagnostics
      WHERE logged_at > NOW() - INTERVAL '24 hours'
    `);
    
    const hourData = hourResult.rows[0] as any;
    const dayData = dayResult.rows[0] as any;
    
    return {
      last_hour: {
        total_requests: hourData.total_requests || 0,
        errors: hourData.errors || 0,
        avg_response_ms: hourData.avg_response_ms || 0,
        error_rate: hourData.total_requests > 0 
          ? Math.round((hourData.errors / hourData.total_requests) * 100) 
          : 0,
      },
      last_24_hours: {
        total_requests: dayData.total_requests || 0,
        errors: dayData.errors || 0,
        avg_response_ms: dayData.avg_response_ms || 0,
        error_rate: dayData.total_requests > 0 
          ? Math.round((dayData.errors / dayData.total_requests) * 100) 
          : 0,
      },
    };
  } catch (error: any) {
    logger.error('[Diagnostics] Failed to get health metrics', { error: error.message });
    return {
      last_hour: { total_requests: 0, errors: 0, avg_response_ms: 0, error_rate: 0 },
      last_24_hours: { total_requests: 0, errors: 0, avg_response_ms: 0, error_rate: 0 },
    };
  }
}
