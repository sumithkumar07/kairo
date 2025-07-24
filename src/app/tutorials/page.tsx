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
import { 
  Play, 
  Search,
  Filter,
  Clock,
  Eye,
  Star,
  BookOpen,
  Video,
  FileText,
  Code,
  Workflow,
  Globe,
  Zap,
  Users,
  Shield,
  Database,
  BarChart3,
  MessageSquare,
  Crown,
  Target,
  Lightbulb,
  ChevronRight,
  ArrowRight,
  Download,
  ExternalLink,
  CheckCircle,
  Calendar,
  Award,
  TrendingUp,
  Activity,
  Settings,
  Monitor,
  Cloud,
  Smartphone,
  Mail,
  Palette,
  Layers,
  Cpu,
  GitBranch,
  Terminal,
  Headphones,
  Mic
} from 'lucide-react';

// Tutorial categories and content
const tutorialCategories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Essential tutorials for new users',
    icon: Lightbulb,
    color: 'text-green-500 bg-green-500/10',
    count: 12
  },
  {
    id: 'workflows',
    name: 'Workflow Building',
    description: 'Create and optimize workflows',
    icon: Workflow,
    color: 'text-blue-500 bg-blue-500/10',
    count: 18
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Connect third-party services',
    icon: Globe,
    color: 'text-purple-500 bg-purple-500/10',
    count: 25
  },
  {
    id: 'ai-features',
    name: 'AI Features',
    description: 'Leverage AI-powered automation',
    icon: Zap,
    color: 'text-yellow-500 bg-yellow-500/10',
    count: 8
  },
  {
    id: 'advanced',
    name: 'Advanced Topics',
    description: 'Complex automation patterns',
    icon: Code,
    color: 'text-red-500 bg-red-500/10',
    count: 15
  },
  {
    id: 'team-collaboration',
    name: 'Team & Collaboration',
    description: 'Work together effectively',
    icon: Users,
    color: 'text-indigo-500 bg-indigo-500/10',
    count: 10
  }
];

const featuredTutorials = [
  {
    id: 1,
    title: 'Building Your First Workflow',
    description: 'Step-by-step guide to creating your first automation from scratch',
    duration: '15:30',
    difficulty: 'Beginner',
    category: 'Getting Started',
    views: 45230,
    rating: 4.9,
    thumbnail: '/api/placeholder/300/200',
    instructor: 'Sarah Chen',
    publishedDate: '2024-03-15',
    tags: ['workflow', 'beginner', 'tutorial'],
    type: 'video'
  },
  {
    id: 2,
    title: 'Salesforce Integration Masterclass',
    description: 'Complete guide to connecting and automating Salesforce workflows',
    duration: '32:45',
    difficulty: 'Intermediate',
    category: 'Integrations',
    views: 28450,
    rating: 4.8,
    thumbnail: '/api/placeholder/300/200',
    instructor: 'Michael Rodriguez',
    publishedDate: '2024-03-10',
    tags: ['salesforce', 'integration', 'crm'],
    type: 'video'
  },
  {
    id: 3,
    title: 'AI-Powered Workflow Generation',
    description: 'Learn to create workflows using natural language with our AI assistant',
    duration: '12:20',
    difficulty: 'Beginner',
    category: 'AI Features',
    views: 35670,
    rating: 4.9,
    thumbnail: '/api/placeholder/300/200',
    instructor: 'Emily Watson',
    publishedDate: '2024-03-12',
    tags: ['ai', 'automation', 'natural-language'],
    type: 'video'
  }
];

