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
import { 
  BookOpen, 
  Search,
  Code,
  Globe,
  Zap,
  Database,
  Workflow,
  Users,
  Shield,
  FileText,
  Copy,
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  Eye,
  Download,
  GitBranch,
  Terminal,
  Lightbulb,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Play,
  Settings,
  Key,
  Monitor,
  BarChart3,
  MessageSquare,
  Mail,
  Smartphone,
  Cloud,
  Cpu,
  Activity,
  Target,
  Crown,
  Palette,
  Layers
} from 'lucide-react';

// Documentation sections
const docSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Quick start guides and fundamental concepts',
    icon: Lightbulb,
    color: 'text-green-500 bg-green-500/10',
    articles: [
      { title: 'Introduction to Kairo', description: 'Overview of the platform and core concepts', readTime: '5 min', difficulty: 'Beginner' },
      { title: 'Your First Workflow', description: 'Create and deploy your first automation', readTime: '10 min', difficulty: 'Beginner' },
      { title: 'Understanding Triggers', description: 'How to set up workflow triggers', readTime: '8 min', difficulty: 'Beginner' },
      { title: 'Basic Actions Guide', description: 'Common workflow actions and their usage', readTime: '12 min', difficulty: 'Beginner' }
    ]
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    description: 'Complete REST API documentation with examples',
    icon: Code,
    color: 'text-blue-500 bg-blue-500/10',
    articles: [
      { title: 'Authentication', description: 'API authentication and authorization', readTime: '6 min', difficulty: 'Intermediate' },
      { title: 'Workflows API', description: 'Create, read, update, and delete workflows', readTime: '15 min', difficulty: 'Intermediate' },
      { title: 'Executions API', description: 'Trigger and monitor workflow executions', readTime: '12 min', difficulty: 'Intermediate' },
      { title: 'Integrations API', description: 'Manage third-party service connections', readTime: '18 min', difficulty: 'Advanced' },
      { title: 'Webhooks', description: 'Setting up and handling webhook events', readTime: '10 min', difficulty: 'Intermediate' },
      { title: 'Rate Limits', description: 'Understanding API rate limiting', readTime: '5 min', difficulty: 'Beginner' }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with third-party services and platforms',
    icon: Globe,
    color: 'text-purple-500 bg-purple-500/10',
    articles: [
      { title: 'Salesforce Integration', description: 'Connect with Salesforce CRM', readTime: '20 min', difficulty: 'Intermediate' },
      { title: 'Slack Integration', description: 'Send messages and notifications to Slack', readTime: '15 min', difficulty: 'Beginner' },
      { title: 'Shopify Integration', description: 'E-commerce automation with Shopify', readTime: '25 min', difficulty: 'Intermediate' },
      { title: 'Google Workspace', description: 'Gmail, Sheets, and Drive automation', readTime: '30 min', difficulty: 'Intermediate' },
      { title: 'Custom Integrations', description: 'Building your own integrations', readTime: '45 min', difficulty: 'Advanced' },
      { title: 'OAuth Setup', description: 'Configuring OAuth authentication', readTime: '12 min', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'workflows',
    title: 'Workflows',
    description: 'Advanced workflow building and optimization',
    icon: Workflow,
    color: 'text-orange-500 bg-orange-500/10',
    articles: [
      { title: 'Workflow Design Patterns', description: 'Best practices for workflow architecture', readTime: '25 min', difficulty: 'Intermediate' },
      { title: 'Conditional Logic', description: 'Using conditions and branches', readTime: '18 min', difficulty: 'Intermediate' },
      { title: 'Error Handling', description: 'Implementing robust error recovery', readTime: '22 min', difficulty: 'Advanced' },
      { title: 'Data Transformation', description: 'Manipulating data between steps', readTime: '20 min', difficulty: 'Intermediate' },
      { title: 'Parallel Execution', description: 'Running multiple actions simultaneously', readTime: '15 min', difficulty: 'Advanced' },
      { title: 'Testing Workflows', description: 'Debug and test your automations', readTime: '12 min', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'ai-features',
    title: 'AI Features',
    description: 'Leverage AI-powered automation capabilities',
    icon: Zap,
    color: 'text-yellow-500 bg-yellow-500/10',
    articles: [
      { title: 'AI Workflow Generation', description: 'Generate workflows from natural language', readTime: '10 min', difficulty: 'Beginner' },
      { title: 'Smart Data Processing', description: 'AI-powered data analysis and transformation', readTime: '20 min', difficulty: 'Intermediate' },
      { title: 'Intelligent Routing', description: 'AI-based decision making in workflows', readTime: '18 min', difficulty: 'Advanced' },
      { title: 'God-Tier Features', description: 'Advanced AI capabilities and quantum computing', readTime: '35 min', difficulty: 'Expert' }
    ]
  },
  {
    id: 'security',
    title: 'Security & Compliance',
    description: 'Security best practices and compliance features',
    icon: Shield,
    color: 'text-red-500 bg-red-500/10',
    articles: [
      { title: 'Security Overview', description: 'Platform security architecture', readTime: '15 min', difficulty: 'Intermediate' },
      { title: 'Data Encryption', description: 'How your data is protected', readTime: '10 min', difficulty: 'Beginner' },
      { title: 'GDPR Compliance', description: 'GDPR features and configuration', readTime: '20 min', difficulty: 'Intermediate' },
      { title: 'HIPAA Compliance', description: 'Healthcare data protection', readTime: '25 min', difficulty: 'Advanced' },
      { title: 'Audit Logs', description: 'Monitoring and compliance reporting', readTime: '12 min', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'team-management',
    title: 'Team Management',
    description: 'Collaborate and manage team access',
    icon: Users,
    color: 'text-indigo-500 bg-indigo-500/10',
    articles: [
      { title: 'Team Setup', description: 'Adding and managing team members', readTime: '10 min', difficulty: 'Beginner' },
      { title: 'Roles & Permissions', description: 'Configuring access control', readTime: '15 min', difficulty: 'Intermediate' },
      { title: 'Collaboration Features', description: 'Real-time editing and sharing', readTime: '12 min', difficulty: 'Beginner' },
      { title: 'Organization Settings', description: 'Managing organization-wide settings', readTime: '18 min', difficulty: 'Intermediate' }
    ]
  }
];

// Popular articles
const popularArticles = [
  { title: 'Your First Workflow', category: 'Getting Started', views: 15420, rating: 4.9 },
  { title: 'Salesforce Integration', category: 'Integrations', views: 12830, rating: 4.8 },
  { title: 'API Authentication', category: 'API Reference', views: 11200, rating: 4.7 },
  { title: 'Error Handling', category: 'Workflows', views: 9560, rating: 4.8 },
  { title: 'AI Workflow Generation', category: 'AI Features', views: 8940, rating: 4.9 }
];

// Quick reference cards
const quickReference = [
  {
    title: 'HTTP Methods',
    items: [
      { method: 'GET', description: 'Retrieve data', example: 'GET /api/workflows' },
      { method: 'POST', description: 'Create new resource', example: 'POST /api/workflows' },
      { method: 'PUT', description: 'Update resource', example: 'PUT /api/workflows/:id' },
      { method: 'DELETE', description: 'Remove resource', example: 'DELETE /api/workflows/:id' }
    ]
  },
  {
    title: 'Response Codes',
    items: [
      { method: '200', description: 'Success', example: 'Request completed successfully' },
      { method: '201', description: 'Created', example: 'Resource created successfully' },
      { method: '400', description: 'Bad Request', example: 'Invalid request parameters' },
      { method: '401', description: 'Unauthorized', example: 'Authentication required' },
      { method: '404', description: 'Not Found', example: 'Resource does not exist' },
      { method: '500', description: 'Server Error', example: 'Internal server error' }
    ]
  }
];

function DocsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const filteredSections = docSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.articles.some(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Expert': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Documentation</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete guides, API references, and tutorials to help you build powerful automations
          </p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="reference">Quick Reference</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-12">
            {/* Popular Articles */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Popular Articles
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularArticles.map((article, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {article.rating}
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views.toLocaleString()} views
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Documentation Sections */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Documentation Sections</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSections.map((section) => {
                  const SectionIcon = section.icon;
                  return (
                    <Card key={section.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-3 rounded-lg ${section.color}`}>
                            <SectionIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{section.title}</CardTitle>
                            <CardDescription className="text-sm">{section.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {section.articles.slice(0, 3).map((article, index) => (
                            <div key={index} className="flex items-center justify-between text-sm hover:bg-muted/50 p-2 rounded cursor-pointer">
                              <span className="font-medium">{article.title}</span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          ))}
                          {section.articles.length > 3 && (
                            <div className="text-center pt-2">
                              <Button variant="ghost" size="sm" className="text-primary">
                                View all {section.articles.length} articles
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      API Endpoints
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Authentication', 'Workflows', 'Executions', 'Integrations', 'Teams', 'Analytics'].map((endpoint) => (
                        <button
                          key={endpoint}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedSection(endpoint)}
                        >
                          <div className="font-medium">{endpoint}</div>
                          <div className="text-xs text-muted-foreground">
                            /api/{endpoint.toLowerCase()}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>API Overview</CardTitle>
                    <CardDescription>
                      Kairo REST API allows programmatic access to all platform features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Base URL</h3>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                        https://api.kairo.com/v1
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Authentication</h3>
                      <p className="text-muted-foreground mb-3">
                        All API requests require authentication using Bearer tokens.
                      </p>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                        curl -H "Authorization: Bearer YOUR_API_KEY" \<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;https://api.kairo.com/v1/workflows
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Example Request</h3>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                        <div className="text-blue-600">POST</div>
                        <div className="mt-2">https://api.kairo.com/v1/workflows</div>
                        <div className="mt-4 text-gray-600">
                          {`{
  "name": "Welcome Email",
  "description": "Send welcome email to new users",
  "trigger": {
    "type": "webhook",
    "config": { "method": "POST" }
  },
  "actions": [
    {
      "type": "send_email",
      "config": {
        "to": "{{ trigger.email }}",
        "subject": "Welcome!",
        "template": "welcome"
      }
    }
  ]
}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Full API Docs
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download OpenAPI
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>SDKs & Libraries</CardTitle>
                    <CardDescription>
                      Official SDKs for popular programming languages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { name: 'JavaScript/Node.js', version: 'v2.1.0', icon: '🟨' },
                        { name: 'Python', version: 'v1.8.2', icon: '🐍' },
                        { name: 'PHP', version: 'v1.5.1', icon: '🐘' },
                        { name: 'Ruby', version: 'v1.3.0', icon: '💎' },
                        { name: 'Go', version: 'v1.2.0', icon: '🐹' },
                        { name: 'Java', version: 'v1.1.0', icon: '☕' }
                      ].map((sdk) => (
                        <div key={sdk.name} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{sdk.icon}</span>
                            <div>
                              <div className="font-medium">{sdk.name}</div>
                              <div className="text-sm text-muted-foreground">{sdk.version}</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Install
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-8">
            <div className="space-y-8">
              {filteredSections.map((section) => {
                const SectionIcon = section.icon;
                return (
                  <Card key={section.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${section.color}`}>
                          <SectionIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{section.title}</CardTitle>
                          <CardDescription className="text-base">{section.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {section.articles.map((article, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer">
                            <div className="flex-1">
                              <div className="font-semibold mb-1">{article.title}</div>
                              <div className="text-sm text-muted-foreground mb-2">{article.description}</div>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className={`text-xs ${getDifficultyColor(article.difficulty)}`}>
                                  {article.difficulty}
                                </Badge>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {article.readTime}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Quick Reference Tab */}
          <TabsContent value="reference" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {quickReference.map((ref, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{ref.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ref.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start gap-4 p-3 rounded-lg border bg-card/50">
                          <div className="font-mono text-sm font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                            {item.method}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{item.description}</div>
                            <div className="text-sm text-muted-foreground font-mono">{item.example}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Resources</CardTitle>
                <CardDescription>Helpful tools and external resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="flex items-center gap-3">
                      <Terminal className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">CLI Tool</div>
                        <div className="text-sm text-muted-foreground">Command line interface</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="flex items-center gap-3">
                      <GitBranch className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">GitHub</div>
                        <div className="text-sm text-muted-foreground">Sample code & examples</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Community</div>
                        <div className="text-sm text-muted-foreground">Get help & share ideas</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(DocsPage);