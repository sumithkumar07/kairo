'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Globe,
  Database,
  MessageSquare,
  CreditCard,
  Mail,
  Cloud,
  BarChart3,
  Building,
  Code,
  Activity,
  Smartphone,
  FileText,
  Headphones,
  Plus,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  color: string;
  status: 'connected' | 'available' | 'premium';
  rating: number;
  downloads: string;
  setupTime: string;
  features: string[];
  priceModel: 'free' | 'freemium' | 'premium';
  verified: boolean;
}

const integrations: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Complete CRM integration with leads, contacts, opportunities, and custom objects',
    category: 'CRM',
    icon: Database,
    color: 'bg-blue-500',
    status: 'connected',
    rating: 4.9,
    downloads: '2.1M',
    setupTime: '5 min',
    features: ['Lead Management', 'Opportunity Tracking', 'Custom Objects', 'Bulk Operations'],
    priceModel: 'free',
    verified: true
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication automation with channels, direct messages, and bot interactions',
    category: 'Communication',
    icon: MessageSquare,
    color: 'bg-green-500',
    status: 'connected',
    rating: 4.8,
    downloads: '1.8M',
    setupTime: '2 min',
    features: ['Channel Messages', 'Direct Messages', 'File Uploads', 'Interactive Buttons'],
    priceModel: 'free',
    verified: true
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'E-commerce automation for orders, products, customers, and inventory management',
    category: 'E-commerce',
    icon: CreditCard,
    color: 'bg-purple-500',
    status: 'available',
    rating: 4.7,
    downloads: '956K',
    setupTime: '10 min',
    features: ['Order Processing', 'Inventory Sync', 'Customer Data', 'Product Management'],
    priceModel: 'freemium',
    verified: true
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Cloud storage integration for file uploads, downloads, and data archiving',
    category: 'Cloud',
    icon: Cloud,
    color: 'bg-orange-500',
    status: 'available',
    rating: 4.9,
    downloads: '1.3M',
    setupTime: '8 min',
    features: ['File Upload', 'Bulk Operations', 'Lifecycle Management', 'Access Control'],
    priceModel: 'free',
    verified: true
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Web analytics integration for tracking events, conversions, and user behavior',
    category: 'Analytics',
    icon: BarChart3,
    color: 'bg-indigo-500',
    status: 'available',
    rating: 4.6,
    downloads: '743K',
    setupTime: '15 min',
    features: ['Event Tracking', 'Goal Conversions', 'Custom Dimensions', 'Real-time Data'],
    priceModel: 'free',
    verified: true
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Marketing and sales automation with contacts, deals, and campaign tracking',
    category: 'CRM',
    icon: Building,
    color: 'bg-orange-600',
    status: 'available',
    rating: 4.8,
    downloads: '821K',
    setupTime: '7 min',
    features: ['Contact Management', 'Deal Pipeline', 'Email Campaigns', 'Analytics'],
    priceModel: 'freemium',
    verified: true
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing integration for subscriptions, invoices, and transactions',
    category: 'Payments',
    icon: CreditCard,
    color: 'bg-blue-600',
    status: 'premium',
    rating: 4.9,
    downloads: '654K',
    setupTime: '12 min',
    features: ['Payment Processing', 'Subscription Management', 'Invoice Generation', 'Webhooks'],
    priceModel: 'premium',
    verified: true
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing automation with campaigns, lists, and audience segmentation',
    category: 'Marketing',
    icon: Mail,
    color: 'bg-yellow-600',
    status: 'available',
    rating: 4.5,
    downloads: '567K',
    setupTime: '6 min',
    features: ['Email Campaigns', 'List Management', 'Audience Segmentation', 'Analytics'],
    priceModel: 'freemium',
    verified: true
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code repository integration for issues, pull requests, and repository management',
    category: 'Development',
    icon: Code,
    color: 'bg-gray-600',
    status: 'available',
    rating: 4.8,
    downloads: '432K',
    setupTime: '5 min',
    features: ['Issue Management', 'Pull Requests', 'Repository Actions', 'Webhooks'],
    priceModel: 'free',
    verified: true
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Productivity integration for pages, databases, and collaborative workspaces',
    category: 'Productivity',
    icon: FileText,
    color: 'bg-gray-500',
    status: 'available',
    rating: 4.7,
    downloads: '389K',
    setupTime: '8 min',
    features: ['Page Creation', 'Database Operations', 'Block Management', 'Sharing'],
    priceModel: 'free',
    verified: true
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Customer support integration for tickets, users, and help desk automation',
    category: 'Support',
    icon: Headphones,
    color: 'bg-green-600',
    status: 'available',
    rating: 4.6,
    downloads: '298K',
    setupTime: '10 min',
    features: ['Ticket Management', 'User Support', 'Knowledge Base', 'Automation Rules'],
    priceModel: 'freemium',
    verified: true
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Communication API for SMS, voice calls, and messaging automation',
    category: 'Communication',
    icon: Smartphone,
    color: 'bg-red-500',
    status: 'premium',
    rating: 4.7,
    downloads: '267K',
    setupTime: '15 min',
    features: ['SMS Messaging', 'Voice Calls', 'WhatsApp Integration', 'Phone Verification'],
    priceModel: 'premium',
    verified: true
  }
];

