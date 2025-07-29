'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Users, 
  Server, 
  Database, 
  Wifi, 
  WifiOff,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Pause,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  id: string;
}

interface RealTimeMetrics {
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  throughput: number;
  systemHealth: {
    status: 'healthy' | 'degraded' | 'critical';
    score: number;
  };
}

export function RealTimeDashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [history, setHistory] = useState<Array<RealTimeMetrics & { timestamp: number }>>([]);
  const [connectionStats, setConnectionStats] = useState({
    totalConnections: 0,
    authenticatedConnections: 0,
    uptime: 0
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connectWebSocket = () => {
    try {
      // In a real implementation, this would connect to your WebSocket server
      // For demo purposes, we'll simulate the connection
      console.log('[WebSocket] Attempting to connect...');
      
      // Simulate connection success after 1 second
      setTimeout(() => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        console.log('[WebSocket] Connected successfully');
        
        // Start simulating real-time data
        startDataSimulation();
      }, 1000);

    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      handleReconnect();
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  const handleReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current++;
      connectWebSocket();
    }, delay);
  };

  const startDataSimulation = () => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      if (!isConnected || isPaused) return;

      const newMetrics: RealTimeMetrics = {
        responseTime: Math.random() * 500 + 100,
        errorRate: Math.random() * 5,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        throughput: Math.floor(Math.random() * 200) + 100,
        systemHealth: {
          status: Math.random() > 0.8 ? 'degraded' : 'healthy',
          score: Math.floor(Math.random() * 30) + 70
        }
      };

      setMetrics(newMetrics);
      
      const timestampedMetrics = {
        ...newMetrics,
        timestamp: Date.now()
      };

      setHistory(prev => {
        const updated = [...prev, timestampedMetrics].slice(-50); // Keep last 50 points
        return updated;
      });

      setConnectionStats(prev => ({
        ...prev,
        totalConnections: Math.floor(Math.random() * 20) + 10,
        authenticatedConnections: Math.floor(Math.random() * 15) + 5,
        uptime: prev.uptime + 5
      }));

    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      disconnectWebSocket();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Activity;
    }
  };

  const formatChartData = () => {
    return history.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString(),
      responseTime: Math.round(item.responseTime),
      errorRate: item.errorRate.toFixed(1),
      activeUsers: item.activeUsers,
      throughput: item.throughput
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Real-Time Dashboard</h2>
          <p className="text-muted-foreground">Live system monitoring and analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            disabled={!isConnected}
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              disconnectWebSocket();
              setTimeout(connectWebSocket, 1000);
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <h4 className="font-semibold">Connection Lost</h4>
                <p className="text-sm text-muted-foreground">
                  Attempting to reconnect... (Attempt {reconnectAttempts.current} of {maxReconnectAttempts})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-Time Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                  <div className="text-2xl font-bold">
                    {Math.round(metrics.responseTime)}ms
                  </div>
                  {history.length > 1 && (
                    <div className="flex items-center gap-1 mt-1">
                      {metrics.responseTime > history[history.length - 2]?.responseTime ? (
                        <TrendingUp className="h-3 w-3 text-red-500" />
                      ) : metrics.responseTime < history[history.length - 2]?.responseTime ? (
                        <TrendingDown className="h-3 w-3 text-green-500" />
                      ) : (
                        <Minus className="h-3 w-3 text-blue-500" />
                      )}
                      <span className="text-xs text-muted-foreground">vs last update</span>
                    </div>
                  )}
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <div className="text-2xl font-bold">{metrics.activeUsers}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Eye className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-muted-foreground">{connectionStats.authenticatedConnections} authenticated</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Throughput</p>
                  <div className="text-2xl font-bold">{metrics.throughput}/min</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Activity className="h-3 w-3 text-purple-500" />
                    <span className="text-xs text-muted-foreground">requests per minute</span>
                  </div>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Health</p>
                  <div className="text-2xl font-bold">{metrics.systemHealth.score}/100</div>
                  <div className="flex items-center gap-1 mt-1">
                    {(() => {
                      const StatusIcon = getStatusIcon(metrics.systemHealth.status);
                      return <StatusIcon className={`h-3 w-3 ${getStatusColor(metrics.systemHealth.status)}`} />;
                    })()}
                    <span className={`text-xs font-medium ${getStatusColor(metrics.systemHealth.status)}`}>
                      {metrics.systemHealth.status}
                    </span>
                  </div>
                </div>
                <Server className={`h-8 w-8 ${getStatusColor(metrics.systemHealth.status)}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-Time Charts */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trend</CardTitle>
              <CardDescription>Last 50 updates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={formatChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
              <CardDescription>Real-time user activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={formatChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="#10b981" 
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Statistics</CardTitle>
            <CardDescription>WebSocket connection overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Connections</span>
              <Badge variant="secondary">{connectionStats.totalConnections}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Authenticated</span>
              <Badge variant="default">{connectionStats.authenticatedConnections}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Anonymous</span>
              <Badge variant="outline">
                {connectionStats.totalConnections - connectionStats.authenticatedConnections}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Uptime</span>
              <span className="text-sm text-muted-foreground">
                {Math.floor(connectionStats.uptime / 60)}m {connectionStats.uptime % 60}s
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Current system performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Time</span>
                    <span>{Math.round(metrics.responseTime)}ms</span>
                  </div>
                  <Progress value={Math.min(100, (metrics.responseTime / 1000) * 100)} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Error Rate</span>
                    <span>{metrics.errorRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.errorRate} className="bg-red-100" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>System Health</span>
                    <span>{metrics.systemHealth.score}/100</span>
                  </div>
                  <Progress value={metrics.systemHealth.score} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}