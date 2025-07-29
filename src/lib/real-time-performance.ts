// Enhanced Real-time Performance Monitoring System
import { db } from './database';

export interface PerformanceMetrics {
  apiResponseTime: number;
  databaseQueryTime: number;
  cacheHitRate: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  requestsPerSecond: number;
  errorRate: number;
  timestamp: Date;
}

export interface SystemHealth {
  database: boolean;
  cache: boolean;
  apis: boolean;
  overall: 'healthy' | 'warning' | 'critical';
  uptime: number;
}

class RealTimePerformanceMonitor {
  private static instance: RealTimePerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private subscribers: ((metrics: PerformanceMetrics) => void)[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private requestCount = 0;
  private errorCount = 0;
  private startTime = Date.now();

  static getInstance(): RealTimePerformanceMonitor {
    if (!RealTimePerformanceMonitor.instance) {
      RealTimePerformanceMonitor.instance = new RealTimePerformanceMonitor();
    }
    return RealTimePerformanceMonitor.instance;
  }

  startMonitoring(intervalMs = 5000): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      const metrics = await this.collectMetrics();
      this.metrics.push(metrics);
      
      // Keep only last 100 metrics
      if (this.metrics.length > 100) {
        this.metrics.shift();
      }

      // Notify all subscribers
      this.subscribers.forEach(callback => callback(metrics));
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  recordRequest(): void {
    this.requestCount++;
  }

  recordError(): void {
    this.errorCount++;
  }

  private async collectMetrics(): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    
    // Test database performance
    let dbQueryTime = 0;
    try {
      const dbStart = Date.now();
      await db.query('SELECT 1');
      dbQueryTime = Date.now() - dbStart;
    } catch (error) {
      dbQueryTime = -1; // Error indicator
    }

    // Simulate API response time measurement
    const apiResponseTime = Math.random() * 50 + 10; // 10-60ms simulation

    // Cache hit rate simulation (in real app, track actual cache hits)
    const cacheHitRate = Math.random() * 40 + 60; // 60-100% simulation

    // System resource usage (simplified)
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    // Calculate requests per second (last minute)
    const now = Date.now();
    const requestsPerSecond = this.requestCount / ((now - this.startTime) / 1000);

    // Calculate error rate
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

    const poolStats = db.getPoolStats();

    return {
      apiResponseTime: Math.round(apiResponseTime),
      databaseQueryTime: dbQueryTime,
      cacheHitRate: Math.round(cacheHitRate * 10) / 10,
      activeConnections: poolStats.activeCount,
      memoryUsage: Math.round(memoryPercent * 10) / 10,
      cpuUsage: Math.random() * 30 + 10, // Simulated CPU usage
      requestsPerSecond: Math.round(requestsPerSecond * 10) / 10,
      errorRate: Math.round(errorRate * 100) / 100,
      timestamp: new Date()
    };
  }

  async getSystemHealth(): Promise<SystemHealth> {
    try {
      // Test database health
      const dbHealth = await db.healthCheck();
      const databaseHealthy = dbHealth.healthy;

      // Test cache health (simplified)
      const cacheHealthy = true;

      // Test APIs health (simplified)
      const apisHealthy = true;

      const uptime = (Date.now() - this.startTime) / 1000;

      let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (!databaseHealthy) {
        overall = 'critical';
      } else if (!cacheHealthy || !apisHealthy) {
        overall = 'warning';
      }

      return {
        database: databaseHealthy,
        cache: cacheHealthy,
        apis: apisHealthy,
        overall,
        uptime: Math.round(uptime)
      };
    } catch (error) {
      return {
        database: false,
        cache: false,
        apis: false,
        overall: 'critical',
        uptime: (Date.now() - this.startTime) / 1000
      };
    }
  }

  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getMetricsHistory(limit = 50): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  getAverageMetrics(minutes = 5): Partial<PerformanceMetrics> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    if (recentMetrics.length === 0) return {};

    const sum = recentMetrics.reduce((acc, metrics) => ({
      apiResponseTime: acc.apiResponseTime + metrics.apiResponseTime,
      databaseQueryTime: acc.databaseQueryTime + metrics.databaseQueryTime,
      cacheHitRate: acc.cacheHitRate + metrics.cacheHitRate,
      memoryUsage: acc.memoryUsage + metrics.memoryUsage,
      cpuUsage: acc.cpuUsage + metrics.cpuUsage,
      requestsPerSecond: acc.requestsPerSecond + metrics.requestsPerSecond,
      errorRate: acc.errorRate + metrics.errorRate
    }), {
      apiResponseTime: 0,
      databaseQueryTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      requestsPerSecond: 0,
      errorRate: 0
    });

    const count = recentMetrics.length;
    return {
      apiResponseTime: Math.round(sum.apiResponseTime / count),
      databaseQueryTime: Math.round(sum.databaseQueryTime / count),
      cacheHitRate: Math.round((sum.cacheHitRate / count) * 10) / 10,
      memoryUsage: Math.round((sum.memoryUsage / count) * 10) / 10,
      cpuUsage: Math.round((sum.cpuUsage / count) * 10) / 10,
      requestsPerSecond: Math.round((sum.requestsPerSecond / count) * 10) / 10,
      errorRate: Math.round((sum.errorRate / count) * 100) / 100
    };
  }

  // Performance optimization recommendations
  getOptimizationRecommendations(): string[] {
    const latest = this.getLatestMetrics();
    if (!latest) return [];

    const recommendations: string[] = [];

    if (latest.apiResponseTime > 100) {
      recommendations.push('API response time is high. Consider optimizing queries or adding caching.');
    }

    if (latest.databaseQueryTime > 50) {
      recommendations.push('Database queries are slow. Check indexes and query optimization.');
    }

    if (latest.cacheHitRate < 80) {
      recommendations.push('Cache hit rate is low. Review caching strategy and TTL settings.');
    }

    if (latest.memoryUsage > 85) {
      recommendations.push('Memory usage is high. Consider optimizing memory allocation.');
    }

    if (latest.errorRate > 5) {
      recommendations.push('Error rate is elevated. Review error handling and system stability.');
    }

    if (latest.activeConnections > 25) {
      recommendations.push('High database connection usage. Consider connection pooling optimization.');
    }

    return recommendations;
  }
}

export const performanceMonitor = RealTimePerformanceMonitor.getInstance();