'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  Download,
  ExternalLink,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Zap,
  Eye,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  Link,
  Unlink,
  TrendingUp,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Info,
  Users,
  BarChart,
  Globe,
  Database,
  MessageSquare,
  Mail,
  Calendar,
  FileText,
  Image,
  ShoppingCart,
  CreditCard,
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
  Calculator
} from 'lucide-react';

// Enhanced integration data with more detailed information
const enhancedIntegrations = [
  {
    id: 1,
    name: 'Salesforce',
    description: 'Leading CRM platform for sales and customer management with advanced analytics',
    icon: Database,
    category: 'CRM',
    pricing: 'Free',
    rating: 4.8,
    installs: 15600,
    status: 'connected',
    lastSync: '2 minutes ago',
    color: 'from-blue-500 to-cyan-500',
    features: ['Lead Management', 'Contact Sync', 'Opportunity Tracking', 'Custom Fields', 'Workflow Automation', 'Reports & Analytics'],
    webhook: true,
    oauth: true,
    healthScore: 98,
    monthlyUsage: 2340,
    errorRate: 0.2,
    responseTime: 150,
    version: '2.1.4',
    lastUpdated: '2024-01-15',
    supportLevel: 'Enterprise',
    compliance: ['SOC 2', 'GDPR', 'HIPAA'],
    regions: ['US', 'EU', 'APAC'],
    tags: ['Popular', 'Enterprise', 'Verified']
  },
  {
    id: 2,
    name: 'Slack',
    description: 'Team communication and collaboration platform with advanced messaging features',
    icon: MessageSquare,
    category: 'Communication',
    pricing: 'Free',
    rating: 4.9,
    installs: 23400,
    status: 'available',
    lastSync: null,
    color: 'from-green-500 to-emerald-500',
    features: ['Message Broadcasting', 'Channel Management', 'File Sharing', 'Bot Integration', 'Workflow Builder', 'Custom Apps'],
    webhook: true,
    oauth: true,
    healthScore: null,
    monthlyUsage: 0,
    errorRate: 0,
    responseTime: null,
    version: '3.2.1',
    lastUpdated: '2024-01-18',
    supportLevel: 'Premium',
    compliance: ['SOC 2', 'ISO 27001'],
    regions: ['Global'],
    tags: ['Popular', 'Real-time', 'New']
  },
  {
    id: 3,
    name: 'HubSpot',
    description: 'Inbound marketing, sales, and service platform with comprehensive automation',
    icon: Target,
    category: 'Marketing',
    pricing: 'Free',
    rating: 4.7,
    installs: 12800,
    status: 'connected',
    lastSync: '5 minutes ago',
    color: 'from-orange-500 to-red-500',
    features: ['Contact Management', 'Email Marketing', 'Lead Scoring', 'Analytics', 'Automation Workflows', 'CRM Integration'],
    webhook: true,
    oauth: true,
    healthScore: 95,
    monthlyUsage: 1850,
    errorRate: 0.5,
    responseTime: 200,
    version: '1.8.2',
    lastUpdated: '2024-01-12',
    supportLevel: 'Premium',
    compliance: ['GDPR', 'CCPA'],
    regions: ['US', 'EU'],
    tags: ['Trending', 'Marketing']
  },
  {
    id: 4,
    name: 'Shopify',
    description: 'E-commerce platform for online stores with comprehensive order management',
    icon: ShoppingCart,
    category: 'E-commerce',
    pricing: 'Free',
    rating: 4.6,
    installs: 9200,
    status: 'error',
    lastSync: '1 hour ago',
    color: 'from-purple-500 to-pink-500',
    features: ['Order Management', 'Product Sync', 'Inventory Tracking', 'Customer Data', 'Payment Processing', 'Analytics'],
    webhook: true,
    oauth: true,
    healthScore: 75,
    monthlyUsage: 980,
    errorRate: 2.8,
    responseTime: 350,
    version: '2.0.1',
    lastUpdated: '2024-01-10',
    supportLevel: 'Standard',
    compliance: ['PCI DSS', 'GDPR'],
    regions: ['Global'],
    tags: ['E-commerce', 'Issues']
  },
  {
    id: 5,
    name: 'Google Analytics',
    description: 'Web analytics and reporting platform with advanced insights and data visualization',
    icon: BarChart,
    category: 'Analytics',
    pricing: 'Free',
    rating: 4.5,
    installs: 18500,
    status: 'connected',
    lastSync: '1 minute ago',
    color: 'from-indigo-500 to-purple-500',
    features: ['Traffic Analysis', 'Conversion Tracking', 'Custom Reports', 'Real-time Data', 'Goal Setting', 'Audience Insights'],
    webhook: true,
    oauth: true,
    healthScore: 99,
    monthlyUsage: 5200,
    errorRate: 0.1,
    responseTime: 120,
    version: '4.2.0',
    lastUpdated: '2024-01-20',
    supportLevel: 'Enterprise',
    compliance: ['GDPR', 'CCPA', 'ISO 27001'],
    regions: ['Global'],
    tags: ['Popular', 'Analytics', 'Verified', 'Fast']
  },
  {
    id: 6,
    name: 'Stripe',
    description: 'Payment processing platform with advanced financial tools and comprehensive APIs',
    icon: CreditCard,
    category: 'Payments',
    pricing: 'Usage-based',
    rating: 4.8,
    installs: 14200,
    status: 'available',
    lastSync: null,
    color: 'from-blue-600 to-indigo-600',
    features: ['Payment Processing', 'Subscription Management', 'Invoice Generation', 'Financial Reports', 'Fraud Prevention', 'Multi-currency'],
    webhook: true,
    oauth: true,
    healthScore: null,
    monthlyUsage: 0,
    errorRate: 0,
    responseTime: null,
    version: '3.1.5',
    lastUpdated: '2024-01-19',
    supportLevel: 'Enterprise',
    compliance: ['PCI DSS', 'SOC 1', 'SOC 2'],
    regions: ['Global'],
    tags: ['Payments', 'Secure', 'Enterprise']
  }
];

