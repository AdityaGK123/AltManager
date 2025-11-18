import { analyzeMomentPerformance, cleanOldDiagnostics } from '../services/diagnostics.service.js';
import { logger } from '../utils/logger.js';

/**
 * Automated Performance Intelligence
 * Analyzes moment performance and provides actionable recommendations
 */

let monitoringInterval: NodeJS.Timeout | null = null;
let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Analyze moments and log recommendations
 */
export async function analyzeMoments(): Promise<void> {
  try {
    const analysis = await analyzeMomentPerformance();
    
    if (analysis.slow.length > 0) {
      logger.warn(`[Performance Monitor] ${analysis.slow.length} slow moments detected`, {
        moments: analysis.slow.map(m => ({ slug: m.slug, avgMs: m.avgMs })),
      });
    }
    
    if (analysis.frequent_errors.length > 0) {
      logger.error(`[Performance Monitor] ${analysis.frequent_errors.length} moments with high error rates`, {
        moments: analysis.frequent_errors.map(m => ({ 
          slug: m.slug, 
          errors: m.errors, 
          successRate: m.successRate 
        })),
      });
    }
    
    if (analysis.recommendations.length > 0) {
      console.log('\n🔍 [Performance Monitor] Optimization Recommendations:');
      analysis.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
      console.log('');
    } else {
      logger.info('[Performance Monitor] All moments performing optimally');
    }
  } catch (error: any) {
    logger.error('[Performance Monitor] Analysis failed', { error: error.message });
  }
}

/**
 * Start performance monitoring
 */
export function startPerformanceMonitoring(intervalMs: number = 60000): void {
  if (monitoringInterval) {
    console.log('[Performance Monitor] Already running');
    return;
  }
  
  console.log(`🔍 [Performance Monitor] Starting (checks every ${intervalMs / 1000}s)`);
  
  // Run initial analysis after 10 seconds
  setTimeout(() => {
    analyzeMoments().catch(console.error);
  }, 10000);
  
  // Schedule periodic analysis
  monitoringInterval = setInterval(() => {
    analyzeMoments().catch(console.error);
  }, intervalMs);
  
  // Schedule daily cleanup at 2 AM
  const now = new Date();
  const tomorrow2AM = new Date(now);
  tomorrow2AM.setDate(tomorrow2AM.getDate() + 1);
  tomorrow2AM.setHours(2, 0, 0, 0);
  const msUntil2AM = tomorrow2AM.getTime() - now.getTime();
  
  setTimeout(() => {
    cleanOldDiagnostics().catch(console.error);
    
    // Then run daily
    cleanupInterval = setInterval(() => {
      cleanOldDiagnostics().catch(console.error);
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }, msUntil2AM);
  
  logger.info('[Performance Monitor] Started successfully');
}

/**
 * Stop performance monitoring
 */
export function stopPerformanceMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    logger.info('[Performance Monitor] Stopped');
  }
  
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

/**
 * Get monitoring status
 */
export function getMonitoringStatus(): {
  running: boolean;
  intervalMs: number;
} {
  return {
    running: monitoringInterval !== null,
    intervalMs: 60000,
  };
}
