'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  BookOpen,
  GraduationCap,
  Video,
  FileText,
  Code,
  Search,
  Filter,
  Grid,
  List,
  Play,
  PlayCircle,
  Star,
  Clock,
  Eye,
  Users,
  Award,
  Trophy,
  Crown,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Download,
  ExternalLink,
  Copy,
  Globe,
  Zap,
  Shield,
  Database,
  Workflow,
  Bot,
  TrendingUp,
  Lightbulb,
  Rocket,
  Brain,
  Calendar,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Terminal,
  GitBranch,
  HelpCircle,
  Target,
  Info,
  AlertCircle,
  Mail,
  Smartphone,
  Lock,
  Settings,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

// Learning & Knowledge Center - Consolidated from /academy, /tutorials, /docs, /api-docs
// This combines all learning resources, documentation, and tutorials in one unified interface

// Learning paths from academy
const learningPaths = [
  {
    id: 'beginner',
    title: 'Automation Fundamentals',
    description: 'Perfect for beginners new to workflow automation',
    level: 'Beginner',
    duration: '4 weeks',
    modules: 12,
    students: 15420,
    rating: 4.9,
    progress: 0,
    icon: Lightbulb,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'intermediate',
    title: 'Advanced Workflow Design',
    description: 'Build complex workflows with advanced features',
    level: 'Intermediate',
    duration: '6 weeks',
    modules: 18,
    students: 8932,
    rating: 4.8,
    progress: 65,
    icon: Rocket,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'ai-powered',
    title: 'AI-Powered Automation',
    description: 'Leverage AI and machine learning in your workflows',
    level: 'Advanced',
    duration: '5 weeks',
    modules: 15,
    students: 5641,
    rating: 4.9,
    progress: 30,
    icon: Brain,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'enterprise',
    title: 'Enterprise Integration',
    description: 'Scale automation across your organization',
    level: 'Expert',
    duration: '8 weeks',
    modules: 24,
    students: 3287,
    rating: 4.7,
    progress: 0,
    icon: Shield,
    color: 'from-orange-500 to-red-500'
  }
];

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
      { title: 'Integrations API', description: 'Manage third-party service connections', readTime: '18 min', difficulty: 'Advanced' }
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
      { title: 'Google Workspace', description: 'Gmail, Sheets, and Drive automation', readTime: '30 min', difficulty: 'Intermediate' }
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
      { title: 'Data Transformation', description: 'Manipulating data between steps', readTime: '20 min', difficulty: 'Intermediate' }
    ]
  }
];

// Popular tutorials
const popularTutorials = [
  {
    id: 1,
    title: 'Building Your First Automation',
    description: 'Step-by-step guide to creating your first workflow',
    duration: '15 min',
    views: 45680,
    likes: 2341,
    type: 'video',
    difficulty: 'Beginner',
    instructor: 'Sarah Johnson'
  },
  {
    id: 2,
    title: 'AI Workflow Generation Deep Dive',
    description: 'Learn to use AI to generate complex workflows',
    duration: '28 min',
    views: 32140,
    likes: 1876,
    type: 'video',
    difficulty: 'Intermediate',
    instructor: 'Michael Chen'
  },
  {
    id: 3,
    title: 'Slack Integration Masterclass',
    description: 'Complete guide to integrating Slack with your workflows',
    duration: '22 min',
    views: 28934,
    likes: 1432,
    type: 'video',
    difficulty: 'Intermediate',
    instructor: 'Emily Rodriguez'
  }
];

// Certifications
const certifications = [
  {
    id: 'fundamentals',
    title: 'Kairo Fundamentals',
    description: 'Master the basics of workflow automation',
    badge: 'Bronze',
    requirements: ['Complete 5 courses', 'Pass final exam (80%)', 'Build 3 workflows'],
    timeToComplete: '2-3 weeks',
    enrolled: 12450,
    completed: 8932,
    icon: Award,
    color: 'text-amber-600'
  },
  {
    id: 'professional',
    title: 'Professional Automation',
    description: 'Advanced automation techniques and best practices',
    badge: 'Silver',
    requirements: ['Complete 10 courses', 'Pass final exam (85%)', 'Build 5 complex workflows'],
    timeToComplete: '4-6 weeks',
    enrolled: 7834,
    completed: 4521,
    icon: Trophy,
    color: 'text-gray-600'
  },
  {
    id: 'expert',
    title: 'Automation Expert',
    description: 'Enterprise-level automation and leadership',
    badge: 'Gold',
    requirements: ['Complete all courses', 'Pass final exam (90%)', 'Build enterprise solution'],
    timeToComplete: '8-12 weeks',
    enrolled: 3421,
    completed: 876,
    icon: Crown,
    color: 'text-yellow-600'
  }
];

// Quick reference from API docs
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
      { method: '401', description: 'Unauthorized', example: 'Authentication required' }
    ]
  }
];

