'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { EnhancedAppLayout } from '@/components/enhanced-app-layout';
import { withAuth } from '@/components/auth/with-auth';
import {
  Search,
  BookOpen,
  Code,
  Video,
  Users,
  HelpCircle,
  FileText,
  ExternalLink,
  Play,
  Star,
  Clock,
  Eye,
  Download,
  Copy,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share,
  Filter,
  Grid,
  List,
  Zap,
  Brain,
  Workflow,
  Globe,
  Shield,
  Target,
  Rocket,
  Settings,
  Database,
  Mail,
  Calendar,
  Bell,
  Award,
  GraduationCap,
  ChevronRight,
  ArrowRight,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Bot,
  Headphones,
  Phone,
  Send,
  Hash,
  TrendingUp
} from 'lucide-react';

// Mock data for documentation
const documentationSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    description: 'Learn the basics of Kairo automation',
    articles: [
      { id: 1, title: 'Quick Start Guide', readTime: '5 min', difficulty: 'Beginner', views: 12500 },
      { id: 2, title: 'Creating Your First Workflow', readTime: '10 min', difficulty: 'Beginner', views: 8900 },
      { id: 3, title: 'Understanding Triggers and Actions', readTime: '8 min', difficulty: 'Beginner', views: 7200 },
      { id: 4, title: 'Dashboard Overview', readTime: '6 min', difficulty: 'Beginner', views: 5400 }
    ]
  },
  {
    id: 'workflows',
    title: 'Workflow Builder',
    icon: Workflow,
    description: 'Master the visual workflow editor',
    articles: [
      { id: 5, title: 'Advanced Node Configuration', readTime: '15 min', difficulty: 'Intermediate', views: 4300 },
      { id: 6, title: 'Conditional Logic and Branching', readTime: '12 min', difficulty: 'Intermediate', views: 3800 },
      { id: 7, title: 'Error Handling and Recovery', readTime: '18 min', difficulty: 'Advanced', views: 2100 },
      { id: 8, title: 'Performance Optimization', readTime: '20 min', difficulty: 'Advanced', views: 1900 }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: Globe,
    description: 'Connect with external services',
    articles: [
      { id: 9, title: 'Setting Up Salesforce Integration', readTime: '12 min', difficulty: 'Intermediate', views: 6700 },
      { id: 10, title: 'Slack Bot Configuration', readTime: '8 min', difficulty: 'Beginner', views: 5200 },
      { id: 11, title: 'Custom API Integrations', readTime: '25 min', difficulty: 'Advanced', views: 3100 },
      { id: 12, title: 'Webhook Security Best Practices', readTime: '14 min', difficulty: 'Intermediate', views: 2800 }
    ]
  },
  {
    id: 'ai-features',
    title: 'AI Features',
    icon: Brain,
    description: 'Leverage AI-powered automation',
    articles: [
      { id: 13, title: 'AI Workflow Generation', readTime: '10 min', difficulty: 'Beginner', views: 9200 },
      { id: 14, title: 'Natural Language Processing', readTime: '16 min', difficulty: 'Intermediate', views: 4600 },
      { id: 15, title: 'Machine Learning Models', readTime: '22 min', difficulty: 'Advanced', views: 2300 },
      { id: 16, title: 'AI Agent Configuration', readTime: '18 min', difficulty: 'Advanced', views: 1800 }
    ]
  }
];

// Mock data for API documentation
const apiEndpoints = [
  {
    method: 'GET',
    path: '/api/workflows',
    description: 'List all workflows',
    category: 'Workflows'
  },
  {
    method: 'POST',
    path: '/api/workflows',
    description: 'Create a new workflow',
    category: 'Workflows'
  },
  {
    method: 'GET',
    path: '/api/workflows/{id}/runs',
    description: 'Get workflow execution history',
    category: 'Workflows'
  },
  {
    method: 'POST',
    path: '/api/workflows/{id}/trigger',
    description: 'Manually trigger a workflow',
    category: 'Workflows'
  },
  {
    method: 'GET',
    path: '/api/integrations',
    description: 'List available integrations',
    category: 'Integrations'
  },
  {
    method: 'POST',
    path: '/api/integrations/{id}/connect',
    description: 'Connect to an integration',
    category: 'Integrations'
  },
  {
    method: 'GET',
    path: '/api/user/profile',
    description: 'Get user profile information',
    category: 'User'
  },
  {
    method: 'PUT',
    path: '/api/user/profile',
    description: 'Update user profile',
    category: 'User'
  }
];

