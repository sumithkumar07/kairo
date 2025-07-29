'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedLoadingState, EnhancedErrorHandler } from '@/components/ui/enhanced-ui';
import { 
  Activity, 
  Zap, 
  Database, 
  Wifi, 
  WifiOff, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  Monitor,
  AlertCircle,
  CheckCircle,
  Brain,
  Shield,
  Radio,
  Globe
} from 'lucide-react';

interface RealTimeDashboardProps {
  wsUrl?: string;
  refreshInterval?: number;
  autoReconnect?: boolean;
}

interface SystemMetrics {
  current?: {
    responseTime: number;
    memoryUsage: any;
    cpuUsage: number;
    cacheHitRate: number;
    errorRate: number;
    throughput: number;
  };
  api_calls?: {
    total_last_5_min: number;
    average_response_time: number;
    error_count: number;
  };
  timestamp: string;
}

interface SystemHealth {
  overall: {
    status: 'healthy' | 'degraded' | 'critical';
    score: number;
    details: any;
  };
  database: {
    healthy: boolean;
    details: any;
  };
  services: {
    websocket: { status: string; clients: number };
    cache: { status: string; hit_rate: string };
    api: { status: string; uptime: number };
  };
}

export const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({
  wsUrl = 'ws://localhost:8080',
  refreshInterval = 5000,
  autoReconnect = true
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [godTierStatus, setGodTierStatus] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const connectWebSocket = useCallback(() => {
    try {
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('[REAL-TIME] WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
        
        // Subscribe to all channels
        websocket.send(JSON.stringify({
          type: 'subscribe',
          channels: ['metrics', 'health', 'dashboard']
        }));
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
          setLastUpdate(new Date());
        } catch (error) {
          console.error('[REAL-TIME] Error parsing message:', error);
        }
      };

      websocket.onclose = () => {
        console.log('[REAL-TIME] WebSocket disconnected');
        setIsConnected(false);
        
        if (autoReconnect && reconnectAttempts < 5) {
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, Math.pow(2, reconnectAttempts) * 1000); // Exponential backoff
        }
      };

      websocket.onerror = (error) => {
        console.error('[REAL-TIME] WebSocket error:', error);
        setConnectionError('WebSocket connection failed');
      };

      setWs(websocket);
    } catch (error) {
      console.error('[REAL-TIME] Error creating WebSocket:', error);
      setConnectionError('Failed to create WebSocket connection');
    }
  }, [wsUrl, autoReconnect, reconnectAttempts]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'initial_data':
        setMetrics(data.data.performance);
        setHealth(data.data.health);
        setCacheStats(data.data.cache);
        setGodTierStatus(data.data.godTier);
        break;
      case 'metrics_update':
        setMetrics(data.data);
        break;
      case 'health_update':
        setHealth(data.data);
        break;
      case 'cache_update':
        setCacheStats(data.data);
        break;
      case 'god_tier_update':
        setGodTierStatus(data.data);
        break;
      case 'error':
        console.error('[REAL-TIME] Server error:', data.message);
        break;
    }
  };

  const requestData = (dataType: string) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify({
        type: 'request_data',
        dataType
      }));
    }
  };

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connectWebSocket]);

  // Fallback polling if WebSocket fails
  useEffect(() => {
    if (!isConnected && !ws) {
      const interval = setInterval(async () => {
        try {
          const [metricsRes, healthRes] = await Promise.all([
            fetch('/api/performance/cache-status'),
            fetch('/api/performance/system-health')
          ]);
          
          if (metricsRes.ok) {
            const metricsData = await metricsRes.json();
            setMetrics(metricsData.performance_metrics || null);
            setCacheStats(metricsData.cache_performance || null);
          }
          
          if (healthRes.ok) {
            const healthData = await healthRes.json();
            setHealth(healthData);
          }
          
          setLastUpdate(new Date());
        } catch (error) {
          console.error('[REAL-TIME] Fallback polling error:', error);
        }
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [isConnected, ws, refreshInterval]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (connectionError && !isConnected) {
    return (
      <div className="p-6">
        <EnhancedErrorHandler
          error={connectionError}
          type="network"
          onRetry={connectWebSocket}
          retryCount={reconnectAttempts}
          maxRetries={5}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Real-Time Dashboard
            </span>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge className={getStatusColor('healthy')}>
                  <Wifi className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge className={getStatusColor('error')}>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Disconnected
                </Badge>
              )}
              {lastUpdate && (
                <span className="text-xs text-muted-foreground">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* System Health Overview */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Overall Status</span>
                  <Badge className={getStatusColor(health.overall.status)}>
                    {health.overall.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Health Score</span>
                    <span>{health.overall.score}/100</span>
                  </div>
                  <Progress value={health.overall.score} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <Badge className={getStatusColor(health.database.healthy ? 'healthy' : 'error')}>
                    {health.database.healthy ? 'Healthy' : 'Error'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Response: {health.database.details.responseTime}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(health.services).map(([service, data]: [string, any]) => (
                  <div key={service} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{service}</span>
                    <Badge className={getStatusColor(data.status)} size="sm">
                      {data.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && metrics.current && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {metrics.current.responseTime}ms
                </span>
                {getTrendIcon('stable')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {Math.round((metrics.current.memoryUsage.heapUsed / metrics.current.memoryUsage.heapTotal) * 100)}%
                </div>
                <Progress 
                  value={(metrics.current.memoryUsage.heapUsed / metrics.current.memoryUsage.heapTotal) * 100} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cache Hit Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {metrics.current.cacheHitRate}%
                </span>
                {getTrendIcon('stable')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {metrics.current.errorRate}%
                </span>
                {getTrendIcon(metrics.current.errorRate > 5 ? 'increasing' : 'stable')}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* God-Tier Features Status */}
      {godTierStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              God-Tier Features Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {godTierStatus.features?.map((feature: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium capitalize">
                      {feature.feature.replace('-', ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {feature.last_check}
                    </div>
                  </div>
                  <Badge className={getStatusColor(feature.status)} size="sm">
                    {feature.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Metrics */}
      {metrics?.api_calls && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              API Performance (Last 5 Minutes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.api_calls.total_last_5_min}
                </div>
                <div className="text-sm text-muted-foreground">Total Calls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(metrics.api_calls.average_response_time)}ms
                </div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {metrics.api_calls.error_count}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            if (isConnected) {
              requestData('performance_metrics');
              requestData('system_health');
            } else {
              connectWebSocket();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {isConnected ? 'Refresh Data' : 'Reconnect'}
        </button>
      </div>
    </div>
  );
};