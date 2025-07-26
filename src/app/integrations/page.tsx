'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { EnhancedAppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Download,
  ExternalLink,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Globe,
  Database,
  MessageSquare,
  Mail,
  Calendar,
  FileText,
  Image,
  ShoppingCart,
  CreditCard,
  BarChart,
  Shield,
  Zap,
  Eye,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  Edit,
  Copy,
  Share,
  Bookmark,
  TrendingUp,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Info,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Bot,
  Brain,
  Target,
  Building,
  Phone,
  Video,
  Music,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Cloud,
  Package,
  Truck,
  MapPin,
  Hash,
  Code,
  GitBranch,
  Upload,
  Send,
  Bell,
  Megaphone,
  Headphones,
  Camera,
  Mic,
  PieChart,
  LineChart,
  DollarSign,
  Percent,
  Calculator,
  PuzzleIcon as Puzzle,
  Workflow,
  Link,
  Unlink
} from 'lucide-react';

// Mock data for integrations
const integrationCategories = [
  {
    id: 'popular',
    name: 'Popular Integrations',
    description: 'Most used integrations by our community',
    integrations: [
      {
        id: 1,
        name: 'Salesforce',
        description: 'Leading CRM platform for sales and customer management',
        icon: Database,
        category: 'CRM',
        pricing: 'Free',
        rating: 4.8,
        installs: 15600,
        status: 'connected',
        lastSync: '2 minutes ago',
        color: 'from-blue-500 to-cyan-500',
        features: ['Lead Management', 'Contact Sync', 'Opportunity Tracking', 'Custom Fields'],
        webhook: true,
        oauth: true
      },
      {
        id: 2,
        name: 'Slack',
        description: 'Team communication and collaboration platform',
        icon: MessageSquare,
        category: 'Communication',
        pricing: 'Free',
        rating: 4.9,
        installs: 23400,
        status: 'available',
        lastSync: null,
        color: 'from-green-500 to-emerald-500',
        features: ['Message Broadcasting', 'Channel Management', 'File Sharing', 'Bot Integration'],
        webhook: true,
        oauth: true
      },
      {
        id: 3,
        name: 'HubSpot',
        description: 'Inbound marketing, sales, and service platform',
        icon: Target,
        category: 'Marketing',
        pricing: 'Free',
        rating: 4.7,
        installs: 12800,
        status: 'connected',
        lastSync: '5 minutes ago',
        color: 'from-orange-500 to-red-500',
        features: ['Contact Management', 'Email Marketing', 'Lead Scoring', 'Analytics'],
        webhook: true,
        oauth: true
      },
      {
        id: 4,
        name: 'Shopify',
        description: 'E-commerce platform for online stores',
        icon: ShoppingCart,
        category: 'E-commerce',
        pricing: 'Free',
        rating: 4.6,
        installs: 9200,
        status: 'error',
        lastSync: '1 hour ago',
        color: 'from-purple-500 to-pink-500',
        features: ['Order Management', 'Product Sync', 'Inventory Tracking', 'Customer Data'],
        webhook: true,
        oauth: true
      }
    ]
  },
  {
    id: 'crm', 
    name: 'CRM & Sales',
    description: 'Customer relationship management tools',
    integrations: [
      {
        id: 5,
        name: 'Pipedrive',
        description: 'Sales-focused CRM for small businesses',
        icon: Database,
        category: 'CRM',
        pricing: 'Free',
        rating: 4.5,
        installs: 5600,
        status: 'available',
        lastSync: null,
        color: 'from-blue-500 to-purple-500',
        features: ['Pipeline Management', 'Activity Tracking', 'Deal Progress', 'Email Integration'],
        webhook: true,
        oauth: true
      },
      {
        id: 6,
        name: 'Zoho CRM',
        description: 'Comprehensive customer relationship management',
        icon: Building,
        category: 'CRM',
        pricing: 'Free',
        rating: 4.3,
        installs: 3400,
        status: 'available',
        lastSync: null,
        color: 'from-green-500 to-blue-500',
        features: ['Lead Management', 'Sales Forecasting', 'Workflow Automation', 'Reports'],
        webhook: true,
        oauth: true
      }
    ]
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Team collaboration and messaging tools',
    integrations: [
      {
        id: 7,
        name: 'Microsoft Teams',
        description: 'Business communication and collaboration platform',
        icon: MessageSquare,
        category: 'Communication',
        pricing: 'Free',
        rating: 4.4,
        installs: 8900,
        status: 'available',
        lastSync: null,
        color: 'from-blue-500 to-indigo-500',
        features: ['Team Chat', 'Video Calls', 'File Sharing', 'Channel Notifications'],
        webhook: true,
        oauth: true
      },
      {
        id: 8,
        name: 'Discord',
        description: 'Community and gaming communication platform',
        icon: MessageSquare,
        category: 'Communication',
        pricing: 'Free',
        rating: 4.2,
        installs: 6700,
        status: 'available',
        lastSync: null,
        color: 'from-indigo-500 to-purple-500',
        features: ['Server Management', 'Role Assignment', 'Voice Channels', 'Bot Commands'],
        webhook: true,
        oauth: true
      }
    ]
  }
];