// Mock data for tutorials
const tutorials = [
  {
    id: 1,
    title: 'Building a Lead Nurturing Campaign',
    description: 'Learn how to create an automated email sequence that nurtures leads from sign-up to conversion',
    duration: '25 min',
    difficulty: 'Intermediate',
    category: 'Marketing',
    thumbnail: '/tutorials/lead-nurturing.jpg',
    views: 15600,
    rating: 4.8,
    lastUpdated: '2024-01-15'
  },
  {
    id: 2,
    title: 'Customer Support Ticket Automation',
    description: 'Automate ticket routing, prioritization, and response workflows for better customer service',
    duration: '18 min',
    difficulty: 'Beginner',
    category: 'Support',
    thumbnail: '/tutorials/support-automation.jpg',
    views: 12300,
    rating: 4.9,
    lastUpdated: '2024-01-12'
  },
  {
    id: 3,
    title: 'E-commerce Order Processing Pipeline',
    description: 'Set up end-to-end order processing from purchase to fulfillment and customer notifications',
    duration: '35 min',
    difficulty: 'Advanced',
    category: 'E-commerce',
    thumbnail: '/tutorials/ecommerce-pipeline.jpg',
    views: 8900,
    rating: 4.7,
    lastUpdated: '2024-01-08'
  },
  {
    id: 4,
    title: 'AI-Powered Content Generation',
    description: 'Use AI agents to automatically generate and distribute content across multiple channels',
    duration: '22 min',
    difficulty: 'Intermediate',
    category: 'AI',
    thumbnail: '/tutorials/ai-content.jpg',
    views: 11200,
    rating: 4.6,
    lastUpdated: '2024-01-10'
  }
];

// Mock data for community discussions
const communityPosts = [
  {
    id: 1,
    title: 'Best practices for error handling in complex workflows?',
    author: 'sarah_dev',
    category: 'Workflows',
    replies: 23,
    likes: 45,
    views: 1200,
    lastActivity: '2 hours ago',
    tags: ['error-handling', 'best-practices', 'workflows']
  },
  {
    id: 2,
    title: 'How to integrate with custom REST APIs',
    author: 'mike_automation',
    category: 'Integrations',
    replies: 15,
    likes: 32,
    views: 890,
    lastActivity: '4 hours ago',
    tags: ['api', 'integrations', 'rest']
  },
  {
    id: 3,
    title: 'Sharing my multi-channel marketing automation template',
    author: 'marketing_guru',
    category: 'Templates',
    replies: 41,
    likes: 78,
    views: 2100,
    lastActivity: '1 day ago',
    tags: ['marketing', 'templates', 'multi-channel']
  }
];

