// Enhanced WebSocket Manager for Real-time Dashboard Updates
import { performanceMonitor, PerformanceMetrics, SystemHealth } from './real-time-performance';

export type WebSocketEventType = 
  | 'performance-update'
  | 'system-health'
  | 'workflow-update'
  | 'user-activity'
  | 'cache-status'
  | 'error-alert';

export interface WebSocketMessage {
  type: WebSocketEventType;
  data: any;
  timestamp: Date;
  userId?: string;
}

class EnhancedWebSocketManager {
  private static instance: EnhancedWebSocketManager;
  private connections: Map<string, WebSocket> = new Map();
  private messageQueue: Map<string, WebSocketMessage[]> = new Map();
  private isServer = typeof window === 'undefined';

  static getInstance(): EnhancedWebSocketManager {
    if (!EnhancedWebSocketManager.instance) {
      EnhancedWebSocketManager.instance = new EnhancedWebSocketManager();
    }
    return EnhancedWebSocketManager.instance;
  }

  // Client-side connection management
  connect(userId: string, onMessage?: (message: WebSocketMessage) => void): Promise<WebSocket> {
    if (this.isServer) {
      throw new Error('WebSocket connections can only be created on the client side');
    }

    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(`ws://localhost:3001/ws?userId=${userId}`);
        
        ws.onopen = () => {
          console.log('[WebSocket] Connected for user:', userId);
          this.connections.set(userId, ws);
          
          // Send any queued messages
          const queuedMessages = this.messageQueue.get(userId) || [];
          queuedMessages.forEach(message => {
            ws.send(JSON.stringify(message));
          });
          this.messageQueue.delete(userId);
          
          resolve(ws);
        };

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            if (onMessage) {
              onMessage(message);
            }
            this.handleMessage(userId, message);
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        };

        ws.onclose = () => {
          console.log('[WebSocket] Connection closed for user:', userId);
          this.connections.delete(userId);
        };

        ws.onerror = (error) => {
          console.error('[WebSocket] Connection error:', error);
          this.connections.delete(userId);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(userId: string): void {
    const ws = this.connections.get(userId);
    if (ws) {
      ws.close();
      this.connections.delete(userId);
    }
  }

  // Send message to specific user
  sendToUser(userId: string, type: WebSocketEventType, data: any): void {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: new Date(),
      userId
    };

    const ws = this.connections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      // Queue message for when user connects
      const queue = this.messageQueue.get(userId) || [];
      queue.push(message);
      this.messageQueue.set(userId, queue);
    }
  }

  // Broadcast to all connected users
  broadcast(type: WebSocketEventType, data: any): void {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: new Date()
    };

    this.connections.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  // Handle incoming messages
  private handleMessage(userId: string, message: WebSocketMessage): void {
    switch (message.type) {
      case 'performance-update':
        // Handle performance metric updates
        break;
      case 'system-health':
        // Handle system health updates
        break;
      case 'workflow-update':
        // Handle workflow status updates
        break;
      default:
        console.log(`[WebSocket] Unhandled message type: ${message.type}`);
    }
  }

  // Start real-time performance broadcasting
  startPerformanceBroadcast(): void {
    // Subscribe to performance updates
    performanceMonitor.subscribe((metrics: PerformanceMetrics) => {
      this.broadcast('performance-update', metrics);
    });

    // Broadcast system health every 30 seconds
    setInterval(async () => {
      const health = await performanceMonitor.getSystemHealth();
      this.broadcast('system-health', health);
    }, 30000);
  }

  // Get connection statistics
  getConnectionStats(): {
    totalConnections: number;
    activeConnections: number;
    queuedMessages: number;
  } {
    const activeConnections = Array.from(this.connections.values())
      .filter(ws => ws.readyState === WebSocket.OPEN).length;

    const queuedMessages = Array.from(this.messageQueue.values())
      .reduce((total, queue) => total + queue.length, 0);

    return {
      totalConnections: this.connections.size,
      activeConnections,
      queuedMessages
    };
  }

  // Cleanup old connections and queued messages
  cleanup(): void {
    // Remove closed connections
    this.connections.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        this.connections.delete(userId);
      }
    });

    // Clear old queued messages (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.messageQueue.forEach((queue, userId) => {
      const filteredQueue = queue.filter(msg => msg.timestamp > oneHourAgo);
      if (filteredQueue.length === 0) {
        this.messageQueue.delete(userId);
      } else {
        this.messageQueue.set(userId, filteredQueue);
      }
    });
  }
}

// Client-side React hook for WebSocket connectivity
export function useWebSocket(userId: string) {
  if (typeof window === 'undefined') {
    return {
      connect: () => Promise.resolve(null),
      disconnect: () => {},
      send: () => {},
      isConnected: false
    };
  }

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const wsManager = EnhancedWebSocketManager.getInstance();

  const connect = useCallback(async () => {
    try {
      await wsManager.connect(userId, (message) => {
        setMessages(prev => [...prev.slice(-99), message]); // Keep last 100 messages
      });
      setIsConnected(true);
    } catch (error) {
      console.error('[WebSocket Hook] Connection failed:', error);
      setIsConnected(false);
    }
  }, [userId]);

  const disconnect = useCallback(() => {
    wsManager.disconnect(userId);
    setIsConnected(false);
  }, [userId]);

  const send = useCallback((type: WebSocketEventType, data: any) => {
    wsManager.sendToUser(userId, type, data);
  }, [userId]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    send,
    isConnected,
    messages
  };
}

export const webSocketManager = EnhancedWebSocketManager.getInstance();

// Client-side imports only
let useState: any, useCallback: any, useEffect: any;
if (typeof window !== 'undefined') {
  const React = require('react');
  useState = React.useState;
  useCallback = React.useCallback;
  useEffect = React.useEffect;
}