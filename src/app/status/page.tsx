'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  Database,
  Globe,
  Cloud,
  Server,
  Wifi,
  Shield,
  Cpu,
  HardDrive,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ExternalLink,
  RefreshCw,
  Bell,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const systemStatus = {
  overall: 'operational',
  lastUpdated: new Date().toISOString(),
  uptime: 99.97
};

const services = [
  {
    id: 'api',
    name: 'API Services',
    description: 'Core automation API endpoints',
    status: 'operational',
    uptime: 99.98,
    responseTime: 145,
    icon: Zap,
    incidents: 0
  },
  {
    id: 'workflow-engine',
    name: 'Workflow Engine',
    description: 'Workflow execution and processing',
    status: 'operational',
    uptime: 99.95,
    responseTime: 234,
    icon: Activity,
    incidents: 0
  },
  {
    id: 'database',
    name: 'Database Cluster',
    description: 'Primary data storage systems',
    status: 'operational',
    uptime: 99.99,
    responseTime: 12,
    icon: Database,
    incidents: 0
  },
  {
    id: 'ai-services',
    name: 'AI & ML Services',
    description: 'AI workflow generation and processing',
    status: 'maintenance',
    uptime: 98.5,
    responseTime: 892,
    icon: Cpu,
    incidents: 1
  },
  {
    id: 'integrations',
    name: 'Third-party Integrations',
    description: 'External service connections',
    status: 'operational',
    uptime: 99.92,
    responseTime: 567,
    icon: Globe,
    incidents: 0
  },
  {
    id: 'storage',
    name: 'File Storage',
    description: 'Document and media storage',
    status: 'degraded',
    uptime: 97.8,
    responseTime: 1234,
    icon: HardDrive,
    incidents: 2
  },
  {
    id: 'authentication',
    name: 'Authentication',
    description: 'User login and security services',
    status: 'operational',
    uptime: 99.96,
    responseTime: 89,
    icon: Shield,
    incidents: 0
  },
  {
    id: 'cdn',
    name: 'Content Delivery',
    description: 'Global CDN and static assets',
    status: 'operational',
    uptime: 99.99,
    responseTime: 23,
    icon: Cloud,
    incidents: 0
  }
];

const incidents = [
  {
    id: '1',
    title: 'AI Service Performance Degradation',
    description: 'Some AI workflow generation requests experiencing slower response times',
    status: 'investigating',
    severity: 'minor',
    startTime: '2025-01-23T14:30:00Z',
    updates: [
      {
        time: '2025-01-23T15:15:00Z',
        message: 'Engineering team is investigating increased response times in AI services',
        status: 'investigating'
      },
      {
        time: '2025-01-23T14:45:00Z',
        message: 'We are aware of performance issues affecting AI workflow generation',
        status: 'identified'
      }
    ],
    affectedServices: ['ai-services']
  },
  {
    id: '2',
    title: 'Scheduled Maintenance - File Storage Optimization',
    description: 'Performing routine maintenance on file storage systems',
    status: 'scheduled',
    severity: 'maintenance',
    startTime: '2025-01-24T02:00:00Z',
    endTime: '2025-01-24T04:00:00Z',
    updates: [
      {
        time: '2025-01-23T12:00:00Z',
        message: 'Scheduled maintenance will begin at 2:00 AM UTC on January 24th',
        status: 'scheduled'
      }
    ],
    affectedServices: ['storage']
  }
];

const metrics = [
  {
    name: 'Average Response Time',
    value: 234,
    unit: 'ms',
    change: -12,
    trend: 'down',
    icon: Clock
  },
  {
    name: 'Requests per Second',
    value: 1247,
    unit: 'req/s',
    change: 8.5,
    trend: 'up',
    icon: Activity
  },
  {
    name: 'Error Rate',
    value: 0.02,
    unit: '%',
    change: -0.01,
    trend: 'down',
    icon: AlertTriangle
  },
  {
    name: 'Active Workflows',
    value: 8432,
    unit: '',
    change: 234,
    trend: 'up',
    icon: Zap
  }
];