function HelpPage() {
  const [activeTab, setActiveTab] = useState('getting-started');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('getting-started');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Getting Started Tab
  const GettingStartedTab = () => (
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Welcome to Kairo Help Center</h2>
        <p className="text-muted-foreground text-lg mb-8">
          Everything you need to know to build powerful automations with Kairo's AI-powered platform
        </p>
        
        {/* Quick Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-12"
          />
        </div>
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Quick Start',
            description: 'Get up and running in 5 minutes',
            icon: Rocket,
            color: 'from-blue-500 to-cyan-500',
            link: '#quick-start'
          },
          {
            title: 'Video Tutorials',
            description: 'Step-by-step video guides',
            icon: Video,
            color: 'from-purple-500 to-pink-500',
            link: '#tutorials'
          },
          {
            title: 'API Docs',
            description: 'Complete API reference',
            icon: Code,
            color: 'from-green-500 to-emerald-500',
            link: '#api'
          },
          {
            title: 'Community',
            description: 'Connect with other users',
            icon: Users,
            color: 'from-orange-500 to-red-500',
            link: '#community'
          }
        ].map((card, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-all group">
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
              <p className="text-muted-foreground text-sm">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popular Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trending className="h-5 w-5" />
            Popular Articles
          </CardTitle>
          <CardDescription>Most viewed help articles this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: 'How to create your first workflow', views: '12.5K', category: 'Getting Started' },
              { title: 'Setting up Slack integration', views: '8.9K', category: 'Integrations' },
              { title: 'AI workflow generation guide', views: '7.2K', category: 'AI Features' },
              { title: 'Troubleshooting common errors', views: '5.4K', category: 'Troubleshooting' }
            ].map((article, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded text-primary text-xs font-semibold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="text-sm text-muted-foreground">{article.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{article.views}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Need More Help?
          </CardTitle>
          <CardDescription>Can't find what you're looking for? Our support team is here to help</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>Live Chat</span>
              <span className="text-xs opacity-80">Average response: 2 min</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Mail className="h-5 w-5" />
              <span>Email Support</span>
              <span className="text-xs opacity-80">Response within 4 hours</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Phone className="h-5 w-5" />
              <span>Schedule Call</span>
              <span className="text-xs opacity-80">Book a 30-min session</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Documentation Tab
  const DocumentationTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Documentation</h2>
          <p className="text-muted-foreground">Complete guides and references for Kairo platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmark
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {documentationSections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <button
                      onClick={() => setSelectedSection(section.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                        selectedSection === section.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                      }`}
                    >
                      <section.icon className="h-4 w-4" />
                      <span className="font-medium">{section.title}</span>
                    </button>
                    {selectedSection === section.id && (
                      <div className="ml-6 space-y-1">
                        {section.articles.map((article) => (
                          <button
                            key={article.id}
                            className="w-full text-left p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded transition-colors"
                          >
                            {article.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {documentationSections.map((section) => (
            selectedSection === section.id && (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.articles.map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{article.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{article.readTime}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {article.difficulty}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      </div>
    </div>
  );

  // API Reference Tab
  const APITab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">API Reference</h2>
          <p className="text-muted-foreground">Complete API documentation with examples and code samples</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download OpenAPI Spec
          </Button>
          <Button size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Try in Postman
          </Button>
        </div>
      </div>

      {/* API Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Authentication',
            description: 'API keys, OAuth 2.0, and JWT tokens',
            icon: Shield,
            color: 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20'
          },
          {
            title: 'Rate Limits',
            description: '1000 requests/hour for free tier',
            icon: Zap,
            color: 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20'
          },
          {
            title: 'Webhooks',
            description: 'Real-time event notifications',
            icon: Bell,
            color: 'border-green-200 bg-green-50/50 dark:bg-green-950/20'
          }
        ].map((card, index) => (
          <Card key={index} className={card.color}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <card.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </div>
              <p className="text-muted-foreground text-sm">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            API Endpoints
          </CardTitle>
          <CardDescription>All available REST API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(
              apiEndpoints.reduce((acc, endpoint) => {
                if (!acc[endpoint.category]) acc[endpoint.category] = [];
                acc[endpoint.category].push(endpoint);
                return acc;
              }, {} as Record<string, typeof apiEndpoints>)
            ).map(([category, endpoints]) => (
              <div key={category}>
                <h4 className="font-semibold mb-3 text-lg">{category}</h4>
                <div className="space-y-2">
                  {endpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={endpoint.method === 'GET' ? 'default' : endpoint.method === 'POST' ? 'destructive' : 'secondary'}
                          className="font-mono text-xs w-16 justify-center"
                        >
                          {endpoint.method}
                        </Badge>
                        <div>
                          <code className="font-mono text-sm">{endpoint.path}</code>
                          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Examples
          </CardTitle>
          <CardDescription>Sample requests and responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Create a Workflow</h4>
                <Button variant="ghost" size="sm">
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
                <code>{`curl -X POST https://api.kairo.ai/v1/workflows \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Welcome Email Sequence",
    "description": "Automated welcome email for new users",
    "trigger": {
      "type": "webhook",
      "url": "https://your-app.com/webhook"
    },
    "actions": [
      {
        "type": "send_email",
        "template": "welcome_email",
        "delay": 0
      }
    ]
  }'`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Tutorials Tab
  const TutorialsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Video Tutorials</h2>
          <p className="text-muted-foreground">Step-by-step video guides to master Kairo automation</p>
        </div>
        <div className="flex items-center gap-3">
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
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            <option value="marketing">Marketing</option>
            <option value="support">Support</option>
            <option value="ecommerce">E-commerce</option>
            <option value="ai">AI Features</option>
          </select>
        </div>
      </div>

      {/* Featured Tutorial */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <Badge className="mb-3">Featured Tutorial</Badge>
              <h3 className="text-2xl font-bold mb-2">Complete Automation Masterclass</h3>
              <p className="text-muted-foreground mb-4">
                Learn everything from basic workflows to advanced AI-powered automations in this comprehensive 2-hour course.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>2h 15min</span>
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>Advanced</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>23.5K views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9</span>
                </div>
              </div>
              <Button size="lg">
                <Play className="h-4 w-4 mr-2" />
                Watch Now
              </Button>
            </div>
            <div className="bg-muted/50 rounded-lg h-48 flex items-center justify-center">
              <Play className="h-16 w-16 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {tutorials.map((tutorial) => (
          <Card key={tutorial.id} className="cursor-pointer hover:shadow-lg transition-all">
            <CardContent className="p-0">
              <div className="relative">
                <div className="bg-muted/50 h-48 rounded-t-lg flex items-center justify-center">
                  <Play className="h-12 w-12 text-primary" />
                </div>
                <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                  {tutorial.duration}
                </Badge>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{tutorial.category}</Badge>
                  <Badge variant="secondary">{tutorial.difficulty}</Badge>
                </div>
                
                <h3 className="font-semibold mb-2 line-clamp-2">{tutorial.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {tutorial.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{tutorial.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{tutorial.rating}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Community Tab
  const CommunityTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Community Forum</h2>
          <p className="text-muted-foreground">Connect with other Kairo users, share knowledge, and get help</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Discussion
        </Button>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Members', value: '12.5K', icon: Users, color: 'text-blue-600' },
          { label: 'Discussions', value: '3.2K', icon: MessageSquare, color: 'text-green-600' },
          { label: 'Answered Questions', value: '8.9K', icon: CheckCircle, color: 'text-purple-600' },
          { label: 'Community Experts', value: '156', icon: Award, color: 'text-orange-600' }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 text-center">
              <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Categories
          </CardTitle>
          <CardDescription>Browse discussions by topic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'General Discussion', posts: 245, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
              { name: 'Workflow Help', posts: 189, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
              { name: 'Integrations', posts: 156, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
              { name: 'AI Features', posts: 134, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
              { name: 'Feature Requests', posts: 98, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
              { name: 'Templates & Examples', posts: 87, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' }
            ].map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">{category.posts} posts</p>
                </div>
                <Badge className={category.color}>
                  {category.posts}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Discussions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Discussions
          </CardTitle>
          <CardDescription>Latest community conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communityPosts.map((post) => (
              <div key={post.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {post.author.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1 line-clamp-1">{post.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    <span>by {post.author}</span>
                    <span>•</span>
                    <span>{post.category}</span>
                    <span>•</span>
                    <span>{post.lastActivity}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{post.replies}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{post.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <Button variant="outline">
              View All Discussions
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
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
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
              <TabsTrigger value="getting-started" className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                <span className="hidden sm:inline">Getting Started</span>
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Documentation</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span className="hidden sm:inline">API Reference</span>
              </TabsTrigger>
              <TabsTrigger value="tutorials" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Tutorials</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Community</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="getting-started" className="space-y-6">
            <GettingStartedTab />
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <DocumentationTab />
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <APITab />
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            <TutorialsTab />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <CommunityTab />
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAppLayout>
  );
}

export default withAuth(HelpPage);