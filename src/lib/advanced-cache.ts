'use client';

// Advanced caching utilities for better performance

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

class AdvancedCache {
  private cache = new Map<string, CacheItem<any>>();
  private cleanupInterval?: NodeJS.Timeout;

  constructor(cleanupIntervalMs = 60000) { // Clean up every minute
    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, cleanupIntervalMs);
    }
  }

  // Set item with TTL (time to live in milliseconds)
  set<T>(key: string, data: T, ttl = 300000): void { // Default 5 minutes
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    };

    this.cache.set(key, item);
  }

  // Get item from cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // Get or set pattern - if item doesn't exist or is expired, execute fn and cache result
  async getOrSet<T>(
    key: string, 
    fn: () => Promise<T> | T, 
    ttl = 300000
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fn();
    this.set(key, data, ttl);
    return data;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Delete specific key
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Clear cache by pattern
  clearPattern(pattern: string): number {
    let cleared = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    return cleared;
  }

  // Get cache stats
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const item of this.cache.values()) {
      if (now - item.timestamp > item.ttl) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
      hits: this.hitCount,
      misses: this.missCount,
    };
  }

  private hitCount = 0;
  private missCount = 0;

  // Override get method to track hits/misses
  private trackingGet<T>(key: string): T | null {
    const result = this.get<T>(key);
    
    if (result !== null) {
      this.hitCount++;
    } else {
      this.missCount++;
    }

    return result;
  }

  // Clean up expired items
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Destroy cache and cleanup
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Specialized caches for different data types
class APICache extends AdvancedCache {
  constructor() {
    super(30000); // Clean up every 30 seconds for API data
  }

  // Cache API response with automatic key generation
  async cacheAPICall<T>(
    url: string,
    options: RequestInit = {},
    ttl = 300000 // 5 minutes default for API calls
  ): Promise<T> {
    const key = `api:${url}:${JSON.stringify(options)}`;
    
    return this.getOrSet(key, async () => {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }
      
      return response.json();
    }, ttl);
  }
}

class ComponentCache extends AdvancedCache {
  constructor() {
    super(120000); // Clean up every 2 minutes for component data
  }

  // Cache component props or computed values
  cacheComponentData<T>(
    componentName: string,
    props: Record<string, any>,
    computeFn: () => T,
    ttl = 60000 // 1 minute default for component data
  ): T {
    const key = `component:${componentName}:${JSON.stringify(props)}`;
    
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = computeFn();
    this.set(key, result, ttl);
    return result;
  }
}

class AssetCache extends AdvancedCache {
  constructor() {
    super(300000); // Clean up every 5 minutes for assets
  }

  // Cache images and other assets
  async cacheAsset(url: string, ttl = 3600000): Promise<string> { // 1 hour default
    const key = `asset:${url}`;
    
    return this.getOrSet(key, async () => {
      const response = await fetch(url);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }, ttl);
  }
}

// Global cache instances
export const apiCache = new APICache();
export const componentCache = new ComponentCache();
export const assetCache = new AssetCache();
export const globalCache = new AdvancedCache();

// Utility functions for easier cache usage
export function withCache<T>(
  key: string,
  fn: () => T,
  ttl?: number
): T {
  const cached = globalCache.get<T>(key);
  
  if (cached !== null) {
    return cached;
  }

  const result = fn();
  globalCache.set(key, result, ttl);
  return result;
}

export async function withAsyncCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return globalCache.getOrSet(key, fn, ttl);
}

// React hooks for cache usage
export function useCachedData<T>(
  key: string,
  fn: () => T,
  ttl?: number,
  deps: any[] = []
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoKey = `${key}:${JSON.stringify(deps)}`;
  
  return withCache(memoKey, fn, ttl);
}

export function useCachedAsyncData<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number,
  deps: any[] = []
): Promise<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoKey = `${key}:${JSON.stringify(deps)}`;
  
  return withAsyncCache(memoKey, fn, ttl);
}

// Cache warming utility
export function warmCache(entries: Array<{ key: string; fn: () => any; ttl?: number }>) {
  entries.forEach(({ key, fn, ttl }) => {
    if (!globalCache.has(key)) {
      try {
        const result = fn();
        globalCache.set(key, result, ttl);
      } catch (error) {
        console.warn(`Failed to warm cache for key: ${key}`, error);
      }
    }
  });
}

// Cleanup all caches on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    apiCache.destroy();
    componentCache.destroy();
    assetCache.destroy();
    globalCache.destroy();
  });
}