const categories = [
  { id: 'all', name: 'All Integrations', count: integrations.length },
  { id: 'CRM', name: 'CRM', count: integrations.filter(i => i.category === 'CRM').length },
  { id: 'Communication', name: 'Communication', count: integrations.filter(i => i.category === 'Communication').length },
  { id: 'E-commerce', name: 'E-commerce', count: integrations.filter(i => i.category === 'E-commerce').length },
  { id: 'Cloud', name: 'Cloud Storage', count: integrations.filter(i => i.category === 'Cloud').length },
  { id: 'Analytics', name: 'Analytics', count: integrations.filter(i => i.category === 'Analytics').length },
  { id: 'Marketing', name: 'Marketing', count: integrations.filter(i => i.category === 'Marketing').length }
];

export function IntegrationMarketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [filteredIntegrations, setFilteredIntegrations] = useState(integrations);

  useEffect(() => {
    let filtered = integrations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(integration => integration.category === selectedCategory);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(integration => integration.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => parseFloat(b.downloads) - parseFloat(a.downloads));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredIntegrations(filtered);
  }, [searchTerm, selectedCategory, statusFilter, sortBy]);

  const handleConnect = async (integrationId: string) => {
    // Simulate connection process
    console.log('Connecting to integration:', integrationId);
    // Here you would typically make an API call to initiate OAuth flow
  };

  const handleDisconnect = async (integrationId: string) => {
    // Simulate disconnection process
    console.log('Disconnecting from integration:', integrationId);
  };

  const IntegrationCard = ({ integration }: { integration: Integration }) => (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <integration.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{integration.name}</h3>
                {integration.verified && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {integration.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {integration.downloads}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {integration.setupTime}
                </div>
              </div>
            </div>
          </div>
          <Badge variant={
            integration.status === 'connected' ? 'default' :
            integration.status === 'premium' ? 'secondary' : 'outline'
          }>
            {integration.status === 'connected' ? 'Connected' :
             integration.status === 'premium' ? 'Premium' : 'Available'}
          </Badge>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {integration.description}
        </p>

        <div className="space-y-3">
          <div>and
            <div className="text-xs font-medium text-muted-foreground mb-2">KEY FEATURES</div>
            <div className="flex flex-wrap gap-1">
              {integration.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
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

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {integration.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {integration.priceModel}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {integration.status === 'connected' ? (
                <>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDisconnect(integration.id)}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm"
                  onClick={() => handleConnect(integration.id)}
                  className={integration.status === 'premium' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {integration.status === 'premium' ? 'Upgrade & Connect' : 'Connect'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const connectedIntegrations = integrations.filter(i => i.status === 'connected');
  const availableIntegrations = integrations.filter(i => i.status !== 'connected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Integration Marketplace</h2>
          <p className="text-muted-foreground">Connect with 100+ services to supercharge your workflows</p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2">
          <Globe className="h-4 w-4 mr-2" />
          {connectedIntegrations.length} Connected
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="connected">Connected</option>
            <option value="available">Available</option>
            <option value="premium">Premium</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="connected">
            Connected ({connectedIntegrations.length})
          </TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredIntegrations.map(integration => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
          
          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No integrations found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="connected">
          <div className="space-y-6">
            {connectedIntegrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {connectedIntegrations.map(integration => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No connected integrations</h3>
                <p className="text-muted-foreground mb-4">Start by connecting your first integration</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Integrations
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.filter(c => c.id !== 'all').map(category => {
              const categoryIntegrations = integrations.filter(i => i.category === category.id);
              const connectedCount = categoryIntegrations.filter(i => i.status === 'connected').length;
              
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <Badge variant="outline">{category.count}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Connected:</span>
                        <span className="font-medium text-green-600">{connectedCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Available:</span>
                        <span className="font-medium">{category.count - connectedCount}</span>
                      </div>
                      <Progress value={(connectedCount / category.count) * 100} className="h-2" />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        View {category.name} Integrations
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}