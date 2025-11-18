/**
 * Cache Service
 * 
 * Provides in-memory caching with Redis-compatible interface.
 * Can be easily swapped with Redis/Upstash for production.
 */

interface CacheEntry {
  value: string;
  expiresAt: number;
}

class CacheService {
  private cache: Map<string, CacheEntry>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.cache = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set value in cache with TTL (in seconds)
   */
  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    const expiresAt = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Delete specific key
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching pattern (simple glob support)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let validEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalKeys: this.cache.size,
      validEntries,
      expiredEntries,
      memoryUsage: process.memoryUsage().heapUsed
    };
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[Cache] Cleaned up ${removed} expired entries`);
    }
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// ============================================
// Redis Adapter (for production)
// ============================================

/**
 * Redis-based cache service (drop-in replacement)
 * 
 * Usage:
 * 1. Install: npm install redis
 * 2. Set REDIS_URL in .env
 * 3. Uncomment this class and export it instead
 */

/*
import { createClient } from 'redis';

class RedisCacheService {
  private client: ReturnType<typeof createClient>;
  private connected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => {
      console.error('[Redis] Error:', err);
      this.connected = false;
    });

    this.client.on('connect', () => {
      console.log('[Redis] Connected');
      this.connected = true;
    });

    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('[Redis] Connection failed:', error);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.connected) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('[Redis] Get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    if (!this.connected) return;
    try {
      await this.client.setEx(key, ttl, value);
    } catch (error) {
      console.error('[Redis] Set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.connected) return;
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('[Redis] Delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.connected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('[Redis] Invalidate pattern error:', error);
    }
  }

  async clear(): Promise<void> {
    if (!this.connected) return;
    try {
      await this.client.flushDb();
    } catch (error) {
      console.error('[Redis] Clear error:', error);
    }
  }

  async getStats() {
    if (!this.connected) return null;
    try {
      const info = await this.client.info('memory');
      return { info, connected: this.connected };
    } catch (error) {
      console.error('[Redis] Stats error:', error);
      return null;
    }
  }

  async destroy(): Promise<void> {
    if (this.connected) {
      await this.client.quit();
    }
  }
}
*/

// Export in-memory cache by default (swap with Redis for production)
export const cacheService = new CacheService();

// For production with Redis:
// export const cacheService = new RedisCacheService();
