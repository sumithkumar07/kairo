'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusIndicator, ConnectionStatus } from '@/components/ui/enhanced-status-indicators';
import { InteractiveButton } from '@/components/ui/enhanced-interactive-elements';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';
import { 
  Monitor,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  Settings,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Database,
  Globe,
  Wifi,
  Server,
  Network,
  Eye,
  Play,
  Pause,
  Square,
  ArrowUp,
  ArrowDown,
  Minus,
  Bell,
  Download,
  Upload,
  BarChart3,
  LineChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntegrationHealthData {
  id: string;
  name: string;
  category: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  uptime: number;
  responseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  lastCheck: string;
  endpoints: Array<{
    name: string;
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
    lastCheck: string;
  }>;
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    peakResponseTime: number;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>;
}

interface HealthHistoryPoint {
  timestamp: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  responseTime: number;
  uptime: number;
}

const MOCK_INTEGRATIONS: IntegrationHealthData[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    status: 'healthy',
    uptime: 99.8,
    responseTime: 245,
    requestsPerMinute: 23,
    errorRate: 0.2,
    lastCheck: '30 seconds ago',
    endpoints: [
      { name: 'Authentication', status: 'healthy', responseTime: 156, lastCheck: '30s ago' },
      { name: 'Contacts API', status: 'healthy', responseTime: 234, lastCheck: '45s ago' },
      { name: 'Opportunities API', status: 'warning', responseTime: 412, lastCheck: '1m ago' },
      { name: 'Webhooks', status: 'healthy', responseTime: 89, lastCheck: '15s ago' }
    ],
    metrics: {
      totalRequests: 15247,
      successfulRequests: 15217,
      failedRequests: 30,
      avgResponseTime: 245,
      peakResponseTime: 1200
    },
    alerts: [
      {
        id: '1',
        type: 'warning',
        message: 'Response time increased by 15% in the last hour',
        timestamp: '5 minutes ago'
      }
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    status: 'healthy',
    uptime: 99.9,
    responseTime: 120,
    requestsPerMinute: 15,
    errorRate: 0.1,
    lastCheck: '15 seconds ago',
    endpoints: [
      { name: 'Messaging API', status: 'healthy', responseTime: 98, lastCheck: '15s ago' },
      { name: 'User API', status: 'healthy', responseTime: 134, lastCheck: '20s ago' },
      { name: 'Channels API', status: 'healthy', responseTime: 156, lastCheck: '25s ago' }
    ],
    metrics: {
      totalRequests: 8934,
      successfulRequests: 8925,
      failedRequests: 9,
      avgResponseTime: 120,
      peakResponseTime: 350
    },
    alerts: []
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'E-commerce',
    status: 'warning',
    uptime: 98.5,
    responseTime: 380,
    requestsPerMinute: 8,
    errorRate: 1.5,
    lastCheck: '45 seconds ago',
    endpoints: [
      { name: 'Products API', status: 'warning', responseTime: 450, lastCheck: '45s ago' },
      { name: 'Orders API', status: 'healthy', responseTime: 234, lastCheck: '1m ago' },
      { name: 'Customers API', status: 'critical', responseTime: 890, lastCheck: '2m ago' },
      { name: 'Webhooks', status: 'healthy', responseTime: 145, lastCheck: '30s ago' }
    ],
    metrics: {
      totalRequests: 5476,
      successfulRequests: 5394,
      failedRequests: 82,
      avgResponseTime: 380,
      peakResponseTime: 2100
    },
    alerts: [
      {
        id: '1',
        type: 'error',
        message: 'Customer API experiencing high error rates',
        timestamp: '10 minutes ago'
      },
      {
        id: '2',
        type: 'warning',
        message: 'Rate limit approaching for Products API',
        timestamp: '25 minutes ago'
      }
    ]
  }
];

export function IntegrationHealthMonitor() {
  const [integrations, setIntegrations] = useState<IntegrationHealthData[]>(MOCK_INTEGRATIONS);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setIntegrations(prev => prev.map(integration => ({
        ...integration,
        responseTime: integration.responseTime + (Math.random() - 0.5) * 20,
        requestsPerMinute: Math.max(0, integration.requestsPerMinute + Math.floor((Math.random() - 0.5) * 5)),
        lastCheck: 'just now'
      })));
      setLastUpdated(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    setLastUpdated(new Date());
  };

  const getStatusSummary = () => {
    const healthy = integrations.filter(i => i.status === 'healthy').length;
    const warning = integrations.filter(i => i.status === 'warning').length;
    const critical = integrations.filter(i => i.status === 'critical').length;
    const offline = integrations.filter(i => i.status === 'offline').length;

    return { healthy, warning, critical, offline, total: integrations.length };
  };

  const filteredIntegrations = integrations.filter(integration => {
    if (statusFilter !== 'all' && integration.status !== statusFilter) return false;
    if (searchTerm && !integration.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !integration.category.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const statusSummary = getStatusSummary();
  const selectedIntegrationData = integrations.find(i => i.id === selectedIntegration);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'offline': return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const IntegrationCard = ({ integration }: { integration: IntegrationHealthData }) => {
    const isSelected = selectedIntegration === integration.id;

    return (
      <Card className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        getStatusColor(integration.status),
        isSelected && "ring-2 ring-primary ring-offset-2"
      )} onClick={() => setSelectedIntegration(isSelected ? null : integration.id)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full",
                integration.status === 'healthy' && "bg-green-500 animate-pulse",
                integration.status === 'warning' && "bg-yellow-500 animate-pulse",
                integration.status === 'critical' && "bg-red-500 animate-pulse",
                integration.status === 'offline' && "bg-gray-500"
              )} />
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <CardDescription>{integration.category}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className={cn("text-xs capitalize", getStatusColor(integration.status))}>
                {integration.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">{integration.lastCheck}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold">{integration.uptime}%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{Math.round(integration.responseTime)}ms</div>
              <div className="text-xs text-muted-foreground">Response</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{integration.requestsPerMinute}</div>
              <div className="text-xs text-muted-foreground">Req/min</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{integration.errorRate}%</div>
              <div className="text-xs text-muted-foreground">Error Rate</div>
            </div>
          </div>

          {/* Health Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Health Score</span>
              <span>{Math.round(integration.uptime)}%</span>
            </div>
            <Progress 
              value={integration.uptime} 
              className={cn(
                "h-2",
                integration.status === 'healthy' && "[&>div]:bg-green-500",
                integration.status === 'warning' && "[&>div]:bg-yellow-500",
                integration.status === 'critical' && "[&>div]:bg-red-500"
              )}
            />
          </div>

          {/* Alerts */}
          {integration.alerts.length > 0 && (
            <div className="space-y-2">
              {integration.alerts.slice(0, 2).map(alert => (
                <div key={alert.id} className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-xs",
                  alert.type === 'warning' && "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
                  alert.type === 'error' && "bg-red-500/10 text-red-700 dark:text-red-300",
                  alert.type === 'info' && "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                )}>
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  <span className="flex-1">{alert.message}</span>
                  <span className="text-muted-foreground">{alert.timestamp}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <InteractiveButton variant="ghost" size="sm">
                <Eye className="h-3 w-3" />
              </InteractiveButton>
              <InteractiveButton variant="ghost" size="sm">
                <Settings className="h-3 w-3" />
              </InteractiveButton>
              <InteractiveButton variant="ghost" size="sm">
                <MoreHorizontal className="h-3 w-3" />
              </InteractiveButton>
            </div>
            <ConnectionStatus isConnected={integration.status !== 'offline'} />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Monitor className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Integration Health Monitor</h1>
              <p className="text-muted-foreground">
                Real-time monitoring and health analytics for all connected services
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <InteractiveButton
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              loading={isRefreshing}
              icon={RefreshCw}
            >
              Refresh All
            </InteractiveButton>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{statusSummary.healthy}</div>
            <div className="text-sm text-muted-foreground">Healthy</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{statusSummary.warning}</div>
            <div className="text-sm text-muted-foreground">Warning</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{statusSummary.critical}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-500">{statusSummary.offline}</div>
            <div className="text-sm text-muted-foreground">Offline</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{statusSummary.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </Card>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Integration List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters */}
          <Card className="p-4">
            <SearchFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedFilter={statusFilter}
              onFilterChange={setStatusFilter}
              filterOptions={[
                { value: 'all', label: 'All Status', count: statusSummary.total },
                { value: 'healthy', label: 'Healthy', count: statusSummary.healthy },
                { value: 'warning', label: 'Warning', count: statusSummary.warning },
                { value: 'critical', label: 'Critical', count: statusSummary.critical },
                { value: 'offline', label: 'Offline', count: statusSummary.offline }
              ]}
              placeholder="Search integrations..."
              showViewToggle={false}
            />
          </Card>

          {/* Integration Cards */}
          <div className="space-y-4">
            {filteredIntegrations.map(integration => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </div>

        {/* Details Panel */}
        <div className="space-y-6">
          {selectedIntegrationData ? (
            <>
              {/* Selected Integration Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {selectedIntegrationData.name} Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Endpoint Health */}
                  <div>
                    <h4 className="font-medium mb-3">Endpoint Health</h4>
                    <div className="space-y-2">
                      {selectedIntegrationData.endpoints.map((endpoint, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg border bg-card/50">
                          <div className="flex items-center gap-2">
                            <StatusIndicator 
                              status={endpoint.status === 'healthy' ? 'success' : 
                                     endpoint.status === 'warning' ? 'warning' : 'error'}
                              size="sm"
                              showIcon={false}
                            />
                            <span className="text-sm">{endpoint.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{endpoint.responseTime}ms</div>
                            <div className="text-xs text-muted-foreground">{endpoint.lastCheck}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Request Metrics */}
                  <div>
                    <h4 className="font-medium mb-3">Request Metrics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Requests</div>
                        <div className="font-bold">{selectedIntegrationData.metrics.totalRequests.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Success Rate</div>
                        <div className="font-bold text-green-500">
                          {((selectedIntegrationData.metrics.successfulRequests / selectedIntegrationData.metrics.totalRequests) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Failed Requests</div>
                        <div className="font-bold text-red-500">{selectedIntegrationData.metrics.failedRequests}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Peak Response</div>
                        <div className="font-bold">{selectedIntegrationData.metrics.peakResponseTime}ms</div>
                      </div>
                    </div>
                  </div>

                  {/* Active Alerts */}
                  {selectedIntegrationData.alerts.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Active Alerts</h4>
                      <div className="space-y-2">
                        {selectedIntegrationData.alerts.map(alert => (
                          <div key={alert.id} className={cn(
                            "p-3 rounded-lg border",
                            alert.type === 'warning' && "bg-yellow-500/10 border-yellow-500/20",
                            alert.type === 'error' && "bg-red-500/10 border-red-500/20",
                            alert.type === 'info' && "bg-blue-500/10 border-blue-500/20"
                          )}>
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm">{alert.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Select an Integration</p>
                <p className="text-muted-foreground">
                  Click on any integration to view detailed health metrics and alerts
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InteractiveButton className="w-full justify-start" variant="outline" icon={Plus}>
                Add Integration
              </InteractiveButton>
              <InteractiveButton className="w-full justify-start" variant="outline" icon={Settings}>
                Configure Alerts
              </InteractiveButton>
              <InteractiveButton className="w-full justify-start" variant="outline" icon={Download}>
                Export Health Report
              </InteractiveButton>
              <InteractiveButton className="w-full justify-start" variant="outline" icon={BarChart3}>
                View Analytics
              </InteractiveButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}