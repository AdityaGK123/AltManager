import { analysisAPI } from './api';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

/**
 * Exponential backoff delay calculation
 */
function getRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = Math.min(
    config.baseDelay * Math.pow(2, attempt),
    config.maxDelay
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Retry wrapper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  attempt: number = 0
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Don't retry on 4xx errors (client errors)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      throw error;
    }

    if (attempt >= config.maxRetries) {
      console.error(`[Analytics Trigger] Max retries (${config.maxRetries}) reached`);
      throw error;
    }

    const delay = getRetryDelay(attempt, config);
    console.log(`[Analytics Trigger] Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, config, attempt + 1);
  }
}

/**
 * Auto-trigger analytics generation after chat completion
 * Runs in background without blocking UI
 */
export async function autoGenerateAnalytics(): Promise<void> {
  console.log('[Analytics Trigger] Starting auto-generation...');

  // Run all analytics generation in parallel with Promise.allSettled
  // This ensures one failure doesn't block others
  const results = await Promise.allSettled([
    retryWithBackoff(() => analysisAPI.generateTrends()),
    retryWithBackoff(() => analysisAPI.generateBlindspots()),
    retryWithBackoff(() => analysisAPI.generateProgress()),
  ]);

  // Log results
  results.forEach((result, index) => {
    const names = ['Trends', 'Blindspots', 'Progress'];
    if (result.status === 'fulfilled') {
      console.log(`[Analytics Trigger] ✅ ${names[index]} analysis generated successfully`);
    } else {
      console.error(`[Analytics Trigger] ❌ ${names[index]} analysis failed:`, result.reason?.message);
    }
  });

  // Check if at least one succeeded
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  console.log(`[Analytics Trigger] Completed: ${successCount}/3 analyses generated`);

  if (successCount === 0) {
    throw new Error('All analytics generation failed');
  }
}

/**
 * Generate a single analysis type with retry
 */
export async function generateSingleAnalysis(
  type: 'trends' | 'blindspots' | 'progress'
): Promise<any> {
  console.log(`[Analytics Trigger] Generating ${type} analysis...`);

  const apiCall = {
    trends: () => analysisAPI.generateTrends(),
    blindspots: () => analysisAPI.generateBlindspots(),
    progress: () => analysisAPI.generateProgress(),
  }[type];

  try {
    const result = await retryWithBackoff(apiCall);
    console.log(`[Analytics Trigger] ✅ ${type} analysis generated successfully`);
    return result;
  } catch (error: any) {
    console.error(`[Analytics Trigger] ❌ ${type} analysis failed:`, error.message);
    throw error;
  }
}

/**
 * Check if analytics data exists
 */
export async function checkAnalyticsAvailability(): Promise<{
  trends: boolean;
  blindspots: boolean;
  progress: boolean;
}> {
  const results = await Promise.allSettled([
    analysisAPI.getLatestTrends(),
    analysisAPI.getLatestBlindspots(),
    analysisAPI.getLatestProgress(),
  ]);

  return {
    trends: results[0].status === 'fulfilled' && !!results[0].value?.data,
    blindspots: results[1].status === 'fulfilled' && !!results[1].value?.data,
    progress: results[2].status === 'fulfilled' && !!results[2].value?.data,
  };
}
