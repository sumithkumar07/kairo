'use client';

import React, { useState } from 'react';
import { EnhancedAppLayout } from '@/components/enhanced-app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { IntegrationHealthMonitor } from '@/components/ui/enhanced-integration-health';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Globe,
  Plus,
  Search,
  Filter,
  Monitor,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Database,
  Mail,
  MessageSquare,
  CreditCard,
  FileText,
  Calendar,
  Code,
  Cloud,
  Smartphone,
  BarChart3,
  Settings,
  Eye,
  Download,
  Shield,
  Sparkles,
  ArrowRight,
  Layers,
  Network,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock integration data
const integrations = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    status: 'healthy' as const,
    icon: Database,
    color: 'from-blue-500 to-cyan-500',
    connections: 1247,
    successRate: 98.2,
    avgLatency: 245,
    description: 'Customer relationship management platform',
    isPopular: true
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    status: 'healthy' as const,
    icon: MessageSquare,
    color: 'from-green-500 to-emerald-500',
    connections: 890,
    successRate: 99.1,
    avgLatency: 120,
    description: 'Team communication and collaboration',
    isPopular: true
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'E-commerce',
    status: 'warning' as const,
    icon: CreditCard,
    color: 'from-purple-500 to-pink-500',
    connections: 654,
    successRate: 94.8,
    avgLatency: 380,
    description: 'E-commerce platform for online stores',
    isNew: true
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Email',
    status: 'error' as const,
    icon: Mail,
    color: 'from-red-500 to-pink-500',
    connections: 432,
    successRate: 89.5,
    avgLatency: 520,
    description: 'Email communication platform'
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    category: 'Productivity',
    status: 'healthy' as const,
    icon: FileText,
    color: 'from-yellow-500 to-orange-500',
    connections: 778,
    successRate: 96.7,
    avgLatency: 180,
    description: 'Spreadsheet and data management',
    isPopular: true
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'Communication',
    status: 'healthy' as const,
    icon: Smartphone,
    color: 'from-indigo-500 to-purple-500',
    connections: 234,
    successRate: 97.8,
    avgLatency: 290,
    description: 'SMS and voice communication API'
  }
];

const categories = [
  { value: 'all', label: 'All Categories', count: integrations.length },
  { value: 'crm', label: 'CRM', count: 1 },
  { value: 'communication', label: 'Communication', count: 2 },
  { value: 'e-commerce', label: 'E-commerce', count: 1 },
  { value: 'email', label: 'Email', count: 1 },
  { value: 'productivity', label: 'Productivity', count: 1 }
];

function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'error': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return Activity;
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category.toLowerCase() === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || integration.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const IntegrationCard = ({ integration }: { integration: typeof integrations[0] }) => {
    const Icon = integration.icon;
    const StatusIcon = getStatusIcon(integration.status);

    return (
      <Card className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden",
        getStatusColor(integration.status)
      )}>
        {/* Background Gradient */}
        <div className={cn(
          "absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500",
          integration.color.includes('blue') && "bg-gradient-to-br from-blue-500/30 to-cyan-500/30",
          integration.color.includes('green') && "bg-gradient-to-br from-green-500/30 to-emerald-500/30",
          integration.color.includes('purple') && "bg-gradient-to-br from-purple-500/30 to-pink-500/30"
        )} style={{ transform: 'translate(50%, -50%)' }} />

        <CardHeader className="pb-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 rounded-xl bg-gradient-to-r group-hover:scale-110 transition-transform duration-300",
                integration.color
              )}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  {integration.isPopular && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-xs">
                      Popular
                    </Badge>
                  )}
                  {integration.isNew && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-xs">
                      New
                    </Badge>
                  )}
                </div>
                <CardDescription>{integration.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-5 w-5", 
                integration.status === 'healthy' ? 'text-green-500' : 
                integration.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
              )} />
              <Badge variant="outline" className="capitalize">
                {integration.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-sm font-semibold">{integration.connections.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-sm font-semibold">{integration.successRate}%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-sm font-semibold">{integration.avgLatency}ms</p>
              <p className="text-xs text-muted-foreground">Avg Latency</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {integration.category}
            </Badge>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-3 w-3" />
              </Button>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <EnhancedAppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-primary to-purple-600 rounded-xl">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Integration Management Center</h1>
              <p className="text-muted-foreground text-lg">
                Advanced health monitoring, connection management, and integration intelligence
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
              <Monitor className="h-3 w-3 mr-1" />
              Health Monitoring
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
              <Network className="h-3 w-3 mr-1" />
              Connection Testing
            </Badge>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Analytics
            </Badge>
            <Button className="bg-gradient-to-r from-primary to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>

        {/* Professional Tabs */}
        <Tabs defaultValue="marketplace" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="my-integrations" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              My Integrations
            </TabsTrigger>
            <TabsTrigger value="health-monitor" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Health Monitor
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            {/* Advanced Search and Filters */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search integrations by name, category, or features..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-muted/50 border-none focus:bg-background"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{category.label}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {category.count}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button variant="default" size="sm" className="h-7 w-7 p-0">
                      <Layers className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <BarChart3 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Integration Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntegrations.map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>
          </TabsContent>

          {/* My Integrations Tab */}
          <TabsContent value="my-integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Integrations</CardTitle>
                <CardDescription>
                  Manage your active integrations and their configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {integrations.filter(i => ['salesforce', 'slack', 'google-sheets'].includes(i.id)).map((integration) => (
                    <IntegrationCard key={integration.id} integration={integration} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Monitor Tab - Professional Feature */}
          <TabsContent value="health-monitor" className="space-y-6">
            <IntegrationHealthMonitor />
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Templates</CardTitle>
                <CardDescription>
                  Pre-built workflow templates for each integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'Salesforce Lead Sync',
                      description: 'Automatically sync leads from forms to Salesforce',
                      integration: 'Salesforce',
                      difficulty: 'Beginner',
                      time: '5 min setup'
                    },
                    {
                      title: 'Slack Notifications',
                      description: 'Send automated notifications to Slack channels',
                      integration: 'Slack',
                      difficulty: 'Beginner',
                      time: '3 min setup'
                    },
                    {
                      title: 'Shopify Order Processing',
                      description: 'Process and fulfill Shopify orders automatically',
                      integration: 'Shopify',
                      difficulty: 'Intermediate',
                      time: '10 min setup'
                    }
                  ].map((template, index) => (
                    <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-2">{template.title}</h3>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {template.integration}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {template.difficulty}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">{template.time}</span>
                          </div>
                          <Button className="w-full group-hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feature Showcase Footer */}
        <Card className="mt-8 border-border/50 bg-gradient-to-r from-muted/50 via-background to-muted/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">Real-time health monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">Advanced connection testing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">AI-powered analytics</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Run Health Check
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </EnhancedAppLayout>
  );
}

export default withAuth(IntegrationsPage);