// Status indicator component
const StatusIndicator = ({ status, healthScore, errorRate }: { 
  status: string; 
  healthScore?: number | null; 
  errorRate?: number;
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        if (healthScore && healthScore >= 95) {
          return { color: 'bg-green-500', pulse: true, label: 'Excellent' };
        } else if (healthScore && healthScore >= 85) {
          return { color: 'bg-yellow-500', pulse: false, label: 'Good' };
        } else {
          return { color: 'bg-orange-500', pulse: false, label: 'Needs Attention' };
        }
      case 'error':
        return { color: 'bg-red-500', pulse: true, label: 'Error' };
      case 'connecting':
        return { color: 'bg-blue-500', pulse: true, label: 'Connecting' };
      default:
        return { color: 'bg-gray-400', pulse: false, label: 'Available' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
        {config.pulse && (
          <div className={`absolute top-0 left-0 w-3 h-3 rounded-full ${config.color} opacity-75 animate-ping`} />
        )}
      </div>
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
};

// Enhanced integration card component
const EnhancedIntegrationCard = ({ integration }: { integration: any }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <Card className={`
      group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 
      border-border/50 hover:border-primary/20 bg-gradient-to-br from-card via-card to-card/50 
      backdrop-blur-sm overflow-hidden relative
    `}>
      {/* Background gradient overlay */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${integration.color} opacity-5 rounded-full -translate-y-16 translate-x-16`} />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 bg-gradient-to-r ${integration.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            <integration.icon className="h-7 w-7 text-white" />
          </div>
          
          <div className="flex items-center gap-2">
            <StatusIndicator 
              status={integration.status} 
              healthScore={integration.healthScore}
              errorRate={integration.errorRate}
            />
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Star className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{integration.name}</h3>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{integration.rating}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {integration.description}
            </p>
          </div>
          
          {/* Enhanced metrics section */}
          {integration.status === 'connected' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/20 rounded-lg">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Health Score</div>
                <div className="flex items-center gap-2">
                  <Progress value={integration.healthScore} className="h-2 flex-1" />
                  <span className="text-sm font-bold">{integration.healthScore}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Monthly Usage</div>
                <div className="text-sm font-bold">{integration.monthlyUsage.toLocaleString()}</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                {integration.category}
              </Badge>
              <span className="font-semibold text-green-600">{integration.pricing}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Download className="h-3 w-3" />
              <span className="text-xs">{integration.installs.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {integration.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Features preview */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Key Features</div>
            <div className="flex flex-wrap gap-1">
              {integration.features.slice(0, 3).map((feature: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs bg-primary/5">
                  {feature}
                </Badge>
              ))}
              {integration.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{integration.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {integration.status === 'connected' ? (
              <>
                <Button size="sm" variant="outline" className="flex-1">
                  <Settings className="h-3 w-3 mr-1" />
                  Configure
                </Button>
                <Button variant="outline" size="sm">
                  <Activity className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart className="h-3 w-3" />
                </Button>
              </>
            ) : integration.status === 'error' ? (
              <>
                <Button size="sm" variant="destructive" className="flex-1">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reconnect
                </Button>
                <Button variant="outline" size="sm">
                  <AlertTriangle className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" className="flex-1">
                  <Plus className="h-3 w-3 mr-1" />
                  Connect
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Info className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
          
          {/* Connection details for connected integrations */}
          {integration.status === 'connected' && integration.lastSync && (
            <div className="text-xs text-muted-foreground flex items-center justify-between pt-2 border-t border-muted/20">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Last sync: {integration.lastSync}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>{integration.responseTime}ms avg</span>
              </div>
            </div>
          )}
          
          {/* Compliance badges */}
          {integration.compliance && integration.compliance.length > 0 && (
            <div className="flex items-center gap-1 pt-2">
              <Shield className="h-3 w-3 text-muted-foreground" />
              {integration.compliance.map((cert: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                  {cert}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const EnhancedIntegrationMarketplace = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredIntegrations = enhancedIntegrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category.toLowerCase() === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || integration.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  const categories = ['all', 'crm', 'communication', 'marketing', 'e-commerce', 'analytics', 'payments'];
  const statuses = ['all', 'connected', 'available', 'error'];

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
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

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <div className="space-y-1">
                  <div className="w-4 h-0.5 bg-current"></div>
                  <div className="w-4 h-0.5 bg-current"></div>
                  <div className="w-4 h-0.5 bg-current"></div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Integration Grid */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
        : 'space-y-4'
      }>
        {filteredIntegrations.map((integration) => (
          <EnhancedIntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {/* Results summary */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {filteredIntegrations.length} of {enhancedIntegrations.length} integrations
      </div>
    </div>
  );
};