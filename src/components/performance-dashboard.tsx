'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Database, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Server,
  BarChart3,
  Gauge,
  Eye,
  Settings,
  Trash2
} from 'lucide-react';

interface PerformanceData {
  timestamp: number;
  systemHealth: {
    status: 'healthy' | 'degraded' | 'critical';
    score: number;
    details: any;
  };
  currentMetrics: any;
  trends: any;
  cacheStats: any;
  recommendations?: string[];
}

export function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  const fetchPerformanceData = async (detailed: boolean = false) => {
    try {
      const response = await fetch(`/api/performance?detailed=${detailed}&range=30`);
      if (response.ok) {
        const perfData = await response.json();
        setData(perfData);
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData(true);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchPerformanceData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleAction = async (action: string) => {
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        await fetchPerformanceData(true);
      }
    } catch (error) {
      console.error(`Failed to execute ${action}:`, error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-blue-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading performance metrics...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Performance Data Unavailable</h3>
          <p className="text-muted-foreground">Unable to load performance metrics</p>
          <Button onClick={() => fetchPerformanceData(true)} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">Real-time system performance and optimization insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Activity className="h-4 w-4 mr-2" />
              {autoRefresh ? 'Auto' : 'Manual'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPerformanceData(true)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(data.systemHealth.status)}
              <div>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Overall system performance score: {data.systemHealth.score}/100
                </CardDescription>
              </div>
            </div>
            
            <Badge 
              variant={data.systemHealth.status === 'healthy' ? 'default' : 'destructive'}
              className="text-lg px-4 py-2"
            >
              {data.systemHealth.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <Progress 
              value={data.systemHealth.score} 
              className={`h-3 ${getStatusColor(data.systemHealth.status)}`}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-sm font-medium">Response Time</div>
                <div className="text-lg font-bold">{data.systemHealth.details.responseTime}</div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <div className="text-sm font-medium">Error Rate</div>
                <div className="text-lg font-bold">{data.systemHealth.details.errorRate}</div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Database className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-sm font-medium">Cache Hit Rate</div>
                <div className="text-lg font-bold">{data.systemHealth.details.cacheHitRate}</div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Zap className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-sm font-medium">Throughput</div>
                <div className="text-lg font-bold">{data.systemHealth.details.throughput}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Current Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.currentMetrics && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm">{data.currentMetrics.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm">
                        {Math.round((data.currentMetrics.memoryUsage.heapUsed / 1024 / 1024))} MB
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Connections</span>
                      <span className="text-sm">{data.currentMetrics.activeConnections}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Throughput</span>
                      <span className="text-sm">{data.currentMetrics.throughput} req/min</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  System Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.systemHealth.details.issues.map((issue: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                      <Info className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span className="text-sm">{issue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(data.cacheStats).map(([cacheType, stats]: [string, any]) => (
              <Card key={cacheType}>
                <CardHeader>
                  <CardTitle className="capitalize">{cacheType} Cache</CardTitle>
                  <CardDescription>Hit rate: {stats.hitRate}%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={stats.hitRate} className="h-2" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Hits</div>
                        <div className="text-muted-foreground">{stats.hits}</div>
                      </div>
                      <div>
                        <div className="font-medium">Misses</div>
                        <div className="text-muted-foreground">{stats.misses}</div>
                      </div>
                      <div>
                        <div className="font-medium">Size</div>
                        <div className="text-muted-foreground">{stats.size}/{stats.maxSize}</div>
                      </div>
                      <div>
                        <div className="font-medium">Evictions</div>
                        <div className="text-muted-foreground">{stats.evictions || 0}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(data.trends).map(([metric, trend]: [string, any]) => (
              <Card key={metric}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium capitalize">
                        {metric.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getTrendIcon(trend)}
                        <span className="text-sm capitalize text-muted-foreground">
                          {trend}
                        </span>
                      </div>
                    </div>
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Performance Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Performance Actions
                </CardTitle>
                <CardDescription>
                  Actions to optimize system performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleAction('clear-cache')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Caches
                </Button>
                
                <Button 
                  onClick={() => handleAction('warm-cache')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Warm Cache
                </Button>
                
                <Button 
                  onClick={() => handleAction('reset')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Performance Stats
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Auto-Refresh Settings
                </CardTitle>
                <CardDescription>
                  Configure automatic data refresh
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto Refresh</span>
                  <Button
                    variant={autoRefresh ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    {autoRefresh ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                
                {autoRefresh && (
                  <div>
                    <label className="text-sm font-medium">Refresh Interval</label>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="w-full mt-2 p-2 border rounded-md"
                    >
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={300}>5 minutes</option>
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}