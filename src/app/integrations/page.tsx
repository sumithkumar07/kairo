'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Globe,
  Search,
  Filter,
  Star,
  Download,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Zap,
  Database,
  Cloud,
  Mail,
  MessageSquare,
  ShoppingCart,
  FileText,
  Calendar,
  Activity,
  BarChart3,
  CreditCard,
  Shield,
  Key,
  Plus,
  Trash2,
  Edit3,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Webhook,
  Code,
  Terminal,
  Smartphone,
  Monitor,
  Network,
  Lock,
  Unlock,
  AlertTriangle,
  Info,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  Play,
  Pause,
  Square,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

// Integration Management Center - Unified integration management
// This combines marketplace, my integrations, templates, and settings

// Sample integration data
const availableIntegrations = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect with Salesforce CRM for lead management and customer data sync',
    category: 'CRM',
    icon: '⚡',
    rating: 4.9,
    installs: '25.4k',
    verified: true,
    pricing: 'Free',
    status: 'available',
    features: ['Lead Management', 'Contact Sync', 'Opportunity Tracking', 'Custom Fields'],
    useCase: 'Sales automation and CRM integration'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications, messages, and alerts to Slack channels and users',
    category: 'Communication',
    icon: '📱',
    rating: 4.8,
    installs: '31.2k',
    verified: true,
    pricing: 'Free',
    status: 'installed',
    features: ['Channel Messages', 'Direct Messages', 'File Sharing', 'Custom Webhooks'],
    useCase: 'Team communication and notifications'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Manage products, orders, and customer data from your Shopify store',
    category: 'E-commerce',
    icon: '🛒',
    rating: 4.7,
    installs: '18.9k',
    verified: true,
    pricing: 'Free',
    status: 'available',
    features: ['Order Management', 'Product Sync', 'Inventory Updates', 'Customer Data'],
    useCase: 'E-commerce automation and order processing'
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Read from and write to Google Sheets for data management and reporting',
    category: 'Productivity',
    icon: '📊',
    rating: 4.9,
    installs: '42.1k',
    verified: true,
    pricing: 'Free',
    status: 'installed',
    features: ['Read Data', 'Write Data', 'Create Sheets', 'Format Cells'],
    useCase: 'Data management and reporting'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync contacts, deals, and marketing data with HubSpot CRM',
    category: 'CRM',
    icon: '🎯',
    rating: 4.8,
    installs: '16.7k',
    verified: true,
    pricing: 'Free',
    status: 'available',
    features: ['Contact Management', 'Deal Tracking', 'Email Marketing', 'Analytics'],
    useCase: 'Marketing automation and CRM'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments, manage subscriptions, and handle billing workflows',
    category: 'Payments',
    icon: '💳',
    rating: 4.9,
    installs: '12.3k',
    verified: true,
    pricing: 'Free',
    status: 'available',
    features: ['Payment Processing', 'Subscription Management', 'Invoice Generation', 'Webhook Handling'],
    useCase: 'Payment processing and billing automation'
  }
];

const myIntegrations = availableIntegrations.filter(integration => integration.status === 'installed');

const integrationTemplates = [
  {
    id: 'lead-to-slack',
    name: 'New Lead to Slack Notification',
    description: 'Automatically notify your sales team in Slack when new leads are added to Salesforce',
    integrations: ['Salesforce', 'Slack'],
    category: 'Sales',
    difficulty: 'Easy',
    estimatedTime: '5 min',
    uses: 1247,
    rating: 4.8
  },
  {
    id: 'order-to-sheets',
    name: 'Shopify Orders to Google Sheets',
    description: 'Log new Shopify orders to a Google Sheets spreadsheet for tracking and analysis',
    integrations: ['Shopify', 'Google Sheets'],
    category: 'E-commerce',
    difficulty: 'Easy',
    estimatedTime: '10 min',
    uses: 892,
    rating: 4.7
  },
  {
    id: 'payment-processing',
    name: 'Automated Payment Processing',
    description: 'Process Stripe payments and update customer records in HubSpot',
    integrations: ['Stripe', 'HubSpot'],
    category: 'Payments',
    difficulty: 'Medium',
    estimatedTime: '15 min',
    uses: 634,
    rating: 4.9
  }
];

const webhookEndpoints = [
  {
    id: 'webhook-1',
    name: 'Salesforce Leads Webhook',
    url: 'https://api.kairo.com/webhooks/sf-leads-abc123',
    integration: 'Salesforce',
    status: 'active',
    lastTriggered: '2 hours ago',
    triggers: 1247
  },
  {
    id: 'webhook-2',
    name: 'Stripe Payments Webhook',
    url: 'https://api.kairo.com/webhooks/stripe-pay-def456',
    integration: 'Stripe',
    status: 'active',
    lastTriggered: '30 minutes ago',
    triggers: 856
  }
];

const apiKeys = [
  {
    id: 'sf-key',
    integration: 'Salesforce',
    name: 'Production API Key',
    key: 'sf_live_••••••••••••••••••••••••••••••••••••••••••••••••8f2a',
    created: '2024-12-15',
    lastUsed: '2 hours ago',
    status: 'active'
  },
  {
    id: 'stripe-key',
    integration: 'Stripe',
    name: 'Stripe Secret Key',
    key: 'sk_live_••••••••••••••••••••••••••••••••••••••••••••••••9c1b',
    created: '2024-12-20',
    lastUsed: '30 minutes ago',
    status: 'active'
  }
];

