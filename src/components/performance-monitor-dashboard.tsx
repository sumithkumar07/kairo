'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Database, 
  Network, 
  Wifi, 
  Timer,
  Gauge,
  Monitor,
  Server,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';

export function PerformanceMonitorDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enhanced system metrics
  const systemMetrics = {
    cpu: { current: 45, average: 38, peak: 72, status: 'healthy' as const },
    memory: { current: 67, average: 58, peak: 89, status: 'warning' as const },
    disk: { current: 23, average: 28, peak: 45, status: 'healthy' as const },
    network: { latency: '23ms', throughput: '1.2 GB/s', status: 'healthy' as const },
    database: { connections: 15, maxConnections: 100, responseTime: '12ms', status: 'healthy' as const }
  };

  const services = [
    { name: 'API Gateway', status: 'healthy', uptime: '99.99%', responseTime: '45ms', requests: '12.4K/min' },
    { name: 'Workflow Engine', status: 'healthy', uptime: '99.97%', responseTime: '120ms', requests: '8.7K/min' },
    { name: 'Database Cluster', status: 'warning', uptime: '99.95%', responseTime: '200ms', requests: '15.2K/min' },
    { name: 'Integration Hub', status: 'healthy', uptime: '99.98%', responseTime: '85ms', requests: '3.1K/min' },
    { name: 'AI Processing', status: 'healthy', uptime: '99.96%', responseTime: '300ms', requests: '1.9K/min' },
    { name: 'Cache Layer', status: 'healthy', uptime: '99.99%', responseTime: '8ms', requests: '45.7K/min' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'error': 
      case 'critical': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': 
      case 'critical': return XCircle;
      default: return Activity;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Performance Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Performance Monitor
          </h2>
          <p className="text-muted-foreground">
            Real-time system performance and health monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity className="h-3 w-3" />
            All Systems Operational
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* System Resources */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              System Resources
            </CardTitle>
            <CardDescription>Real-time performance monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  CPU Usage
                </span>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(systemMetrics.cpu.status)} variant="outline">
                    {systemMetrics.cpu.status}
                  </Badge>
                  <span className="font-medium">{systemMetrics.cpu.current}%</span>
                </div>
              </div>
              <Progress value={systemMetrics.cpu.current} className="h-3 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Avg: {systemMetrics.cpu.average}%</span>
                <span>Peak: {systemMetrics.cpu.peak}%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Memory Usage
                </span>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(systemMetrics.memory.status)} variant="outline">
                    {systemMetrics.memory.status}
                  </Badge>
                  <span className="font-medium">{systemMetrics.memory.current}%</span>
                </div>
              </div>
              <Progress value={systemMetrics.memory.current} className="h-3 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Avg: {systemMetrics.memory.average}%</span>
                <span>Peak: {systemMetrics.memory.peak}%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Disk Usage
                </span>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(systemMetrics.disk.status)} variant="outline">
                    {systemMetrics.disk.status}
                  </Badge>
                  <span className="font-medium">{systemMetrics.disk.current}%</span>
                </div>
              </div>
              <Progress value={systemMetrics.disk.current} className="h-3 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Avg: {systemMetrics.disk.average}%</span>
                <span>Peak: {systemMetrics.disk.peak}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Network & Database
            </CardTitle>
            <CardDescription>Connection health and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Network Latency</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(systemMetrics.network.status)} variant="outline">
                    {systemMetrics.network.status}
                  </Badge>
                  <span className="font-medium">{systemMetrics.network.latency}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Throughput</span>
                </div>
                <span className="font-medium">{systemMetrics.network.throughput}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">DB Connections</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(systemMetrics.database.status)} variant="outline">
                    {systemMetrics.database.status}
                  </Badge>
                  <span className="font-medium">
                    {systemMetrics.database.connections}/{systemMetrics.database.maxConnections}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">DB Response</span>
                </div>
                <span className="font-medium">{systemMetrics.database.responseTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Service Health Monitor
          </CardTitle>
          <CardDescription>Real-time status of all system services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {services.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status);
              return (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${getStatusColor(service.status)}`}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{service.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{service.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{service.uptime}</div>
                      <div className="text-muted-foreground">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{service.responseTime}</div>
                      <div className="text-muted-foreground">Response</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{service.requests}</div>
                      <div className="text-muted-foreground">Requests</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Alerts</CardTitle>
          <CardDescription>Recent alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">High Memory Usage</p>
                <p className="text-xs text-muted-foreground">Memory usage reached 89% at 2:15 PM</p>
              </div>
              <Badge variant="outline" className="text-xs">1 hour ago</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Database Performance Improved</p>
                <p className="text-xs text-muted-foreground">Response time decreased by 15ms</p>
              </div>
              <Badge variant="outline" className="text-xs">2 hours ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}