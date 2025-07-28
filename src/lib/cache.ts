// Enhanced Caching System for Performance Optimization
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

class KairoCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 1000;
  private cleanupInterval: NodeJS.Timeout;
  
  constructor() {
    // Cleanup expired items every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 min default
    // If cache is full, remove oldest least-used items
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Increment hit counter
    item.hits++;
    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    console.log(`[CACHE] Cleaned up ${keysToDelete.length} expired items. Cache size: ${this.cache.size}`);
  }

  private evictOldest(): void {
    // Find the oldest, least-used item
    let oldestKey = '';
    let oldestScore = Infinity;

    for (const [key, item] of this.cache.entries()) {
      // Score based on age and usage (lower is older/less used)
      const score = item.hits * 1000 + (Date.now() - item.timestamp);
      if (score < oldestScore) {
        oldestScore = score;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getStats() {
    const now = Date.now();
    let totalHits = 0;
    let expiredItems = 0;

    for (const [_, item] of this.cache.entries()) {
      totalHits += item.hits;
      if (now - item.timestamp > item.ttl) {
        expiredItems++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
      expiredItems,
      hitRate: this.cache.size > 0 ? (totalHits / this.cache.size).toFixed(2) : '0.00',
      memoryUsage: `${Math.round(this.cache.size * 0.001)}KB`
    };
  }

  // Specific cache methods for common use cases
  cacheApiResponse(endpoint: string, params: any, response: any, ttl: number = 300000): void {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    this.set(key, response, ttl);
  }

  getCachedApiResponse(endpoint: string, params: any): any | null {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return this.get(key);
  }

  cacheUserData(userId: string, data: any, ttl: number = 600000): void { // 10 min
    const key = `user:${userId}`;
    this.set(key, data, ttl);
  }

  getCachedUserData(userId: string): any | null {
    const key = `user:${userId}`;
    return this.get(key);
  }

  cacheWorkflowData(workflowId: string, data: any, ttl: number = 1800000): void { // 30 min
    const key = `workflow:${workflowId}`;
    this.set(key, data, ttl);
  }

  getCachedWorkflowData(workflowId: string): any | null {
    const key = `workflow:${workflowId}`;
    return this.get(key);
  }

  // Quantum simulation specific caching
  cacheQuantumSimulation(workflowData: any, result: any, ttl: number = 900000): void { // 15 min
    const key = `quantum:${JSON.stringify(workflowData).substring(0, 100)}`;
    this.set(key, result, ttl);
  }

  getCachedQuantumSimulation(workflowData: any): any | null {
    const key = `quantum:${JSON.stringify(workflowData).substring(0, 100)}`;
    return this.get(key);
  }

  // HIPAA compliance specific caching
  cacheHipaaCompliance(workflowData: any, result: any, ttl: number = 1800000): void { // 30 min
    const key = `hipaa:${JSON.stringify(workflowData).substring(0, 100)}`;
    this.set(key, result, ttl);
  }

  getCachedHipaaCompliance(workflowData: any): any | null {
    const key = `hipaa:${JSON.stringify(workflowData).substring(0, 100)}`;
    return this.get(key);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Singleton instance
export const cache = new KairoCache();

// Cache warming for frequently accessed data
export async function warmCache(): Promise<void> {
  console.log('[CACHE] Starting cache warming...');
  
  try {
    // Warm up common quantum simulation scenarios
    const commonScenarios = [
      { nodes: [{ type: 'api', id: 'node1' }] },
      { nodes: [{ type: 'database', id: 'node1' }, { type: 'email', id: 'node2' }] },
      { nodes: [{ type: 'webhook', id: 'node1' }, { type: 'ai', id: 'node2' }, { type: 'integration', id: 'node3' }] }
    ];
    
    // Pre-cache these scenarios
    commonScenarios.forEach((scenario, index) => {
      cache.cacheQuantumSimulation(scenario, {
        prewarmed: true,
        scenario_id: `common_${index}`,
        cached_at: new Date().toISOString()
      }, 3600000); // 1 hour
    });
    
    console.log('[CACHE] Cache warming completed');
  } catch (error) {
    console.error('[CACHE] Error warming cache:', error);
  }
}

// Health check for cache
export function getCacheHealth(): any {
  return {
    status: 'healthy',
    stats: cache.getStats(),
    timestamp: new Date().toISOString()
  };
}