function IntegrationManagementCenter() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showApiKey, setShowApiKey] = useState({});

  const categories = ['All', 'CRM', 'Communication', 'E-commerce', 'Productivity', 'Payments', 'Marketing'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': 
      case 'installed': 
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error': 
      case 'inactive': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'paused': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Hard': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredIntegrations = availableIntegrations.filter(integration => {
    if (categoryFilter !== 'all' && integration.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (searchTerm && !integration.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !integration.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Integration <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Center</span>
            </h1>
            <p className="text-muted-foreground">
              Complete integration lifecycle management - marketplace, connections, templates, and settings
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Badge variant="outline" className="flex items-center gap-2">
              <Globe className="h-3 w-3" />
              {myIntegrations.length} Connected
            </Badge>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Config
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>

        {/* Integration Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{myIntegrations.length}</div>
                  <div className="text-sm text-muted-foreground">Active Integrations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{availableIntegrations.length}</div>
                  <div className="text-sm text-muted-foreground">Available Apps</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Webhook className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{webhookEndpoints.length}</div>
                  <div className="text-sm text-muted-foreground">Webhook Endpoints</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Key className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{apiKeys.length}</div>
                  <div className="text-sm text-muted-foreground">API Keys</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs 
          value={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') || activeTab : activeTab}
          onValueChange={setActiveTab} 
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="my-integrations">My Integrations</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Marketplace Tab - Available integrations */}
          <TabsContent value="marketplace" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Integration Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntegrations.map((integration) => (
                <Card key={integration.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{integration.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            {integration.verified && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {integration.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {integration.rating}
                        </div>
                        <div className="text-xs text-muted-foreground">{integration.installs}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-2">
                      {integration.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {integration.features.slice(0, 2).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {integration.features.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{integration.features.length - 2} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(integration.status)}>
                            {integration.status === 'installed' ? 'Connected' : 'Available'}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">
                            {integration.pricing}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            View Details
                          </Button>
                          <Button size="sm">
                            {integration.status === 'installed' ? 'Configure' : 'Install'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Integrations Tab - Connected services */}
          <TabsContent value="my-integrations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Connected Integrations</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </div>

            {/* Connected Integrations */}
            <div className="space-y-4">
              {myIntegrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{integration.icon}</div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg">{integration.name}</h3>
                            <Badge className={getStatusColor('active')}>
                              Connected
                            </Badge>
                            {integration.verified && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {integration.useCase}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold">98.2%</div>
                          <div className="text-xs text-muted-foreground">Success Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">245ms</div>
                          <div className="text-xs text-muted-foreground">Avg Latency</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Activity className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Integration Health */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Health</CardTitle>
                <CardDescription>Monitor the performance of your connected integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myIntegrations.map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <div>
                          <div className="font-medium">{integration.name}</div>
                          <div className="text-sm text-muted-foreground">Last sync: 2 minutes ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">1,247</div>
                          <div className="text-muted-foreground">Requests</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">99.1%</div>
                          <div className="text-muted-foreground">Success</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">120ms</div>
                          <div className="text-muted-foreground">Latency</div>
                        </div>
                        <Badge className="text-green-600 bg-green-100">
                          Healthy
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab - Pre-built integration workflows */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Integration Templates</h2>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>

            {/* Template Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrationTemplates.map((template) => (
                <Card key={template.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {template.rating}
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight mb-2">
                      {template.name}
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {template.integrations.map((integration, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {integration}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
                            {template.difficulty}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {template.estimatedTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {template.uses}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Preview
                        </Button>
                        <Button size="sm" className="flex-1">
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - API keys & configurations */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* API Keys Section */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>API Keys</CardTitle>
                      <CardDescription>
                        Manage API keys for your integrations
                      </CardDescription>
                    </div>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Key
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Key className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{apiKey.integration}</p>
                              <p className="text-sm text-muted-foreground">{apiKey.name}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(apiKey.status)}>
                            {apiKey.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Input 
                              value={showApiKey[apiKey.id] ? apiKey.key.replace('•', 'x') : apiKey.key}
                              readOnly 
                              className="font-mono text-sm"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleApiKeyVisibility(apiKey.id)}
                            >
                              {showApiKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Last used: {apiKey.lastUsed}</span>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Webhook Endpoints */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Webhook Endpoints</CardTitle>
                      <CardDescription>
                        Manage webhook endpoints for real-time data sync
                      </CardDescription>
                    </div>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Webhook
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {webhookEndpoints.map((webhook) => (
                      <div key={webhook.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                              <Webhook className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                              <p className="font-semibold">{webhook.name}</p>
                              <p className="text-sm text-muted-foreground">{webhook.integration}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(webhook.status)}>
                            {webhook.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Input 
                              value={webhook.url}
                              readOnly 
                              className="font-mono text-sm"
                            />
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-muted-foreground">
                              <span>Last triggered: {webhook.lastTriggered}</span>
                              <span>Total triggers: {webhook.triggers}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Integration Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>Global settings for all integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-retry failed requests</p>
                    <p className="text-sm text-muted-foreground">Automatically retry failed API requests up to 3 times</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rate limit protection</p>
                    <p className="text-sm text-muted-foreground">Automatically pause requests when rate limits are hit</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Debug logging</p>
                    <p className="text-sm text-muted-foreground">Enable detailed logging for troubleshooting</p>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-2">
                  <Label>Request timeout (seconds)</Label>
                  <Input type="number" defaultValue="30" className="w-24" />
                  <p className="text-sm text-muted-foreground">Maximum time to wait for API responses</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(IntegrationManagementCenter);