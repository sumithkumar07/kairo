'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Database, 
  Server, 
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Gauge,
  Zap,
  Network,
  MemoryStick,
  ThermometerSun,
  Globe,
  Shield,
  AlertCircle,
  Info,
  Play,
  Pause,
  Settings,
  Download,
  Eye,
  BarChart3,
  LineChart
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    current: number;
    average: number;
    peak: number;
    cores: number;
    temperature: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  memory: {
    current: number;
    average: number;
    peak: number;
    total: number;
    available: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  disk: {
    current: number;
    average: number;
    peak: number;
    total: number;
    available: number;
    iops: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  network: {
    latency: number;
    throughput: number;
    packetsIn: number;
    packetsOut: number;
    errors: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  database: {
    connections: number;
    maxConnections: number;
    activeQueries: number;
    avgResponseTime: number;
    slowQueries: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  application: {
    uptime: number;
    requestsPerSecond: number;
    errorRate: number;
    responseTime: number;
    activeUsers: number;
    status: 'healthy' | 'warning' | 'critical';
  };
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  metric: string;
  message: string;
  timestamp: Date;
  value: number;
  threshold: number;
  resolved: boolean;
}

interface AdvancedPerformanceMonitorProps {
  className?: string;
}

export function AdvancedPerformanceMonitor({ className }: AdvancedPerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: {
      current: 42,
      average: 38,
      peak: 78,
      cores: 8,
      temperature: 65,
      status: 'healthy'
    },
    memory: {
      current: 68,
      average: 65,
      peak: 89,
      total: 32,
      available: 10.2,
      status: 'healthy'
    },
    disk: {
      current: 23,
      average: 25,
      peak: 45,
      total: 500,
      available: 385,
      iops: 1250,
      status: 'healthy'
    },
    network: {
      latency: 45,
      throughput: 125,
      packetsIn: 1247,
      packetsOut: 1156,
      errors: 2,
      status: 'healthy'
    },
    database: {
      connections: 15,
      maxConnections: 100,
      activeQueries: 8,
      avgResponseTime: 12,
      slowQueries: 1,
      status: 'healthy'
    },
    application: {
      uptime: 99.98,
      requestsPerSecond: 324,
      errorRate: 0.02,
      responseTime: 189,
      activeUsers: 156,
      status: 'healthy'
    }
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('5');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulate real-time metrics updates
      setMetrics(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          current: Math.max(0, Math.min(100, prev.cpu.current + (Math.random() - 0.5) * 10)),
          temperature: Math.max(40, Math.min(90, prev.cpu.temperature + (Math.random() - 0.5) * 5))
        },
        memory: {
          ...prev.memory,
          current: Math.max(0, Math.min(100, prev.memory.current + (Math.random() - 0.5) * 8))
        },
        disk: {
          ...prev.disk,
          current: Math.max(0, Math.min(100, prev.disk.current + (Math.random() - 0.5) * 3)),
          iops: Math.max(0, prev.disk.iops + Math.floor((Math.random() - 0.5) * 200))
        },
        network: {
          ...prev.network,
          latency: Math.max(10, Math.min(200, prev.network.latency + (Math.random() - 0.5) * 10)),
          throughput: Math.max(50, Math.min(1000, prev.network.throughput + (Math.random() - 0.5) * 50))
        },
        database: {
          ...prev.database,
          connections: Math.max(0, Math.min(100, prev.database.connections + Math.floor((Math.random() - 0.5) * 4))),
          activeQueries: Math.max(0, Math.min(50, prev.database.activeQueries + Math.floor((Math.random() - 0.5) * 3))),
          avgResponseTime: Math.max(5, Math.min(100, prev.database.avgResponseTime + (Math.random() - 0.5) * 5))
        },
        application: {
          ...prev.application,
          requestsPerSecond: Math.max(0, prev.application.requestsPerSecond + Math.floor((Math.random() - 0.5) * 50)),
          errorRate: Math.max(0, Math.min(5, prev.application.errorRate + (Math.random() - 0.5) * 0.5)),
          responseTime: Math.max(50, Math.min(500, prev.application.responseTime + (Math.random() - 0.5) * 30))
        }
      }));

      setLastUpdated(new Date());

      // Check for alerts
      const newAlerts: PerformanceAlert[] = [];
      
      if (metrics.cpu.current > 80) {
        newAlerts.push({
          id: `cpu-${Date.now()}`,
          type: 'warning',
          metric: 'CPU Usage',
          message: `CPU usage is ${metrics.cpu.current.toFixed(1)}%`,
          timestamp: new Date(),
          value: metrics.cpu.current,
          threshold: 80,
          resolved: false
        });
      }

      if (metrics.memory.current > 85) {
        newAlerts.push({
          id: `memory-${Date.now()}`,
          type: 'critical',
          metric: 'Memory Usage',
          message: `Memory usage is ${metrics.memory.current.toFixed(1)}%`,
          timestamp: new Date(),
          value: metrics.memory.current,
          threshold: 85,
          resolved: false
        });
      }

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev.slice(0, 19)]); // Keep last 20 alerts
      }

    }, parseInt(refreshInterval) * 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, refreshInterval, metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime * 365);
    const hours = Math.floor((uptime * 365 * 24) % 24);
    return `${days}d ${hours}h`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Advanced Performance Monitor
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="monitoring"
                  checked={isMonitoring}
                  onCheckedChange={setIsMonitoring}
                />
                <Label htmlFor="monitoring" className="text-sm">
                  {isMonitoring ? 'Monitoring' : 'Paused'}
                </Label>
              </div>
              <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 second</SelectItem>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">5m</SelectItem>
                  <SelectItem value="15m">15m</SelectItem>
                  <SelectItem value="1h">1h</SelectItem>
                  <SelectItem value="6h">6h</SelectItem>
                  <SelectItem value="24h">24h</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Metrics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CPU Usage */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-500" />
                    CPU Usage
                  </CardTitle>
                  <Badge className={getStatusColor(metrics.cpu.status)}>
                    {metrics.cpu.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{metrics.cpu.current.toFixed(1)}%</span>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{metrics.cpu.cores} cores</div>
                      <div>{metrics.cpu.temperature}°C</div>
                    </div>
                  </div>
                  <Progress value={metrics.cpu.current} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg: {metrics.cpu.average}%</span>
                    <span>Peak: {metrics.cpu.peak}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-green-500" />
                    Memory Usage
                  </CardTitle>
                  <Badge className={getStatusColor(metrics.memory.status)}>
                    {metrics.memory.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{metrics.memory.current.toFixed(1)}%</span>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{metrics.memory.total} GB total</div>
                      <div>{metrics.memory.available} GB free</div>
                    </div>
                  </div>
                  <Progress value={metrics.memory.current} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg: {metrics.memory.average}%</span>
                    <span>Peak: {metrics.memory.peak}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disk Usage */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-purple-500" />
                    Disk Usage
                  </CardTitle>
                  <Badge className={getStatusColor(metrics.disk.status)}>
                    {metrics.disk.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{metrics.disk.current.toFixed(1)}%</span>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{metrics.disk.total} GB total</div>
                      <div>{metrics.disk.iops} IOPS</div>
                    </div>
                  </div>
                  <Progress value={metrics.disk.current} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg: {metrics.disk.average}%</span>
                    <span>Peak: {metrics.disk.peak}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Network className="h-4 w-4 text-orange-500" />
                    Network
                  </CardTitle>
                  <Badge className={getStatusColor(metrics.network.status)}>
                    {metrics.network.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{metrics.network.latency}ms</span>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{metrics.network.throughput} Mbps</div>
                      <div>{metrics.network.errors} errors</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>In: {metrics.network.packetsIn}</span>
                    <span>Out: {metrics.network.packetsOut}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4 text-indigo-500" />
                    Database
                  </CardTitle>
                  <Badge className={getStatusColor(metrics.database.status)}>
                    {metrics.database.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{metrics.database.connections}</span>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>/ {metrics.database.maxConnections} max</div>
                      <div>{metrics.database.avgResponseTime}ms avg</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Active: {metrics.database.activeQueries}</span>
                    <span>Slow: {metrics.database.slowQueries}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-teal-500" />
                    Application
                  </CardTitle>
                  <Badge className={getStatusColor(metrics.application.status)}>
                    {metrics.application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{metrics.application.uptime.toFixed(2)}%</span>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{metrics.application.requestsPerSecond} req/s</div>
                      <div>{metrics.application.activeUsers} users</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Errors: {metrics.application.errorRate}%</span>
                    <span>Response: {metrics.application.responseTime}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>System resource charts would be displayed here</p>
                    <p className="text-sm">Interactive charts showing resource usage over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Performance trend charts would be displayed here</p>
                    <p className="text-sm">Historical performance data and trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="application" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Application Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Uptime</p>
                      <p className="text-sm text-muted-foreground">{formatUptime(metrics.application.uptime)}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{metrics.application.uptime.toFixed(3)}%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Request Rate</p>
                      <p className="text-sm text-muted-foreground">Current throughput</p>
                    </div>
                    <Badge variant="outline">{metrics.application.requestsPerSecond} req/s</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Error Rate</p>
                      <p className="text-sm text-muted-foreground">Percentage of failed requests</p>
                    </div>
                    <Badge variant={metrics.application.errorRate > 1 ? "destructive" : "outline"}>
                      {metrics.application.errorRate.toFixed(2)}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Response Time</p>
                      <p className="text-sm text-muted-foreground">Average response time</p>
                    </div>
                    <Badge variant="outline">{metrics.application.responseTime}ms</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Security metrics would be displayed here</p>
                    <p className="text-sm">Authentication failures, blocked requests, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Performance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active alerts</p>
                    <p className="text-sm">All systems are performing within normal parameters</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{alert.metric}</p>
                          <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Value: {alert.value.toFixed(1)}</span>
                          <span>Threshold: {alert.threshold}</span>
                          <span>{alert.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Refreshing every {refreshInterval}s</span>
          <RefreshCw className={`h-4 w-4 ${isMonitoring ? 'animate-spin' : ''}`} />
        </div>
      </div>
    </div>
  );
}