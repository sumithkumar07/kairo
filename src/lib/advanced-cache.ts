import { performanceMonitor } from './performance-monitor';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  compress?: boolean; // Whether to compress stored data
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
  compressed?: boolean;
}

export class AdvancedCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = []; // For LRU eviction
  private maxSize: number;
  private defaultTTL: number;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0
  };

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
    
    // Clean up expired entries every 2 minutes
    setInterval(() => {
      this.cleanup();
    }, 2 * 60 * 1000);
  }

  public set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const entryTTL = ttl || this.defaultTTL;
    
    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.accessOrder = this.accessOrder.filter(k => k !== key);
    }

    // Add new entry
    this.cache.set(key, {
      value,
      timestamp: now,
      ttl: entryTTL,
      hits: 0
    });

    this.accessOrder.push(key);
    this.stats.sets++;

    // Evict oldest entries if cache is full
    while (this.cache.size > this.maxSize) {
      this.evictOldest();
    }
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      performanceMonitor.recordCacheMiss();
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      this.stats.misses++;
      performanceMonitor.recordCacheMiss();
      return null;
    }

    // Update access order and hit count
    entry.hits++;
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
    
    this.stats.hits++;
    performanceMonitor.recordCacheHit();
    
    return entry.value;
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      this.stats.deletes++;
    }
    
    return deleted;
  }

  public clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
  }

  private evictOldest(): void {
    if (this.accessOrder.length === 0) return;
    
    const oldestKey = this.accessOrder[0];
    this.cache.delete(oldestKey);
    this.accessOrder.shift();
    this.stats.evictions++;
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  public getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? Math.round((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100)
        : 0,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        hits: entry.hits,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl
      })).sort((a, b) => b.hits - a.hits).slice(0, 10) // Top 10 most accessed
    };
  }

  // Utility methods for common caching patterns
  public async getOrSet<R>(
    key: string, 
    factory: () => Promise<R>, 
    ttl?: number
  ): Promise<R> {
    const cached = this.get(key) as R;
    
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value as T, ttl);
    return value;
  }

  public memoize<Args extends any[], Return>(
    fn: (...args: Args) => Promise<Return>,
    keyGenerator?: (...args: Args) => string,
    ttl?: number
  ) {
    return async (...args: Args): Promise<Return> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      return this.getOrSet(key, () => fn(...args), ttl) as Promise<Return>;
    };
  }
}

// Global cache instances for different types of data
export const apiCache = new AdvancedCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 500
});

export const databaseCache = new AdvancedCache({
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 200
});

export const userCache = new AdvancedCache({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 1000
});

export const staticCache = new AdvancedCache({
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 100
});

// Cache warming functions
export async function warmCache(): Promise<void> {
  console.log('[CACHE] Starting cache warming...');
  
  try {
    // Warm up common API responses
    // This would be customized based on your most common API calls
    
    console.log('[CACHE] Cache warming completed');
  } catch (error) {
    console.error('[CACHE] Cache warming failed:', error);
  }
}