const uptime30Days = [
  { date: '2025-01-01', uptime: 99.98 },
  { date: '2025-01-02', uptime: 99.95 },
  { date: '2025-01-03', uptime: 99.99 },
  { date: '2025-01-04', uptime: 99.97 },
  { date: '2025-01-05', uptime: 99.96 },
  { date: '2025-01-06', uptime: 99.98 },
  { date: '2025-01-07', uptime: 99.94 },
  { date: '2025-01-08', uptime: 99.99 },
  { date: '2025-01-09', uptime: 99.97 },
  { date: '2025-01-10', uptime: 99.98 },
  // ... more days
];

function StatusPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100 dark:bg-green-900/20 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200';
      case 'maintenance': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 border-blue-200';
      case 'outage': return 'text-red-600 bg-red-100 dark:bg-red-900/20 border-red-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'major': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'minor': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'maintenance': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'outage': return <XCircle className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl" />
          <div className="relative p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      System Status
                    </h1>
                    <p className="text-muted-foreground text-lg">
                      Real-time monitoring of all Kairo services
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  All Systems Operational
                </Badge>
                <Button 
                  variant="outline" 
                  onClick={() => setLastRefresh(new Date())}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-4">
                <span>Overall uptime: {systemStatus.uptime}%</span>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Subscribe to Updates
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <Card key={metric.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <metric.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {metric.value.toLocaleString()}{metric.unit}
                      </p>
                      <p className="text-sm text-muted-foreground">{metric.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <span className={cn(
                      "text-sm font-medium",
                      metric.trend === 'up' ? "text-green-600" : 
                      metric.trend === 'down' ? "text-red-600" : "text-gray-600"
                    )}>
                      {Math.abs(metric.change)}{metric.unit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>
              Current operational status of all Kairo services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <service.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">{service.uptime}%</p>
                      <p className="text-muted-foreground">Uptime</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{service.responseTime}ms</p>
                      <p className="text-muted-foreground">Response</p>
                    </div>
                    <Badge className={getStatusColor(service.status)}>
                      {getStatusIcon(service.status)}
                      <span className="ml-1 capitalize">{service.status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Incidents */}
        {incidents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Current Incidents
              </CardTitle>
              <CardDescription>
                Active incidents and scheduled maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {incidents.map((incident) => (
                  <div key={incident.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{incident.title}</h3>
                        <p className="text-muted-foreground">{incident.description}</p>
                      </div>
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Started: {new Date(incident.startTime).toLocaleString()}</span>
                        {incident.endTime && (
                          <span>Expected end: {new Date(incident.endTime).toLocaleString()}</span>
                        )}
                        <span>Status: {incident.status}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Updates:</h4>
                        {incident.updates.map((update, index) => (
                          <div key={index} className="flex gap-3 text-sm">
                            <span className="text-muted-foreground">
                              {new Date(update.time).toLocaleTimeString()}
                            </span>
                            <span>{update.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Uptime History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              30-Day Uptime History
            </CardTitle>
            <CardDescription>
              Daily uptime percentage over the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-1">
              {uptime30Days.slice(0, 30).map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className={cn(
                      "w-full rounded-t",
                      day.uptime >= 99.9 ? "bg-green-500" :
                      day.uptime >= 99.5 ? "bg-yellow-500" :
                      "bg-red-500"
                    )}
                    style={{ height: `${(day.uptime - 95) * 5}%` }}
                  />
                  <span className="text-xs text-muted-foreground mt-2">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-4">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            For technical support, please contact{' '}
            <a href="mailto:support@kairo.ai" className="text-primary hover:underline">
              support@kairo.ai
            </a>
          </p>
          <p className="mt-2">
            Subscribe to status updates:{' '}
            <Button variant="link" className="p-0 h-auto">
              <ExternalLink className="h-3 w-3 mr-1" />
              RSS Feed
            </Button>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(StatusPage);