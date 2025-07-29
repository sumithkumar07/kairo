import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';
import { performanceMonitor } from '@/lib/performance-monitor';
import { cache } from '@/lib/cache';
import { db } from '@/lib/database';

// Real-time WebSocket handler for dashboard updates
class RealTimeDashboardServer {
  private static instance: RealTimeDashboardServer;
  private wss: WebSocketServer | null = null;
  private clients: Set<any> = new Set();
  private metricsInterval: NodeJS.Timeout | null = null;
  private healthInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): RealTimeDashboardServer {
    if (!RealTimeDashboardServer.instance) {
      RealTimeDashboardServer.instance = new RealTimeDashboardServer();
    }
    return RealTimeDashboardServer.instance;
  }

  public initialize(port: number = 8080): void {
    if (this.wss) return;

    this.wss = new WebSocketServer({ port });
    console.log(`[WEBSOCKET] Real-time dashboard server started on port ${port}`);

    this.wss.on('connection', (ws, request) => {
      console.log('[WEBSOCKET] New client connected');
      this.clients.add(ws);

      // Send initial data
      this.sendInitialData(ws);

      // Handle client messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('[WEBSOCKET] Invalid message format:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log('[WEBSOCKET] Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('[WEBSOCKET] Client error:', error);
        this.clients.delete(ws);
      });
    });

    // Start broadcasting metrics
    this.startMetricsBroadcast();
    this.startHealthMonitoring();
  }

  private async sendInitialData(ws: any): Promise<void> {
    try {
      const initialData = await this.gatherDashboardData();
      this.sendToClient(ws, {
        type: 'initial_data',
        data: initialData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[WEBSOCKET] Error sending initial data:', error);
    }
  }

  private handleClientMessage(ws: any, message: any): void {
    switch (message.type) {
      case 'subscribe':
        this.handleSubscription(ws, message.channels || []);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(ws, message.channels || []);
        break;
      case 'request_data':
        this.handleDataRequest(ws, message.dataType);
        break;
      case 'ping':
        this.sendToClient(ws, { type: 'pong', timestamp: new Date().toISOString() });
        break;
      default:
        console.warn('[WEBSOCKET] Unknown message type:', message.type);
    }
  }

  private handleSubscription(ws: any, channels: string[]): void {
    if (!ws.subscriptions) {
      ws.subscriptions = new Set();
    }
    channels.forEach(channel => ws.subscriptions.add(channel));
    
    this.sendToClient(ws, {
      type: 'subscription_confirmed',
      channels,
      timestamp: new Date().toISOString()
    });
  }

  private handleUnsubscription(ws: any, channels: string[]): void {
    if (ws.subscriptions) {
      channels.forEach(channel => ws.subscriptions.delete(channel));
    }
    
    this.sendToClient(ws, {
      type: 'unsubscription_confirmed',
      channels,
      timestamp: new Date().toISOString()
    });
  }

  private async handleDataRequest(ws: any, dataType: string): Promise<void> {
    try {
      let data;
      
      switch (dataType) {
        case 'performance_metrics':
          data = await this.getPerformanceMetrics();
          break;
        case 'system_health':
          data = await this.getSystemHealth();
          break;
        case 'cache_stats':
          data = await this.getCacheStats();
          break;
        case 'god_tier_status':
          data = await this.getGodTierStatus();
          break;
        default:
          data = { error: 'Unknown data type' };
      }

      this.sendToClient(ws, {
        type: 'data_response',
        dataType,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.sendToClient(ws, {
        type: 'error',
        message: 'Failed to fetch requested data',
        timestamp: new Date().toISOString()
      });
    }
  }

  private startMetricsBroadcast(): void {
    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.gatherRealTimeMetrics();
        this.broadcast({
          type: 'metrics_update',
          data: metrics,
          timestamp: new Date().toISOString()
        }, ['metrics', 'dashboard']);
      } catch (error) {
        console.error('[WEBSOCKET] Error broadcasting metrics:', error);
      }
    }, 5000); // Every 5 seconds
  }

  private startHealthMonitoring(): void {
    this.healthInterval = setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        
        // Only broadcast if health status changed or is critical
        if (health.status !== 'healthy' || Math.random() < 0.1) { // 10% chance for healthy status
          this.broadcast({
            type: 'health_update',
            data: health,
            timestamp: new Date().toISOString()
          }, ['health', 'dashboard']);
        }
      } catch (error) {
        console.error('[WEBSOCKET] Error monitoring health:', error);
      }
    }, 10000); // Every 10 seconds
  }

  private async gatherDashboardData(): Promise<any> {
    const [performance, health, cacheStats, godTierStatus] = await Promise.all([
      this.getPerformanceMetrics(),
      this.getSystemHealth(),
      this.getCacheStats(),
      this.getGodTierStatus()
    ]);

    return {
      performance,
      health,
      cache: cacheStats,
      godTier: godTierStatus,
      connectedClients: this.clients.size
    };
  }

  private async gatherRealTimeMetrics(): Promise<any> {
    const currentMetrics = performanceMonitor.getCurrentMetrics();
    const apiMetrics = performanceMonitor.getAPIMetrics(5); // Last 5 minutes
    
    return {
      current: currentMetrics,
      api_calls: {
        total_last_5_min: apiMetrics.length,
        average_response_time: apiMetrics.length > 0 
          ? apiMetrics.reduce((sum, m) => sum + m.responseTime, 0) / apiMetrics.length 
          : 0,
        error_count: apiMetrics.filter(m => m.statusCode >= 400).length
      },
      timestamp: new Date().toISOString()
    };
  }

  private async getPerformanceMetrics(): Promise<any> {
    const current = performanceMonitor.getCurrentMetrics();
    const history = performanceMonitor.getMetricsHistory(30); // Last 30 minutes
    
    return {
      current,
      history: history.slice(-10), // Last 10 data points
      trends: {
        response_time_trend: this.calculateTrend(history.map(h => h.responseTime)),
        memory_trend: this.calculateTrend(history.map(h => (h.memoryUsage.heapUsed / h.memoryUsage.heapTotal) * 100)),
        error_rate_trend: this.calculateTrend(history.map(h => h.errorRate))
      }
    };
  }

  private async getSystemHealth(): Promise<any> {
    const systemHealth = performanceMonitor.getSystemHealth();
    const dbHealth = await db.healthCheck();
    
    return {
      overall: systemHealth,
      database: dbHealth,
      services: {
        websocket: { status: 'healthy', clients: this.clients.size },
        cache: { status: 'healthy', hit_rate: cache.getStats().hitRate },
        api: { status: 'healthy', uptime: process.uptime() }
      }
    };
  }

  private async getCacheStats(): Promise<any> {
    const stats = cache.getStats();
    return {
      ...stats,
      performance_impact: this.calculateCachePerformanceImpact(stats),
      recommendations: this.generateCacheRecommendations(stats)
    };
  }

  private async getGodTierStatus(): Promise<any> {
    // Check status of God-tier features
    const features = [
      'quantum-simulation',
      'hipaa-compliance', 
      'reality-fabricator',
      'global-consciousness'
    ];

    const statusChecks = await Promise.allSettled(
      features.map(async (feature) => {
        try {
          const response = await fetch(`http://localhost:3000/api/god-tier/${feature}?limit=1`);
          return {
            feature,
            status: response.ok ? 'operational' : 'degraded',
            last_check: new Date().toISOString()
          };
        } catch (error) {
          return {
            feature,
            status: 'error',
            error: error.message,
            last_check: new Date().toISOString()
          };
        }
      })
    );

    return {
      features: statusChecks.map(result => 
        result.status === 'fulfilled' ? result.value : { 
          feature: 'unknown', 
          status: 'error', 
          error: 'Check failed' 
        }
      ),
      overall_status: statusChecks.every(r => 
        r.status === 'fulfilled' && r.value.status === 'operational'
      ) ? 'operational' : 'degraded'
    };
  }

  private calculateTrend(values: number[]): string {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, values.length);
    const older = values.slice(-6, -3).reduce((a, b) => a + b, 0) / Math.min(3, values.length);
    
    if (recent > older * 1.1) return 'increasing';
    if (recent < older * 0.9) return 'decreasing';
    return 'stable';
  }

  private calculateCachePerformanceImpact(stats: any): string {
    const hitRate = parseFloat(stats.hitRate);
    if (hitRate > 80) return 'excellent';
    if (hitRate > 60) return 'good';
    if (hitRate > 40) return 'moderate';
    return 'poor';
  }

  private generateCacheRecommendations(stats: any): string[] {
    const recommendations = [];
    const hitRate = parseFloat(stats.hitRate);
    
    if (hitRate < 70) {
      recommendations.push('Consider increasing cache TTL for frequently accessed data');
    }
    if (stats.size > stats.maxSize * 0.9) {
      recommendations.push('Cache is near capacity - consider increasing max size');
    }
    if (stats.expiredItems > stats.size * 0.3) {
      recommendations.push('High expiration rate - review TTL settings');
    }
    
    return recommendations;
  }

  private sendToClient(ws: any, message: any): void {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(JSON.stringify(message));
    }
  }

  private broadcast(message: any, channels: string[] = []): void {
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        // Check if client is subscribed to any of the channels
        if (channels.length === 0 || !client.subscriptions || 
            channels.some(channel => client.subscriptions.has(channel))) {
          client.send(JSON.stringify(message));
        }
      }
    });
  }

  public getStats(): any {
    return {
      connected_clients: this.clients.size,
      server_status: this.wss ? 'running' : 'stopped',
      uptime: process.uptime()
    };
  }

  public shutdown(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
    }

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    this.clients.clear();
    console.log('[WEBSOCKET] Real-time dashboard server shutdown');
  }
}

// Initialize WebSocket server
const realtimeServer = RealTimeDashboardServer.getInstance();

// Start server on port 8080
if (process.env.WEBSOCKET_ENABLED === 'true') {
  realtimeServer.initialize(8080);
}

export { RealTimeDashboardServer, realtimeServer };