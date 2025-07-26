'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Globe,
  Database,
  Mail,
  MessageSquare,
  Calendar,
  CreditCard,
  FileText,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  Filter,
  Eye,
  Play,
  Pause,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Wifi,
  WifiOff,
  Server,
  Shield,
  Key,
  Timer,
  Search,
  Download,
  Share
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Integration {
  id: string;
  name: string;
  category: string;
  status: 'healthy' | 'warning' | 'error' | 'maintenance';
  uptime: number;
  responseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  lastCheck: string;
  version: string;
  icon: React.ElementType;
  color: string;
  credentials: {
    type: string;
    expiresAt?: string;
    status: 'valid' | 'expiring' | 'expired';
  };
  metrics: {
    totalRequests: number;
    successRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    dataTransferred: string;
  };
  healthChecks: {
    connectivity: boolean;
    authentication: boolean;
    rateLimit: boolean;
    dataAccess: boolean;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
}

const mockIntegrations: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    status: 'healthy',
    uptime: 99.9,
    responseTime: 245,
    requestsPerMinute: 45,
    errorRate: 0.1,
    lastCheck: '2 minutes ago',
    version: 'v52.0',
    icon: Database,
    color: 'from-blue-500 to-cyan-500',
    credentials: {
      type: 'OAuth 2.0',
      expiresAt: '2025-06-15',
      status: 'valid'
    },
    metrics: {
      totalRequests: 125847,
      successRequests: 125721,
      failedRequests: 126,
      avgResponseTime: 245,
      dataTransferred: '2.4 GB'
    },
    healthChecks: {
      connectivity: true,
      authentication: true,
      rateLimit: true,
      dataAccess: true
    },
    alerts: []
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    status: 'healthy',
    uptime: 99.8,
    responseTime: 120,
    requestsPerMinute: 28,
    errorRate: 0.2,
    lastCheck: '1 minute ago',
    version: 'v1.7',
    icon: MessageSquare,
    color: 'from-green-500 to-emerald-500',
    credentials: {
      type: 'Bot Token',
      status: 'valid'
    },
    metrics: {
      totalRequests: 89654,
      successRequests: 89476,
      failedRequests: 178,
      avgResponseTime: 120,
      dataTransferred: '1.2 GB'
    },
    healthChecks: {
      connectivity: true,
      authentication: true,
      rateLimit: true,
      dataAccess: true
    },
    alerts: []
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'E-commerce',
    status: 'warning',
    uptime: 98.2,
    responseTime: 380,
    requestsPerMinute: 15,
    errorRate: 2.1,
    lastCheck: '3 minutes ago',
    version: 'v2021-04',
    icon: CreditCard,
    color: 'from-purple-500 to-pink-500',
    credentials: {
      type: 'API Key',
      expiresAt: '2025-03-01',
      status: 'expiring'
    },
    metrics: {
      totalRequests: 45823,
      successRequests: 44859,
      failedRequests: 964,
      avgResponseTime: 380,
      dataTransferred: '890 MB'
    },
    healthChecks: {
      connectivity: true,
      authentication: true,
      rateLimit: false,
      dataAccess: true
    },
    alerts: [
      {
        id: '1',
        type: 'warning',
        message: 'API rate limit approaching (85% of quota used)',
        timestamp: '15 minutes ago'
      }
    ]
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Email',
    status: 'error',
    uptime: 95.4,
    responseTime: 1200,
    requestsPerMinute: 8,
    errorRate: 5.3,
    lastCheck: '5 minutes ago',
    version: 'v1',
    icon: Mail,
    color: 'from-red-500 to-pink-500',
    credentials: {
      type: 'OAuth 2.0',
      expiresAt: '2024-12-01',
      status: 'expired'
    },
    metrics: {
      totalRequests: 32567,
      successRequests: 30839,
      failedRequests: 1728,
      avgResponseTime: 1200,
      dataTransferred: '456 MB'
    },
    healthChecks: {
      connectivity: true,
      authentication: false,
      rateLimit: true,
      dataAccess: false
    },
    alerts: [
      {
        id: '2',
        type: 'error',
        message: 'Authentication failed - token expired',
        timestamp: '25 minutes ago'
      },
      {
        id: '3',
        type: 'error',
        message: 'High response times detected (>1s)',
        timestamp: '45 minutes ago'
      }
    ]
  }
];