// Mock data for connected integrations
const connectedIntegrations = [
  {
    id: 1,
    name: 'Salesforce',
    status: 'healthy',
    lastSync: '2 minutes ago',
    workflows: 12,
    monthlyExecutions: 1250,
    errorRate: 0.2,
    uptime: 99.8
  },
  {
    id: 3,
    name: 'HubSpot',
    status: 'healthy',
    lastSync: '5 minutes ago',
    workflows: 8,
    monthlyExecutions: 890,
    errorRate: 0.1,
    uptime: 99.9
  },
  {
    id: 4,
    name: 'Shopify',
    status: 'error',
    lastSync: '1 hour ago',
    workflows: 5,
    monthlyExecutions: 450,
    errorRate: 2.8,
    uptime: 97.2
  }
];

// Mock data for templates
const integrationTemplates = [
  {
    id: 1,
    name: 'Salesforce Lead to Slack Notification',
    description: 'Notify your sales team in Slack when new leads are created in Salesforce',
    integrations: ['Salesforce', 'Slack'],
    category: 'Sales',
    difficulty: 'Beginner',
    estimatedTime: '10 min',
    uses: 2300,
    rating: 4.8
  },
  {
    id: 2,
    name: 'HubSpot Contact to Google Sheets',
    description: 'Automatically sync new HubSpot contacts to a Google Sheets spreadsheet',
    integrations: ['HubSpot', 'Google Sheets'],
    category: 'Marketing',
    difficulty: 'Beginner',
    estimatedTime: '15 min',
    uses: 1890,
    rating: 4.6
  },
  {
    id: 3,
    name: 'Shopify Order to Fulfillment',
    description: 'Complete order processing workflow from Shopify to fulfillment center',
    integrations: ['Shopify', 'Email', 'Database'],
    category: 'E-commerce',
    difficulty: 'Intermediate',
    estimatedTime: '30 min',
    uses: 1560,
    rating: 4.9
  }
];

