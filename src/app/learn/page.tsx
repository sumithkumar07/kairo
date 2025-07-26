'use client';

import React, { useState } from 'react';
import { EnhancedAppLayout } from '@/components/enhanced-app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen,
  Code,
  MessageSquare,
  HelpCircle,
  Rocket,
  Users,
  FileText,
  Video,
  Coffee,
  Star,
  Clock,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  Play,
  Download,
  BookMarked,
  Lightbulb,
  Target,
  Award,
  Zap,
  Brain,
  Globe
} from 'lucide-react';

function LearnPage() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'documentation';
    }
    return 'documentation';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Documentation sections
  const documentation = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of Kairo automation platform',
      icon: Rocket,
      articles: [
        { title: 'Quick Start Guide', time: '5 min read', type: 'guide' },
        { title: 'Creating Your First Workflow', time: '10 min read', type: 'tutorial' },
        { title: 'Understanding Nodes and Connections', time: '8 min read', type: 'concept' }
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'workflows',
      title: 'Workflow Building',
      description: 'Master advanced workflow creation techniques',
      icon: Target,
      articles: [
        { title: 'Advanced Workflow Patterns', time: '15 min read', type: 'guide' },
        { title: 'Error Handling Best Practices', time: '12 min read', type: 'best-practice' },
        { title: 'Performance Optimization', time: '18 min read', type: 'optimization' }
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect with external services and APIs',
      icon: Globe,
      articles: [
        { title: 'Setting up OAuth Integrations', time: '10 min read', type: 'tutorial' },
        { title: 'Custom API Connections', time: '20 min read', type: 'advanced' },
        { title: 'Webhook Configuration', time: '8 min read', type: 'guide' }
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'ai-features',
      title: 'AI Features',
      description: 'Leverage AI-powered automation capabilities',
      icon: Brain,
      articles: [
        { title: 'AI Workflow Generation', time: '12 min read', type: 'feature' },
        { title: 'Natural Language Processing', time: '15 min read', type: 'advanced' },
        { title: 'AI Model Configuration', time: '10 min read', type: 'configuration' }
      ],
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  // API Reference sections
  const apiSections = [
    {
      category: 'Authentication',
      endpoints: [
        { method: 'POST', path: '/api/auth/login', description: 'Authenticate user' },
        { method: 'POST', path: '/api/auth/refresh', description: 'Refresh access token' },
        { method: 'POST', path: '/api/auth/logout', description: 'Logout user' }
      ]
    },
    {
      category: 'Workflows',
      endpoints: [
        { method: 'GET', path: '/api/workflows', description: 'List all workflows' },
        { method: 'POST', path: '/api/workflows', description: 'Create new workflow' },
        { method: 'PUT', path: '/api/workflows/{id}', description: 'Update workflow' },
        { method: 'DELETE', path: '/api/workflows/{id}', description: 'Delete workflow' }
      ]
    },
    {
      category: 'Executions',
      endpoints: [
        { method: 'GET', path: '/api/executions', description: 'List workflow executions' },
        { method: 'POST', path: '/api/executions/{workflowId}', description: 'Execute workflow' },
        { method: 'GET', path: '/api/executions/{id}', description: 'Get execution details' }
      ]
    }
  ];

  // Academy courses
  const courses = [
    {
      id: 'foundations',
      title: 'Automation Foundations',
      description: 'Master the fundamentals of workflow automation',
      level: 'Beginner',
      duration: '2 hours',
      lessons: 8,
      rating: 4.9,
      enrolled: 1247,
      thumbnail: '/course-foundations.jpg',
      instructor: 'Sarah Chen',
      topics: ['Workflow Basics', 'Node Types', 'Data Flow', 'Testing']
    },
    {
      id: 'advanced-patterns',
      title: 'Advanced Workflow Patterns',
      description: 'Learn complex automation patterns and best practices',
      level: 'Advanced',
      duration: '4 hours',
      lessons: 12,
      rating: 4.8,
      enrolled: 856,
      thumbnail: '/course-advanced.jpg',
      instructor: 'Mike Rodriguez',
      topics: ['Error Handling', 'Parallel Processing', 'Conditional Logic', 'Optimization']
    },
    {
      id: 'ai-integration',
      title: 'AI-Powered Automation',
      description: 'Integrate AI capabilities into your workflows',
      level: 'Intermediate',
      duration: '3 hours',
      lessons: 10,
      rating: 4.9,
      enrolled: 654,
      thumbnail: '/course-ai.jpg',
      instructor: 'Dr. Emily Watson',
      topics: ['AI Models', 'Natural Language', 'Image Processing', 'Data Analysis']
    }
  ];

  // Community discussions
  const discussions = [
    {
      id: 1,
      title: 'How to handle large datasets in workflows?',
      author: 'john_dev',
      replies: 23,
      views: 1547,
      category: 'Performance',
      timestamp: '2 hours ago',
      solved: true
    },
    {
      id: 2,
      title: 'Best practices for error handling',
      author: 'sarah_ops',
      replies: 18,
      views: 892,
      category: 'Best Practices',
      timestamp: '5 hours ago',
      solved: false
    },
    {
      id: 3,
      title: 'Integration with Salesforce - OAuth setup issues',
      author: 'mike_admin',
      replies: 31,
      views: 2103,
      category: 'Integrations',
      timestamp: '1 day ago',
      solved: true
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <EnhancedAppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Learning <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Center</span>
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Master Kairo with comprehensive documentation, tutorials, and community support
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Badge variant="outline" className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              5,247 Active Learners
            </Badge>
            <Button variant="outline">
              <Coffee className="h-4 w-4 mr-2" />
              Office Hours
            </Button>
          </div>
        </div>

        {/* Learning Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Documentation</span>
            </TabsTrigger>
            <TabsTrigger value="api-reference" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">API Reference</span>
            </TabsTrigger>
            <TabsTrigger value="academy" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Academy</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Help & Support</span>
            </TabsTrigger>
          </TabsList>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documentation.map((section) => {
                const IconComponent = section.icon;
                return (
                  <Card key={section.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${section.color} opacity-10 rounded-full -translate-y-12 translate-x-12`} />
                    
                    <CardHeader className="pb-4 relative">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`p-3 bg-gradient-to-r ${section.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          <CardDescription className="text-sm">{section.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {section.articles.map((article, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{article.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs capitalize">
                                {article.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {article.time}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      ))}
                      
                      <Button variant="outline" className="w-full mt-4">
                        View All Articles
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api-reference" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  REST API Reference
                </CardTitle>
                <CardDescription>
                  Complete API documentation with examples and authentication details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {apiSections.map((section, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {section.category}
                      </h3>
                      <div className="space-y-2">
                        {section.endpoints.map((endpoint, endpointIndex) => (
                          <div key={endpointIndex} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                              <Badge className={getMethodColor(endpoint.method)}>
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {endpoint.path}
                              </code>
                              <span className="text-sm text-muted-foreground">
                                {endpoint.description}
                              </span>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academy Tab */}
          <TabsContent value="academy" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Kairo Academy</h2>
                <p className="text-muted-foreground">Structured learning paths to master automation</p>
              </div>
              <Button>
                <Zap className="h-4 w-4 mr-2" />
                Browse All Courses
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                    <Play className="h-12 w-12 text-primary" />
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{course.lessons} lessons</span>
                      <span>{course.duration}</span>
                      <span>{course.enrolled.toLocaleString()} enrolled</span>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-sm">
                        <span className="font-medium">Instructor:</span> {course.instructor}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {course.topics.slice(0, 3).map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                        {course.topics.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{course.topics.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <Button className="w-full">
                        Start Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Community Discussions</h2>
                <p className="text-muted-foreground">Connect with other users and get help</p>
              </div>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Discussion
              </Button>
            </div>

            <div className="space-y-4">
              {discussions.map((discussion) => (
                <Card key={discussion.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{discussion.title}</h3>
                          {discussion.solved && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Solved
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {discussion.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>By {discussion.author}</span>
                          <span>{discussion.replies} replies</span>
                          <span>{discussion.views.toLocaleString()} views</span>
                          <span>{discussion.timestamp}</span>
                        </div>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Help & Support Tab */}
          <TabsContent value="help" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="p-4 bg-blue-500/10 rounded-xl inline-block mb-4">
                    <HelpCircle className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Search our comprehensive knowledge base for answers
                  </p>
                  <Button variant="outline" className="w-full">
                    Browse Articles
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="p-4 bg-green-500/10 rounded-xl inline-block mb-4">
                    <MessageSquare className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get instant help from our support team
                  </p>
                  <Button variant="outline" className="w-full">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="p-4 bg-purple-500/10 rounded-xl inline-block mb-4">
                    <Video className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Video Tutorials</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Watch step-by-step video guides
                  </p>
                  <Button variant="outline" className="w-full">
                    Watch Videos
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Reach out to our team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Support Ticket</div>
                        <div className="text-sm text-muted-foreground">Create a support request</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="flex items-center gap-3">
                      <Coffee className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Office Hours</div>
                        <div className="text-sm text-muted-foreground">Join our weekly Q&A</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAppLayout>
  );
}

export default withAuth(LearnPage);