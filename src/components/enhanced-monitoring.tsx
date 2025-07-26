'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Monitor, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Pause,
  Play,
  Eye,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Gauge,
  Server,
  Database,
  Zap,
  Network,
  Cpu,
  HardDrive,
  Wifi,
  Bell,
  X,
  AlertCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
}

interface WorkflowStatus {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'error' | 'completed';
  executions: number;
  successRate: number;
  lastRun: string;
  avgDuration: string;
  nextRun?: string;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  workflow?: string;
  timestamp: string;
  count: number;
  resolved: boolean;
}

export function EnhancedMonitoring() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowStatus[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Initialize data
  useEffect(() => {
    const initialMetrics: SystemMetric[] = [
      {
        name: 'CPU Usage',
        value: 45,
        unit: '%',
        status: 'healthy',
        trend: 'stable',
        icon: Cpu
      },
      {
        name: 'Memory Usage',
        value: 67,
        unit: '%',
        status: 'warning',
        trend: 'up',
        icon: HardDrive
      },
      {
        name: 'API Response Time',
        value: 127,
        unit: 'ms',
        status: 'healthy',
        trend: 'down',
        icon: Zap
      },
      {
        name: 'Database Connections',
        value: 23,
        unit: 'active',
        status: 'healthy',
        trend: 'stable',
        icon: Database
      },
      {
        name: 'Network I/O',
        value: 89,
        unit: 'MB/s',
        status: 'healthy',
        trend: 'up',
        icon: Network
      },
      {
        name: 'Storage Usage',
        value: 78,
        unit: '%',
        status: 'warning',
        trend: 'up',
        icon: Server
      }
    ];

    const initialWorkflows: WorkflowStatus[] = [
      {
        id: 'wf-001',
        name: 'Lead Qualification & Routing',
        status: 'running',
        executions: 1247,
        successRate: 98.2,
        lastRun: '2 minutes ago',
        avgDuration: '1.3s',
        nextRun: 'in 3 minutes'
      },
      {
        id: 'wf-002',
        name: 'Customer Onboarding Flow',
        status: 'running',
        executions: 89,
        successRate: 95.5,
        lastRun: '5 minutes ago',
        avgDuration: '4.7s',
        nextRun: 'in 10 minutes'
      },
      {
        id: 'wf-003',
        name: 'Invoice Processing Pipeline',
        status: 'error',
        executions: 567,
        successRate: 87.3,
        lastRun: '12 minutes ago',
        avgDuration: '2.1s'
      },
      {
        id: 'wf-004',
        name: 'Social Media Monitor',
        status: 'paused',
        executions: 2134,
        successRate: 99.1,
        lastRun: '1 hour ago',
        avgDuration: '0.8s'
      },
      {
        id: 'wf-005',
        name: 'Data Backup & Sync',
        status: 'running',
        executions: 34,
        successRate: 100,
        lastRun: '15 minutes ago',
        avgDuration: '12.4s',
        nextRun: 'in 45 minutes'
      }
    ];

    const initialAlerts: SystemAlert[] = [
      {
        id: 'alert-001',
        type: 'error',
        title: 'Workflow Execution Failed',
        message: 'Invoice Processing Pipeline failed due to API timeout',
        workflow: 'Invoice Processing Pipeline',
        timestamp: '5 minutes ago',
        count: 3,
        resolved: false
      },
      {
        id: 'alert-002',
        type: 'warning',
        title: 'High Memory Usage',
        message: 'System memory usage is above 65% threshold',
        timestamp: '12 minutes ago',
        count: 1,
        resolved: false
      },
      {
        id: 'alert-003',
        type: 'warning',
        title: 'Slow API Response',
        message: 'Third-party API response time increased by 40%',
        workflow: 'Lead Qualification & Routing',
        timestamp: '18 minutes ago',
        count: 5,
        resolved: false
      },
      {
        id: 'alert-004',
        type: 'info',
        title: 'Workflow Completed',
        message: 'Monthly report generation completed successfully',
        workflow: 'Monthly Analytics Report',
        timestamp: '25 minutes ago',
        count: 1,
        resolved: true
      }
    ];

    setSystemMetrics(initialMetrics);
    setWorkflows(initialWorkflows);
    setAlerts(initialAlerts);
  }, []);

  // Auto refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Update metrics with small random variations
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10))
      })));
      
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'healthy':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'warning':
      case 'paused':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error':
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'completed':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return AlertTriangle;
      case 'warning':
        return AlertCircle;
      case 'info':
        return CheckCircle;
      default:
        return AlertTriangle;
    }
  };

  const handleWorkflowAction = (workflowId: string, action: 'pause' | 'resume' | 'stop') => {
    setWorkflows(prev => prev.map(wf => 
      wf.id === workflowId 
        ? { 
            ...wf, 
            status: action === 'pause' ? 'paused' : action === 'resume' ? 'running' : 'completed' 
          }
        : wf
    ));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">Real-time monitoring of workflows and system health</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={cn(
            "px-4 py-2",
            systemMetrics.every(m => m.status === 'healthy') 
              ? "bg-green-500 text-white" 
              : systemMetrics.some(m => m.status === 'critical')
              ? "bg-red-500 text-white"
              : "bg-yellow-500 text-white"
          )}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {systemMetrics.every(m => m.status === 'healthy') 
              ? 'All Systems Operational' 
              : systemMetrics.some(m => m.status === 'critical')
              ? 'Critical Issues Detected'
              : 'Some Issues Detected'}
          </Badge>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Auto Refresh
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Manual Refresh
                </>
              )}
            </Button>
            
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="5m">Last 5 minutes</option>
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last hour</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    metric.status === 'healthy' ? 'bg-green-500/10' :
                    metric.status === 'warning' ? 'bg-yellow-500/10' : 'bg-red-500/10'
                  )}>
                    <metric.icon className={cn(
                      "h-5 w-5",
                      metric.status === 'healthy' ? 'text-green-600' :
                      metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{metric.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge className={getStatusColor(metric.status)} variant="outline">
                        {metric.status}
                      </Badge>
                      {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
                      {metric.trend === 'down' && <TrendingDown className="h-3 w-3 text-green-500" />}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">{metric.unit}</div>
                </div>
              </div>
              
              <Progress 
                value={metric.unit === '%' ? metric.value : (metric.value / 200) * 100} 
                className={cn(
                  "h-2",
                  metric.status === 'critical' ? "bg-red-100" :
                  metric.status === 'warning' ? "bg-yellow-100" : "bg-green-100"
                )}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Workflows and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Workflows */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Workflows
              <Badge variant="outline">
                {workflows.filter(w => w.status === 'running').length} running
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        workflow.status === 'running' ? 'bg-green-500 animate-pulse' :
                        workflow.status === 'paused' ? 'bg-yellow-500' :
                        workflow.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      )} />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{workflow.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{workflow.executions} runs</span>
                          <span>{workflow.successRate}% success</span>
                          <span>Avg: {workflow.avgDuration}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Last run: {workflow.lastRun}
                          {workflow.nextRun && ` • Next: ${workflow.nextRun}`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-3">
                      <Badge className={getStatusColor(workflow.status)} variant="outline">
                        {workflow.status}
                      </Badge>
                      
                      <div className="flex items-center gap-1 ml-2">
                        {workflow.status === 'running' ? (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleWorkflowAction(workflow.id, 'pause')}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleWorkflowAction(workflow.id, 'resume')}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button size="sm" variant="ghost">
                          <Eye className="h-3 w-3" />
                        </Button>
                        
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Alerts
              <Badge variant="outline" className="text-red-600">
                {alerts.filter(a => !a.resolved).length} active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const IconComponent = getAlertIcon(alert.type);
                  return (
                    <div 
                      key={alert.id} 
                      className={cn(
                        "p-3 border rounded-lg transition-colors",
                        alert.resolved ? "opacity-50 bg-muted/30" : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center mt-0.5",
                            alert.type === 'error' ? 'bg-red-500/10' :
                            alert.type === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                          )}>
                            <IconComponent className={cn(
                              "h-4 w-4",
                              alert.type === 'error' ? 'text-red-600' :
                              alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                            )} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{alert.title}</h4>
                              {alert.count > 1 && (
                                <Badge variant="outline" className="text-xs">
                                  {alert.count}x
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {alert.message}
                            </p>
                            {alert.workflow && (
                              <Badge variant="outline" className="text-xs mb-2">
                                {alert.workflow}
                              </Badge>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {alert.timestamp}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          {!alert.resolved && alert.type !== 'info' && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
        <div className="flex items-center gap-4">
          <span>Showing data for {selectedTimeRange}</span>
          <span>•</span>
          <span>{workflows.length} workflows monitored</span>
          <span>•</span>
          <span>{systemMetrics.length} metrics tracked</span>
        </div>
      </div>
    </div>
  );
}