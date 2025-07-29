import { Performance } from 'perf_hooks';

export interface PerformanceMetrics {
  timestamp: number;
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  activeConnections: number;
  cacheHitRate: number;
  errorRate: number;
  throughput: number;
}

export interface APIPerformanceData {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
  userAgent?: string;
  ipAddress?: string;
}

export class EnhancedPerformanceMonitor {
  private static instance: EnhancedPerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private apiMetrics: APIPerformanceData[] = [];
  private cacheStats = {
    hits: 0,
    misses: 0,
    total: 0
  };
  private errorCount = 0;
  private requestCount = 0;
  private startTime = Date.now();

  private constructor() {
    // Start collecting metrics every 30 seconds
    setInterval(() => {
      this.collectMetrics();
    }, 30000);

    // Clean up old metrics every 5 minutes
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 300000);
  }

  public static getInstance(): EnhancedPerformanceMonitor {
    if (!EnhancedPerformanceMonitor.instance) {
      EnhancedPerformanceMonitor.instance = new EnhancedPerformanceMonitor();
    }
    return EnhancedPerformanceMonitor.instance;
  }

  private async collectMetrics(): Promise<void> {
    try {
      const memoryUsage = process.memoryUsage();
      const now = Date.now();
      
      // Calculate CPU usage (simplified)
      const cpuUsage = process.cpuUsage();
      const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds

      const metric: PerformanceMetrics = {
        timestamp: now,
        responseTime: this.getAverageResponseTime(),
        memoryUsage,
        cpuUsage: cpuPercent,
        activeConnections: this.getActiveConnections(),
        cacheHitRate: this.getCacheHitRate(),
        errorRate: this.getErrorRate(),
        throughput: this.getThroughput()
      };

      this.metrics.push(metric);
      
      // Keep only last 100 metrics (50 minutes of data)
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100);
      }
    } catch (error) {
      console.error('[PERFORMANCE] Error collecting metrics:', error);
    }
  }

  public recordAPICall(data: APIPerformanceData): void {
    this.apiMetrics.push({
      ...data,
      timestamp: Date.now()
    });
    
    this.requestCount++;
    
    if (data.statusCode >= 400) {
      this.errorCount++;
    }

    // Keep only last 1000 API calls
    if (this.apiMetrics.length > 1000) {
      this.apiMetrics = this.apiMetrics.slice(-1000);
    }
  }

  public recordCacheHit(): void {
    this.cacheStats.hits++;
    this.cacheStats.total++;
  }

  public recordCacheMiss(): void {
    this.cacheStats.misses++;
    this.cacheStats.total++;
  }

  private getAverageResponseTime(): number {
    if (this.apiMetrics.length === 0) return 0;
    
    const recentMetrics = this.apiMetrics.slice(-50); // Last 50 requests
    const totalTime = recentMetrics.reduce((sum, metric) => sum + metric.responseTime, 0);
    return Math.round(totalTime / recentMetrics.length);
  }

  private getActiveConnections(): number {
    // This would normally come from your server instance
    // For now, return a calculated estimate
    return Math.max(1, Math.min(20, this.apiMetrics.filter(m => 
      Date.now() - m.timestamp < 60000 // Active in last minute
    ).length));
  }

  private getCacheHitRate(): number {
    if (this.cacheStats.total === 0) return 0;
    return Math.round((this.cacheStats.hits / this.cacheStats.total) * 100);
  }

  private getErrorRate(): number {
    if (this.requestCount === 0) return 0;
    return Math.round((this.errorCount / this.requestCount) * 100);
  }

  private getThroughput(): number {
    const timeRunning = (Date.now() - this.startTime) / 1000; // seconds
    return Math.round(this.requestCount / timeRunning * 60); // requests per minute
  }

  private cleanupOldMetrics(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.apiMetrics = this.apiMetrics.filter(m => m.timestamp > oneHourAgo);
  }

  public getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  public getMetricsHistory(minutes: number = 30): PerformanceMetrics[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  public getAPIMetrics(minutes: number = 30): APIPerformanceData[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.apiMetrics.filter(m => m.timestamp > cutoff);
  }

  public getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'critical';
    details: any;
    score: number;
  } {
    const current = this.getCurrentMetrics();
    if (!current) {
      return {
        status: 'critical',
        details: { error: 'No metrics available' },
        score: 0
      };
    }

    let score = 100;
    const issues: string[] = [];

    // Check response time (should be < 500ms for healthy)
    if (current.responseTime > 1000) {
      score -= 30;
      issues.push(`High response time: ${current.responseTime}ms`);
    } else if (current.responseTime > 500) {
      score -= 15;
      issues.push(`Moderate response time: ${current.responseTime}ms`);
    }

    // Check error rate (should be < 5% for healthy)
    if (current.errorRate > 10) {
      score -= 25;
      issues.push(`High error rate: ${current.errorRate}%`);
    } else if (current.errorRate > 5) {
      score -= 10;
      issues.push(`Moderate error rate: ${current.errorRate}%`);
    }

    // Check memory usage (should be < 80% for healthy)
    const memoryPercent = (current.memoryUsage.heapUsed / current.memoryUsage.heapTotal) * 100;
    if (memoryPercent > 90) {
      score -= 20;
      issues.push(`High memory usage: ${memoryPercent.toFixed(1)}%`);
    } else if (memoryPercent > 80) {
      score -= 10;
      issues.push(`Moderate memory usage: ${memoryPercent.toFixed(1)}%`);
    }

    // Check cache hit rate (should be > 70% for healthy)
    if (current.cacheHitRate < 50) {
      score -= 15;
      issues.push(`Low cache hit rate: ${current.cacheHitRate}%`);
    } else if (current.cacheHitRate < 70) {
      score -= 5;
      issues.push(`Moderate cache hit rate: ${current.cacheHitRate}%`);
    }

    const status = score >= 80 ? 'healthy' : score >= 60 ? 'degraded' : 'critical';

    return {
      status,
      score,
      details: {
        responseTime: `${current.responseTime}ms`,
        errorRate: `${current.errorRate}%`,
        memoryUsage: `${memoryPercent.toFixed(1)}%`,
        cacheHitRate: `${current.cacheHitRate}%`,
        throughput: `${current.throughput} req/min`,
        issues: issues.length > 0 ? issues : ['All systems operating normally'],
        lastUpdated: new Date(current.timestamp).toISOString()
      }
    };
  }

  public resetStats(): void {
    this.cacheStats = { hits: 0, misses: 0, total: 0 };
    this.errorCount = 0;
    this.requestCount = 0;
    this.startTime = Date.now();
    this.metrics = [];
    this.apiMetrics = [];
  }
}

// Middleware for automatic API performance tracking
export function withPerformanceTracking<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  endpoint: string,
  method: string = 'POST'
) {
  return async (...args: T): Promise<R> => {
    const start = performance.now();
    const monitor = EnhancedPerformanceMonitor.getInstance();
    
    try {
      const result = await fn(...args);
      const responseTime = Math.round(performance.now() - start);
      
      monitor.recordAPICall({
        endpoint,
        method,
        responseTime,
        statusCode: 200,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      const responseTime = Math.round(performance.now() - start);
      
      monitor.recordAPICall({
        endpoint,
        method,
        responseTime,
        statusCode: 500,
        timestamp: Date.now()
      });
      
      throw error;
    }
  };
}

export const performanceMonitor = EnhancedPerformanceMonitor.getInstance();