export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  id: string;
}

export interface WebSocketConnection {
  id: string;
  userId?: string;
  lastPing: number;
  subscriptions: Set<string>;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private connections = new Map<string, WebSocketConnection>();
  private messageHandlers = new Map<string, (message: WebSocketMessage, connectionId: string) => void>();
  private subscriptions = new Map<string, Set<string>>(); // topic -> connection IDs

  private constructor() {
    // Clean up stale connections every 30 seconds
    setInterval(() => {
      this.cleanupConnections();
    }, 30000);
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public addConnection(connectionId: string, userId?: string): void {
    this.connections.set(connectionId, {
      id: connectionId,
      userId,
      lastPing: Date.now(),
      subscriptions: new Set()
    });

    console.log(`[WebSocket] Connection added: ${connectionId} (User: ${userId || 'anonymous'})`);
  }

  public removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Remove from all subscriptions
      connection.subscriptions.forEach(topic => {
        const topicConnections = this.subscriptions.get(topic);
        if (topicConnections) {
          topicConnections.delete(connectionId);
          if (topicConnections.size === 0) {
            this.subscriptions.delete(topic);
          }
        }
      });

      this.connections.delete(connectionId);
      console.log(`[WebSocket] Connection removed: ${connectionId}`);
    }
  }

  public handleMessage(connectionId: string, message: WebSocketMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      console.warn(`[WebSocket] Message from unknown connection: ${connectionId}`);
      return;
    }

    connection.lastPing = Date.now();

    // Handle built-in message types
    switch (message.type) {
      case 'ping':
        this.sendToConnection(connectionId, {
          type: 'pong',
          payload: { timestamp: Date.now() },
          timestamp: Date.now(),
          id: this.generateId()
        });
        break;

      case 'subscribe':
        this.handleSubscription(connectionId, message.payload.topic);
        break;

      case 'unsubscribe':
        this.handleUnsubscription(connectionId, message.payload.topic);
        break;

      default:
        // Handle custom message types
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
          handler(message, connectionId);
        } else {
          console.warn(`[WebSocket] Unknown message type: ${message.type}`);
        }
        break;
    }
  }

  public registerMessageHandler(
    type: string, 
    handler: (message: WebSocketMessage, connectionId: string) => void
  ): void {
    this.messageHandlers.set(type, handler);
  }

  public sendToConnection(connectionId: string, message: WebSocketMessage): boolean {
    // This would be implemented by the WebSocket server
    // For now, we'll just log the message
    console.log(`[WebSocket] Sending to ${connectionId}:`, message);
    return true;
  }

  public broadcastToTopic(topic: string, message: WebSocketMessage): void {
    const connections = this.subscriptions.get(topic);
    if (connections) {
      connections.forEach(connectionId => {
        this.sendToConnection(connectionId, message);
      });
    }
  }

  public broadcastToUser(userId: string, message: WebSocketMessage): void {
    this.connections.forEach((connection, connectionId) => {
      if (connection.userId === userId) {
        this.sendToConnection(connectionId, message);
      }
    });
  }

  public broadcastToAll(message: WebSocketMessage): void {
    this.connections.forEach((connection, connectionId) => {
      this.sendToConnection(connectionId, message);
    });
  }

  private handleSubscription(connectionId: string, topic: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.subscriptions.add(topic);

    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic)!.add(connectionId);

    console.log(`[WebSocket] Connection ${connectionId} subscribed to ${topic}`);

    // Send subscription confirmation
    this.sendToConnection(connectionId, {
      type: 'subscription_confirmed',
      payload: { topic },
      timestamp: Date.now(),
      id: this.generateId()
    });
  }

  private handleUnsubscription(connectionId: string, topic: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.subscriptions.delete(topic);

    const topicConnections = this.subscriptions.get(topic);
    if (topicConnections) {
      topicConnections.delete(connectionId);
      if (topicConnections.size === 0) {
        this.subscriptions.delete(topic);
      }
    }

    console.log(`[WebSocket] Connection ${connectionId} unsubscribed from ${topic}`);

    // Send unsubscription confirmation
    this.sendToConnection(connectionId, {
      type: 'unsubscription_confirmed',
      payload: { topic },
      timestamp: Date.now(),
      id: this.generateId()
    });
  }

  private cleanupConnections(): void {
    const now = Date.now();
    const timeout = 2 * 60 * 1000; // 2 minutes

    this.connections.forEach((connection, connectionId) => {
      if (now - connection.lastPing > timeout) {
        console.log(`[WebSocket] Cleaning up stale connection: ${connectionId}`);
        this.removeConnection(connectionId);
      }
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public getConnectionStats() {
    const stats = {
      totalConnections: this.connections.size,
      authenticatedConnections: 0,
      anonymousConnections: 0,
      totalSubscriptions: 0,
      topicStats: new Map<string, number>()
    };

    this.connections.forEach(connection => {
      if (connection.userId) {
        stats.authenticatedConnections++;
      } else {
        stats.anonymousConnections++;
      }
      stats.totalSubscriptions += connection.subscriptions.size;
    });

    this.subscriptions.forEach((connections, topic) => {
      stats.topicStats.set(topic, connections.size);
    });

    return stats;
  }
}

// Real-time data broadcasters
export class RealTimeDataBroadcaster {
  private wsManager: WebSocketManager;
  private broadcastIntervals = new Map<string, NodeJS.Timeout>();

  constructor() {
    this.wsManager = WebSocketManager.getInstance();
    this.setupBroadcasters();
  }

  private setupBroadcasters(): void {
    // Performance metrics broadcaster
    this.startBroadcast('performance_metrics', 30000, async () => {
      const { performanceMonitor } = await import('./performance-monitor');
      return {
        current: performanceMonitor.getCurrentMetrics(),
        health: performanceMonitor.getSystemHealth()
      };
    });

    // System stats broadcaster
    this.startBroadcast('system_stats', 60000, async () => {
      const { enhancedDb } = await import('./database-enhanced');
      return {
        database: await enhancedDb.enhancedHealthCheck(),
        timestamp: Date.now()
      };
    });

    // User activity broadcaster
    this.startBroadcast('user_activity', 120000, async () => {
      // This would get real user activity data
      return {
        activeUsers: this.wsManager.getConnectionStats().authenticatedConnections,
        totalConnections: this.wsManager.getConnectionStats().totalConnections,
        timestamp: Date.now()
      };
    });
  }

  private startBroadcast(
    topic: string, 
    interval: number, 
    dataGenerator: () => Promise<any>
  ): void {
    const broadcastData = async () => {
      try {
        const data = await dataGenerator();
        this.wsManager.broadcastToTopic(topic, {
          type: topic,
          payload: data,
          timestamp: Date.now(),
          id: this.generateId()
        });
      } catch (error) {
        console.error(`[Broadcaster] Error broadcasting ${topic}:`, error);
      }
    };

    // Initial broadcast
    broadcastData();

    // Set up interval
    const intervalId = setInterval(broadcastData, interval);
    this.broadcastIntervals.set(topic, intervalId);
  }

  public stopBroadcast(topic: string): void {
    const intervalId = this.broadcastIntervals.get(topic);
    if (intervalId) {
      clearInterval(intervalId);
      this.broadcastIntervals.delete(topic);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public destroy(): void {
    this.broadcastIntervals.forEach(intervalId => clearInterval(intervalId));
    this.broadcastIntervals.clear();
  }
}

export const wsManager = WebSocketManager.getInstance();
export const realTimeBroadcaster = new RealTimeDataBroadcaster();