const tutorials = [
  {
    id: 4,
    title: 'Setting Up Slack Notifications',
    description: 'Send automated messages and notifications to Slack channels',
    duration: '8:45',
    difficulty: 'Beginner',
    category: 'Integrations',
    views: 19820,
    rating: 4.7,
    instructor: 'David Kim',
    publishedDate: '2024-03-08',
    tags: ['slack', 'notifications', 'messaging'],
    type: 'video'
  },
  {
    id: 5,
    title: 'Error Handling Best Practices',
    description: 'Implement robust error handling and recovery in your workflows',
    duration: '18:30',
    difficulty: 'Advanced',
    category: 'Advanced Topics',
    views: 15640,
    rating: 4.8,
    instructor: 'Lisa Park',
    publishedDate: '2024-03-05',
    tags: ['error-handling', 'best-practices', 'reliability'],
    type: 'video'
  },
  {
    id: 6,
    title: 'Team Collaboration Setup',
    description: 'Configure team access, roles, and collaborative workflow editing',
    duration: '11:15',
    difficulty: 'Intermediate',
    category: 'Team & Collaboration',
    views: 12330,
    rating: 4.6,
    instructor: 'Alex Thompson',
    publishedDate: '2024-03-03',
    tags: ['team', 'collaboration', 'permissions'],
    type: 'video'
  },
  {
    id: 7,
    title: 'Data Transformation Techniques',
    description: 'Transform and manipulate data between workflow steps',
    duration: '22:10',
    difficulty: 'Intermediate',
    category: 'Workflows',
    views: 18750,
    rating: 4.7,
    instructor: 'Rachel Green',
    publishedDate: '2024-02-28',
    tags: ['data', 'transformation', 'mapping'],
    type: 'video'
  },
  {
    id: 8,
    title: 'E-commerce Automation with Shopify',
    description: 'Automate order processing, inventory, and customer communications',
    duration: '25:40',
    difficulty: 'Intermediate',
    category: 'Integrations',
    views: 21450,
    rating: 4.8,
    instructor: 'James Wilson',
    publishedDate: '2024-02-25',
    tags: ['shopify', 'ecommerce', 'automation'],
    type: 'video'
  }
];

const tutorialSeries = [
  {
    id: 1,
    title: 'Complete Beginner Series',
    description: 'Everything you need to know to get started with Kairo',
    episodes: 8,
    totalDuration: '2h 15m',
    difficulty: 'Beginner',
    enrolled: 12450,
    rating: 4.9,
    instructor: 'Sarah Chen',
    thumbnail: '/api/placeholder/400/200',
    episodes_list: [
      'Introduction to Automation',
      'Your First Workflow',
      'Understanding Triggers',
      'Working with Actions',
      'Testing and Debugging',
      'Publishing Workflows',
      'Monitoring and Analytics',
      'Next Steps'
    ]
  },
  {
    id: 2,
    title: 'Integration Mastery',
    description: 'Master all major integrations and build complex connected workflows',
    episodes: 12,
    totalDuration: '4h 30m',
    difficulty: 'Intermediate',
    enrolled: 8650,
    rating: 4.8,
    instructor: 'Michael Rodriguez',
    thumbnail: '/api/placeholder/400/200',
    episodes_list: [
      'Integration Fundamentals',
      'OAuth and Authentication',
      'Salesforce Deep Dive',
      'Google Workspace Suite',
      'Slack and Teams',
      'E-commerce Platforms',
      'Email Marketing Tools',
      'Database Connections',
      'API Rate Limiting',
      'Custom Integrations',
      'Error Handling',
      'Performance Optimization'
    ]
  }
];

function TutorialsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const allTutorials = [...featuredTutorials, ...tutorials];

  const filteredTutorials = allTutorials.filter(tutorial => {
    if (searchTerm && !tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !tutorial.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedCategory !== 'all' && tutorial.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && tutorial.difficulty !== selectedDifficulty) return false;
    if (selectedType !== 'all' && tutorial.type !== selectedType) return false;
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'interactive': return Code;
      default: return Video;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Video <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Tutorials</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn Kairo through comprehensive video tutorials and step-by-step guides
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tutorials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {tutorialCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="featured" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="series">Series</TabsTrigger>
            <TabsTrigger value="all">All Tutorials</TabsTrigger>
          </TabsList>

          {/* Featured Tab */}
          <TabsContent value="featured" className="space-y-8">
            {/* Hero Tutorial */}
            <Card className="overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-primary/10 rounded-full inline-block">
                      <Play className="h-12 w-12 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Featured Tutorial</p>
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(featuredTutorials[0].difficulty)}>
                        {featuredTutorials[0].difficulty}
                      </Badge>
                      <Badge variant="outline">{featuredTutorials[0].category}</Badge>
                    </div>
                    <h2 className="text-3xl font-bold">{featuredTutorials[0].title}</h2>
                    <p className="text-muted-foreground text-lg">
                      {featuredTutorials[0].description}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {featuredTutorials[0].duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {featuredTutorials[0].views.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {featuredTutorials[0].rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {featuredTutorials[0].instructor.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{featuredTutorials[0].instructor}</div>
                        <div className="text-sm text-muted-foreground">{featuredTutorials[0].publishedDate}</div>
                      </div>
                    </div>
                    <Button size="lg" className="w-full group">
                      <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Watch Tutorial
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Featured Tutorials Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Featured Tutorials</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTutorials.slice(1).map((tutorial) => {
                  const TypeIcon = getTypeIcon(tutorial.type);
                  return (
                    <Card key={tutorial.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="aspect-video bg-gradient-to-br from-muted/20 to-muted/40 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-3 bg-black/50 rounded-full group-hover:bg-black/70 transition-colors">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div className="absolute top-3 left-3">
                          <Badge className={getDifficultyColor(tutorial.difficulty)}>
                            {tutorial.difficulty}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <Badge variant="secondary" className="bg-black/50 text-white">
                            {tutorial.duration}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <Badge variant="outline" className="text-xs">
                            {tutorial.category}
                          </Badge>
                          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                            {tutorial.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {tutorial.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {tutorial.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {tutorial.rating}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {tutorial.instructor.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">{tutorial.instructor}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorialCategories.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${category.color}`}>
                          <CategoryIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{category.name}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {category.count} tutorials
                        </span>
                        <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Browse
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Series Tab */}
          <TabsContent value="series" className="space-y-8">
            <div className="space-y-8">
              {tutorialSeries.map((series) => (
                <Card key={series.id} className="overflow-hidden">
                  <div className="grid lg:grid-cols-3">
                    <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="p-3 bg-primary/10 rounded-full inline-block">
                          <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">Series</p>
                      </div>
                    </div>
                    <div className="lg:col-span-2 p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(series.difficulty)}>
                            {series.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            {series.episodes} episodes
                          </Badge>
                          <Badge variant="outline">
                            {series.totalDuration}
                          </Badge>
                        </div>
                        <h2 className="text-2xl font-bold">{series.title}</h2>
                        <p className="text-muted-foreground">
                          {series.description}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {series.enrolled.toLocaleString()} enrolled
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {series.rating}
                          </span>
                          <span>by {series.instructor}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          {series.episodes_list.slice(0, 6).map((episode, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                              <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                              <span>{episode}</span>
                            </div>
                          ))}
                          {series.episodes_list.length > 6 && (
                            <div className="text-muted-foreground p-2">
                              +{series.episodes_list.length - 6} more episodes
                            </div>
                          )}
                        </div>
                        <Button className="w-full">
                          Start Series
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* All Tutorials Tab */}
          <TabsContent value="all" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutorials.map((tutorial) => {
                const TypeIcon = getTypeIcon(tutorial.type);
                return (
                  <Card key={tutorial.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-video bg-gradient-to-br from-muted/20 to-muted/40 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-3 bg-black/50 rounded-full group-hover:bg-black/70 transition-colors">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge className={getDifficultyColor(tutorial.difficulty)}>
                          {tutorial.difficulty}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <Badge variant="secondary" className="bg-black/50 text-white">
                          {tutorial.duration}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="p-1.5 bg-black/50 rounded">
                          <TypeIcon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <Badge variant="outline" className="text-xs">
                          {tutorial.category}
                        </Badge>
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {tutorial.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tutorial.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {tutorial.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {tutorial.rating}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {tutorial.instructor.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{tutorial.instructor}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(TutorialsPage);