function LearningKnowledgeCenter() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab'));
    }
  }, [searchParams]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Expert': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredSections = docSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.articles.some(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Learning Center
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your complete learning destination - courses, tutorials, documentation, and API references all in one place
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search courses, tutorials, docs, and API references..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">67</div>
              <div className="text-sm text-muted-foreground">Total Courses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Video className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">245</div>
              <div className="text-sm text-muted-foreground">Video Tutorials</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">Documentation Articles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">14.2k</div>
              <div className="text-sm text-muted-foreground">Certifications Earned</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Getting Started</TabsTrigger>
            <TabsTrigger value="courses">Learning Paths</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          {/* Getting Started Tab */}
          <TabsContent value="overview" className="space-y-12">
            {/* Featured Learning Paths */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Rocket className="h-6 w-6 text-primary" />
                Start Your Learning Journey
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {learningPaths.slice(0, 2).map((path) => {
                  const PathIcon = path.icon;
                  return (
                    <Card key={path.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-3 bg-gradient-to-r ${path.color} rounded-lg`}>
                            <PathIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{path.title}</CardTitle>
                            <CardDescription>{path.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <Badge variant="outline" className={getDifficultyColor(path.level)}>
                              {path.level}
                            </Badge>
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {path.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {path.modules} modules
                              </span>
                            </div>
                          </div>
                          
                          {path.progress > 0 && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{path.progress}%</span>
                              </div>
                              <Progress value={path.progress} />
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {path.students.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {path.rating}
                              </span>
                            </div>
                            <Button size="sm">
                              {path.progress > 0 ? 'Continue' : 'Start Learning'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Popular Resources */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Popular Resources
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {popularTutorials.map((tutorial) => (
                  <Card key={tutorial.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="relative">
                        <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                          <PlayCircle className="h-12 w-12 text-primary" />
                        </div>
                        <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                          {tutorial.duration}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {tutorial.title}
                      </CardTitle>
                      <CardDescription>{tutorial.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className={getDifficultyColor(tutorial.difficulty)}>
                          {tutorial.difficulty}
                        </Badge>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {tutorial.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {tutorial.likes.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        by {tutorial.instructor}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Start Actions */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Quick Start Actions</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-6 justify-start flex-col items-start">
                  <Play className="h-8 w-8 text-primary mb-2" />
                  <div className="text-left">
                    <div className="font-semibold">Build First Workflow</div>
                    <div className="text-sm text-muted-foreground">Step-by-step tutorial</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-6 justify-start flex-col items-start">
                  <Code className="h-8 w-8 text-primary mb-2" />
                  <div className="text-left">
                    <div className="font-semibold">API Quick Start</div>
                    <div className="text-sm text-muted-foreground">Get started with API</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-6 justify-start flex-col items-start">
                  <Globe className="h-8 w-8 text-primary mb-2" />
                  <div className="text-left">
                    <div className="font-semibold">Connect Apps</div>
                    <div className="text-sm text-muted-foreground">Integration guides</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-6 justify-start flex-col items-start">
                  <MessageSquare className="h-8 w-8 text-primary mb-2" />
                  <div className="text-left">
                    <div className="font-semibold">Join Community</div>
                    <div className="text-sm text-muted-foreground">Get help & share</div>
                  </div>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="courses" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Learning Paths</h2>
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

            <div className="grid md:grid-cols-2 gap-6">
              {learningPaths.map((path) => {
                const PathIcon = path.icon;
                return (
                  <Card key={path.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 bg-gradient-to-r ${path.color} rounded-lg`}>
                          <PathIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{path.title}</CardTitle>
                          <CardDescription>{path.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline" className={getDifficultyColor(path.level)}>
                            {path.level}
                          </Badge>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {path.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {path.modules} modules
                            </span>
                          </div>
                        </div>
                        
                        {path.progress > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{path.progress}%</span>
                            </div>
                            <Progress value={path.progress} />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {path.students.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {path.rating}
                            </span>
                          </div>
                          <Button size="sm">
                            {path.progress > 0 ? 'Continue' : 'Start Learning'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Certifications Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Professional Certifications</h2>
              <div className="space-y-6">
                {certifications.map((cert) => {
                  const CertIcon = cert.icon;
                  return (
                    <Card key={cert.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className={`p-4 bg-gradient-to-r from-primary to-purple-600 rounded-lg`}>
                            <CertIcon className={`h-8 w-8 ${cert.color} text-white`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-xl">{cert.title}</CardTitle>
                              <Badge variant="secondary">{cert.badge}</Badge>
                            </div>
                            <CardDescription>{cert.description}</CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {cert.completed.toLocaleString()} earned
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {cert.enrolled.toLocaleString()} enrolled
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-2">Requirements</h4>
                            <ul className="space-y-1 text-sm">
                              {cert.requirements.map((req, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                Time to complete: {cert.timeToComplete}
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                {cert.enrolled.toLocaleString()} students enrolled
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button>
                            Start Certification
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Video Tutorials</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
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

            {/* Tutorial Categories */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All Categories
              </Button>
              {['getting-started', 'integrations', 'ai-features', 'advanced'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Button>
              ))}
            </div>

            {/* Tutorials Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularTutorials.map((tutorial) => (
                <Card key={tutorial.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="relative">
                      <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                        <PlayCircle className="h-12 w-12 text-primary" />
                      </div>
                      <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                        {tutorial.duration}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {tutorial.title}
                    </CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className={getDifficultyColor(tutorial.difficulty)}>
                        {tutorial.difficulty}
                      </Badge>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {tutorial.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {tutorial.likes.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      by {tutorial.instructor}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-8">
            {/* Documentation Sections */}
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

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* API Overview */}
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

                {/* Quick Reference */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
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
              </div>

              {/* API Endpoints Sidebar */}
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
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Community Resources</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Button variant="outline" className="h-auto p-6 justify-start">
                  <div className="flex items-center gap-3">
                    <Terminal className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">CLI Tool</div>
                      <div className="text-sm text-muted-foreground">Command line interface</div>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-6 justify-start">
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">GitHub</div>
                      <div className="text-sm text-muted-foreground">Sample code & examples</div>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-6 justify-start">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Community</div>
                      <div className="text-sm text-muted-foreground">Get help & share ideas</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(LearningKnowledgeCenter);