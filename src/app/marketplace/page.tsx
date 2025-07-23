'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import {
  Search,
  Star,
  Download,
  Eye,
  Clock,
  Users,
  Zap,
  Bot,
  Sparkles,
  Filter,
  Grid,
  List,
  TrendingUp,
  Award,
  Heart,
  Share2,
  Play,
  BookOpen,
  Workflow,
  Template,
  Crown,
  Rocket,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const featuredTemplates = [
  {
    id: '1',
    name: 'Lead Nurturing Email Sequence',
    description: 'Automatically nurture leads with personalized email sequences based on behavior',
    category: 'Marketing',
    difficulty: 'intermediate',
    duration: '15 minutes',
    rating: 4.8,
    downloads: 1250,
    author: 'Kairo Team',
    tags: ['Mailchimp', 'HubSpot', 'Salesforce'],
    featured: true,
    premium: false
  },
  {
    id: '2',
    name: 'AI-Powered Support Ticket Routing',
    description: 'Automatically categorize, prioritize, and route customer support tickets using AI',
    category: 'Customer Support',
    difficulty: 'advanced',
    duration: '20 minutes',
    rating: 4.9,
    downloads: 890,
    author: 'Kairo Team',
    tags: ['Zendesk', 'Slack', 'OpenAI'],
    featured: true,
    premium: true
  },
  {
    id: '3',
    name: 'Advanced Data Pipeline',
    description: 'Extract, transform, and load data between multiple systems with error handling',
    category: 'Data & Analytics',
    difficulty: 'advanced',
    duration: '30 minutes',
    rating: 4.9,
    downloads: 756,
    author: 'Community',
    tags: ['PostgreSQL', 'AWS S3', 'Snowflake'],
    featured: true,
    premium: true
  }
];

const communityTemplates = [
  {
    id: '4',
    name: 'Social Media Content Scheduler',
    description: 'Schedule and post content across multiple social media platforms',
    category: 'Marketing',
    difficulty: 'beginner',
    duration: '10 minutes',
    rating: 4.6,
    downloads: 2340,
    author: 'Sarah Chen',
    tags: ['Twitter', 'LinkedIn', 'Buffer'],
    featured: false,
    premium: false
  },
  {
    id: '5',
    name: 'Invoice Processing Automation',
    description: 'Extract data from invoices and update accounting systems automatically',
    category: 'Finance',
    difficulty: 'intermediate',
    duration: '25 minutes',
    rating: 4.7,
    downloads: 892,
    author: 'Mike Johnson',
    tags: ['QuickBooks', 'Stripe', 'AI OCR'],
    featured: false,
    premium: false
  },
  {
    id: '6',
    name: 'Team Onboarding Workflow',
    description: 'Automate new employee onboarding with tasks, documentation, and notifications',
    category: 'HR & Operations',
    difficulty: 'intermediate',
    duration: '20 minutes',
    rating: 4.5,
    downloads: 567,
    author: 'Lisa Rodriguez',
    tags: ['Slack', 'Google Workspace', 'Notion'],
    featured: false,
    premium: false
  }
];

const aiGeneratedWorkflows = [
  {
    id: 'ai-1',
    name: 'Weather-Based Marketing Campaigns',
    description: 'AI-generated workflow that adjusts marketing campaigns based on weather patterns',
    category: 'Marketing',
    difficulty: 'intermediate',
    duration: '18 minutes',
    rating: 4.7,
    downloads: 234,
    author: 'AI Assistant',
    tags: ['Weather API', 'Mailchimp', 'AI Logic'],
    aiGenerated: true,
    premium: false
  },
  {
    id: 'ai-2',
    name: 'Smart Inventory Management',
    description: 'AI-powered inventory optimization with predictive reordering',
    category: 'E-commerce',
    difficulty: 'advanced',
    duration: '35 minutes',
    rating: 4.8,
    downloads: 145,
    author: 'AI Assistant',
    tags: ['Shopify', 'AI Prediction', 'Inventory'],
    aiGenerated: true,
    premium: true
  }
];

const myWorkflows = [
  {
    id: 'my-1',
    name: 'Daily Sales Report',
    description: 'My custom workflow for generating daily sales reports',
    category: 'Personal',
    lastModified: '2 hours ago',
    status: 'active',
    runs: 45,
    successRate: 98.2
  },
  {
    id: 'my-2',
    name: 'Customer Feedback Analysis',
    description: 'Analyze customer feedback and extract insights',
    category: 'Personal',
    lastModified: '1 day ago',
    status: 'paused',
    runs: 23,
    successRate: 95.7
  }
];

function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    'all', 'Marketing', 'Customer Support', 'Data & Analytics', 
    'Finance', 'HR & Operations', 'E-commerce', 'Personal'
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'paused': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'error': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const renderTemplateCard = (template: any, showAuthor = true) => (
    <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-bold line-clamp-1">
                {template.name}
              </CardTitle>
              {template.featured && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {template.premium && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              )}
              {template.aiGenerated && (
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <Bot className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2 text-sm">
              {template.description}
            </CardDescription>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3">
          <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
            {template.difficulty}
          </Badge>
          <Badge variant="outline" className="bg-primary/10">
            {template.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{template.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-muted-foreground" />
            <span>{template.downloads?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span>{template.rating}</span>
          </div>
          {showAuthor && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{template.author}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Integrations</p>
          <div className="flex flex-wrap gap-1">
            {template.tags?.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags?.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Download className="h-4 w-4 mr-2" />
              Use Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderMyWorkflowCard = (workflow: any) => (
    <Card key={workflow.id} className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-bold">
                {workflow.name}
              </CardTitle>
              <Badge className={getStatusColor(workflow.status)}>
                {workflow.status}
              </Badge>
            </div>
            <CardDescription className="text-sm">
              {workflow.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Total Runs</p>
            <p className="font-semibold">{workflow.runs}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Success Rate</p>
            <p className="font-semibold text-green-600">{workflow.successRate}%</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Last Modified</p>
            <p className="font-semibold">{workflow.lastModified}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <Badge variant="outline" className="bg-primary/10">
            {workflow.category}
          </Badge>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/workflow/${workflow.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Run
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 rounded-2xl" />
          <div className="relative p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gradient-to-r from-primary to-purple-600 rounded-xl">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Workflow Marketplace
                </h1>
                <p className="text-xl text-muted-foreground mt-2">
                  Discover, create, and share powerful automation workflows
                </p>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  <span>1,200+ Templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>50k+ Downloads</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>Expert Curated</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates, workflows, and integrations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="ai-generated" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Generated
            </TabsTrigger>
            <TabsTrigger value="my-workflows" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              My Workflows
            </TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {featuredTemplates.map(template => renderTemplateCard(template))}
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {communityTemplates.map(template => renderTemplateCard(template))}
            </div>
          </TabsContent>

          <TabsContent value="ai-generated" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {aiGeneratedWorkflows.map(template => renderTemplateCard(template))}
            </div>
          </TabsContent>

          <TabsContent value="my-workflows" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {myWorkflows.map(workflow => renderMyWorkflowCard(workflow))}
            </div>
            
            {myWorkflows.length === 0 && (
              <Card className="text-center py-16">
                <CardContent>
                  <div className="p-4 bg-primary/10 rounded-full inline-block mb-6">
                    <Workflow className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No workflows yet</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Create your first workflow to get started
                  </p>
                  <Button size="lg" asChild>
                    <Link href="/workflow">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Workflow
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(MarketplacePage);