export function IntegrationHealthMonitor() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['all', ...Array.from(new Set(integrations.map(i => i.category.toLowerCase())))];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || integration.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || integration.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'error': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'maintenance': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      case 'maintenance': return Settings;
      default: return Activity;
    }
  };

  const getCredentialsStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-50 border-green-200';
      case 'expiring': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'expired': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const refreshIntegration = async (integrationId: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const IntegrationCard = ({ integration }: { integration: Integration }) => {
    const StatusIcon = getStatusIcon(integration.status);
    const Icon = integration.icon;

    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
          getStatusColor(integration.status),
          selectedIntegration?.id === integration.id && "ring-2 ring-primary"
        )}
        onClick={() => setSelectedIntegration(integration)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg bg-gradient-to-r",
                integration.color
              )}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">{integration.name}</CardTitle>
                <CardDescription className="text-sm">
                  {integration.category} • {integration.version}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-4 w-4", integration.status === 'healthy' ? 'text-green-500' : 
                                                   integration.status === 'warning' ? 'text-yellow-500' : 
                                                   integration.status === 'error' ? 'text-red-500' : 'text-blue-500')} />
              <Badge variant="outline" className="text-xs capitalize">
                {integration.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className="font-semibold">{integration.uptime}%</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Response</p>
              <p className="font-semibold">{integration.responseTime}ms</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Error Rate</span>
              <span className={cn(
                "font-medium",
                integration.errorRate > 2 ? "text-red-600" : 
                integration.errorRate > 1 ? "text-yellow-600" : "text-green-600"
              )}>
                {integration.errorRate}%
              </span>
            </div>
            <Progress value={100 - integration.errorRate} className="h-2" />
          </div>

          {integration.alerts.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              <span>{integration.alerts.length} active alert{integration.alerts.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const IntegrationDetails = ({ integration }: { integration: Integration }) => {
    const Icon = integration.icon;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-r",
              integration.color
            )}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{integration.name}</h2>
              <p className="text-muted-foreground">
                {integration.category} Integration • {integration.version}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refreshIntegration(integration.id)}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View Logs
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="health">Health Checks</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                      <p className="text-2xl font-bold">{integration.metrics.totalRequests.toLocaleString()}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {((integration.metrics.successRequests / integration.metrics.totalRequests) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Response</p>
                      <p className="text-2xl font-bold">{integration.responseTime}ms</p>
                    </div>
                    <Timer className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Data Transfer</p>
                      <p className="text-2xl font-bold">{integration.metrics.dataTransferred}</p>
                    </div>
                    <Database className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Credentials Status</CardTitle>
                <CardDescription>Authentication and access information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{integration.credentials.type}</p>
                      {integration.credentials.expiresAt && (
                        <p className="text-sm text-muted-foreground">
                          Expires: {integration.credentials.expiresAt}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={cn("capitalize", getCredentialsStatusColor(integration.credentials.status))}>
                    {integration.credentials.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Metrics</CardTitle>
                  <CardDescription>Detailed request statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Requests</span>
                      <span className="font-mono font-medium">{integration.metrics.totalRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Successful Requests</span>
                      <span className="font-mono font-medium text-green-600">{integration.metrics.successRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Failed Requests</span>
                      <span className="font-mono font-medium text-red-600">{integration.metrics.failedRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Requests/Minute</span>
                      <span className="font-mono font-medium">{integration.requestsPerMinute}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Chart</CardTitle>
                  <CardDescription>Response time trends over the last 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Performance chart would be rendered here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <div className="grid gap-4">
              {Object.entries(integration.healthChecks).map(([check, status]) => (
                <Card key={check}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          status ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        )}>
                          {status ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{check.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-sm text-muted-foreground">
                            {status ? 'Operating normally' : 'Issue detected'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={status ? 'default' : 'destructive'}>
                        {status ? 'Healthy' : 'Failed'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            {integration.alerts.length > 0 ? (
              <div className="space-y-4">
                {integration.alerts.map((alert) => (
                  <Card key={alert.id} className={cn(
                    "border",
                    alert.type === 'error' ? 'border-red-200 bg-red-50/50' : 'border-yellow-200 bg-yellow-50/50'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          alert.type === 'error' ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                        )}>
                          {alert.type === 'error' ? 
                            <XCircle className="h-4 w-4" /> : 
                            <AlertTriangle className="h-4 w-4" />
                          }
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-muted-foreground">{alert.timestamp}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Resolve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                  <p className="text-muted-foreground">This integration is operating normally with no issues detected.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Health Monitor</h2>
          <p className="text-muted-foreground">
            Real-time monitoring and health checks for all your integrations
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {!selectedIntegration ? (
        <>
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Integration Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </>
      ) : (
        <div>
          <Button
            variant="ghost"
            onClick={() => setSelectedIntegration(null)}
            className="mb-6"
          >
            ← Back to Integrations
          </Button>
          <IntegrationDetails integration={selectedIntegration} />
        </div>
      )}
    </div>
  );
}