function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  // Marketplace Tab
  const MarketplaceTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Integration Marketplace</h2>
          <p className="text-muted-foreground">Discover and connect with your favorite tools and services</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2">
            <Globe className="h-4 w-4 mr-2" />
            100+ Available
          </Badge>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request Integration
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="crm">CRM</option>
                <option value="communication">Communication</option>
                <option value="marketing">Marketing</option>
                <option value="ecommerce">E-commerce</option>
                <option value="productivity">Productivity</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <div className="flex items-center gap-1 border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Categories */}
      <div className="space-y-8">
        {integrationCategories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{category.name}</h3>
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </div>
              <Badge variant="secondary">{category.integrations.length}</Badge>
            </div>
            
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {category.integrations.map((integration) => (
                <Card key={integration.id} className="cursor-pointer hover:shadow-lg transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${integration.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <integration.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.status === 'connected' && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                        {integration.status === 'error' && (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {integration.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{integration.category}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{integration.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span>{integration.installs.toLocaleString()} installs</span>
                        </div>
                        <span className="font-medium text-green-600">{integration.pricing}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {integration.features.slice(0, 2).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {integration.features.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{integration.features.length - 2}
                          </Badge>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="flex gap-2">
                        {integration.status === 'connected' ? (
                          <Button size="sm" variant="outline" className="flex-1">
                            <Settings className="h-3 w-3 mr-1" />
                            Configure
                          </Button>
                        ) : integration.status === 'error' ? (
                          <Button size="sm" variant="destructive" className="flex-1">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reconnect
                          </Button>
                        ) : (
                          <Button size="sm" className="flex-1">
                            <Plus className="h-3 w-3 mr-1" />
                            Connect
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {integration.lastSync && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Last sync: {integration.lastSync}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // My Integrations Tab
  const MyIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">My Integrations</h2>
          <p className="text-muted-foreground">Manage your connected services and their configurations</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            {connectedIntegrations.filter(i => i.status === 'healthy').length} Active
          </Badge>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
        </div>
      </div>

      {/* Integration Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Connected', value: connectedIntegrations.length, icon: Globe, color: 'text-blue-600' },
          { label: 'Healthy', value: connectedIntegrations.filter(i => i.status === 'healthy').length, icon: CheckCircle, color: 'text-green-600' },
          { label: 'With Errors', value: connectedIntegrations.filter(i => i.status === 'error').length, icon: AlertCircle, color: 'text-red-600' },
          { label: 'Total Workflows', value: connectedIntegrations.reduce((sum, i) => sum + i.workflows, 0), icon: Workflow, color: 'text-purple-600' }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connected Integrations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Connected Integrations
          </CardTitle>
          <CardDescription>Monitor and manage your active integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedIntegrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{integration.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Last sync: {integration.lastSync}</span>
                      <span>•</span>
                      <span>{integration.workflows} workflows</span>
                      <span>•</span>
                      <span>{integration.monthlyExecutions.toLocaleString()} executions/month</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${integration.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-medium capitalize">{integration.status}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {integration.uptime}% uptime
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Health Monitoring
          </CardTitle>
          <CardDescription>Real-time monitoring of integration performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {connectedIntegrations.map((integration) => (
              <div key={integration.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{integration.name}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Error Rate:</span>
                    <span className={integration.errorRate > 1 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                      {integration.errorRate}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uptime</span>
                    <span>{integration.uptime}%</span>
                  </div>
                  <Progress value={integration.uptime} className="h-2" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Workflows:</span>
                    <span className="ml-2 font-medium">{integration.workflows}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Executions:</span>
                    <span className="ml-2 font-medium">{integration.monthlyExecutions.toLocaleString()}/mo</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge 
                      variant={integration.status === 'healthy' ? 'default' : 'destructive'}
                      className="ml-2 text-xs"
                    >
                      {integration.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Templates Tab
  const TemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Integration Templates</h2>
          <p className="text-muted-foreground">Pre-built workflows for popular integration combinations</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Template Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationTemplates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base line-clamp-1">{template.name}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2 mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {template.integrations.slice(0, 3).map((integration, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {integration}
                    </Badge>
                  ))}
                  {template.integrations.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.integrations.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline">{template.difficulty}</Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{template.estimatedTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{template.uses} uses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{template.rating}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <Play className="h-3 w-3 mr-1" />
                    Use Template
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popular Template Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Popular Categories
          </CardTitle>
          <CardDescription>Browse templates by integration type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'CRM + Communication', templates: 23, icon: MessageSquare, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
              { name: 'Marketing + Analytics', templates: 18, icon: BarChart, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
              { name: 'E-commerce + Fulfillment', templates: 15, icon: ShoppingCart, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
              { name: 'Support + Ticketing', templates: 12, icon: Headphones, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
              { name: 'Finance + Accounting', templates: 9, icon: DollarSign, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' },
              { name: 'HR + Onboarding', templates: 7, icon: Users, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' }
            ].map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <category.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{category.name}</h4>
                    <p className="text-xs text-muted-foreground">{category.templates} templates</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <EnhancedAppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="marketplace" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Marketplace</span>
              </TabsTrigger>
              <TabsTrigger value="my-integrations" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                <span className="hidden sm:inline">My Integrations</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="marketplace" className="space-y-6">
            <MarketplaceTab />
          </TabsContent>

          <TabsContent value="my-integrations" className="space-y-6">
            <MyIntegrationsTab />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <TemplatesTab />
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAppLayout>
  );
}

export default withAuth(IntegrationsPage);