'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Database,
  Zap,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Cpu,
  HardDrive,
  Network,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Bell,
  Shield,
  Gauge,
  Timer,
  Server
} from 'lucide-react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PerformanceMetrics {
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

interface SystemHealth {
  database: boolean;
  cache: boolean;
  apis: boolean;
  overall: 'healthy' | 'warning' | 'critical';
  uptime: number;
}

export function EnhancedRealTimeDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<PerformanceMetrics[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [demoTestResults, setDemoTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch performance metrics
  const fetchMetrics = useCallback(async () => {
    if (!isMonitoring) return;

    try {
      const response = await fetch('/api/performance/metrics', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMetrics(data.data.current);
          setSystemHealth(data.data.systemHealth);
          setMetricsHistory(data.data.history || []);
          setRecommendations(data.data.recommendations || []);
          setLastUpdate(new Date());
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  }, [isMonitoring]);

  // Run demo tests
  const runDemoTests = useCallback(async () => {
    try {
      const response = await fetch('/api/demo/test', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      setDemoTestResults(data.data);
    } catch (error) {
      console.error('Failed to run demo tests:', error);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    fetchMetrics();
    runDemoTests();

    if (isMonitoring) {
      const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, runDemoTests, isMonitoring]);

  // Toggle monitoring
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  // Format uptime
  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Get status color
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get health badge variant
  const getHealthBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg">Loading performance dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Real-time Performance Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor system performance, health, and demo account status in real-time
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={isMonitoring ? 'default' : 'secondary'} className="flex items-center gap-2">
            <Activity className="h-3 w-3" />
            {isMonitoring ? 'Live' : 'Paused'}
          </Badge>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleMonitoring}
            className="flex items-center gap-2"
          >
            {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isMonitoring ? 'Pause' : 'Resume'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchMetrics}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Health Overview
            </CardTitle>
            <CardDescription>
              Overall system status and component health
              {lastUpdate && (
                <span className="ml-2 text-xs">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge variant={getHealthBadgeVariant(systemHealth.overall)} className="mb-2">
                  {systemHealth.overall.toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground">Overall Status</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {systemHealth.database ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Database</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {systemHealth.cache ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Cache Service</p>
              </div>
              
              <div className="text-center">
                <div className="mb-2">
                  <span className="text-lg font-bold">{formatUptime(systemHealth.uptime)}</span>
                </div>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                API Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-bold ${getStatusColor(metrics.apiResponseTime, { good: 50, warning: 100 })}`}>
                  {metrics.apiResponseTime}
                </span>
                <span className="text-sm text-muted-foreground mb-1">ms</span>
              </div>
              <Progress 
                value={Math.min(100, (metrics.apiResponseTime / 200) * 100)} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" />
                DB Query Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-bold ${getStatusColor(metrics.databaseQueryTime, { good: 25, warning: 50 })}`}>
                  {metrics.databaseQueryTime}
                </span>
                <span className="text-sm text-muted-foreground mb-1">ms</span>
              </div>
              <Progress 
                value={Math.min(100, (metrics.databaseQueryTime / 100) * 100)} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Cache Hit Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-green-600">
                  {metrics.cacheHitRate}
                </span>
                <span className="text-sm text-muted-foreground mb-1">%</span>
              </div>
              <Progress 
                value={metrics.cacheHitRate} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-bold ${getStatusColor(metrics.activeConnections, { good: 15, warning: 25 })}`}>
                  {metrics.activeConnections}
                </span>
                <span className="text-sm text-muted-foreground mb-1">/ 30</span>
              </div>
              <Progress 
                value={(metrics.activeConnections / 30) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Metrics Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="demo-tests">Demo Tests</TabsTrigger>
          <TabsTrigger value="recommendations">Insights</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {metricsHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Real-time performance metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricsHistory.slice(-20)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(time) => new Date(time).toLocaleTimeString().slice(0, -6)}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(time) => new Date(time).toLocaleTimeString()}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="apiResponseTime" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                        name="API Response (ms)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="databaseQueryTime" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.3}
                        name="DB Query (ms)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Memory Usage</span>
                      <span>{metrics.memoryUsage}%</span>
                    </div>
                    <Progress value={metrics.memoryUsage} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>CPU Usage</span>
                      <span>{metrics.cpuUsage}%</span>
                    </div>
                    <Progress value={metrics.cpuUsage} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Traffic Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Requests/Second</span>
                    <Badge variant="outline">{metrics.requestsPerSecond}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <Badge variant={metrics.errorRate > 5 ? "destructive" : "outline"}>
                      {metrics.errorRate}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="demo-tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Demo Account Tests
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={runDemoTests}
                  className="ml-auto"
                >
                  Run Tests
                </Button>
              </CardTitle>
              <CardDescription>
                Comprehensive testing of demo account functionality and system health
              </CardDescription>
            </CardHeader>
            <CardContent>
              {demoTestResults ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant={demoTestResults.overall === 'PASS' ? 'default' : 'destructive'}>
                      {demoTestResults.overall}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Completed in {demoTestResults.duration}ms
                    </span>
                  </div>

                  <div className="space-y-2">
                    {demoTestResults.tests.map((test: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {test.status === 'PASS' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">{test.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {test.duration && (
                            <span className="text-xs text-muted-foreground">{test.duration}ms</span>
                          )}
                          <Badge 
                            variant={test.status === 'PASS' ? 'outline' : 'destructive'}
                            className="text-xs"
                          >
                            {test.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Run Tests" to perform comprehensive demo account testing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Performance Insights & Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered recommendations to optimize system performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <Alert key={index}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{rec}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p>All systems are performing optimally!</p>
                  <p className="text-sm mt-2">No recommendations at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Database Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                {systemHealth && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Connection Status</span>
                      <Badge variant={systemHealth.database ? 'default' : 'destructive'}>
                        {systemHealth.database ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                    
                    {metrics && (
                      <>
                        <div className="flex items-center justify-between">
                          <span>Active Connections</span>
                          <span>{metrics.activeConnections} / 30</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>Query Response</span>
                          <span>{metrics.databaseQueryTime}ms</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Environment</span>
                    <Badge variant="outline">Development</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Cache TTL</span>
                    <span>15 minutes</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Max Connections</span>
                    <span>30</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Monitoring</span>
                    <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                      {isMonitoring ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}