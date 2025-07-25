'use client';

import { useState, useEffect } from 'react';
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
  Play, 
  BookOpen, 
  Award, 
  Clock, 
  Users, 
  Star,
  Search,
  Video,
  FileText,
  CheckCircle,
  Lock,
  PlayCircle,
  Download,
  Share,
  Trophy,
  Target,
  Zap,
  Globe,
  Shield,
  Code,
  Database,
  Workflow,
  Bot,
  TrendingUp,
  ChevronRight,
  Filter,
  Grid,
  List,
  Lightbulb,
  Rocket,
  Brain,
  Calendar,
  Eye,
  ThumbsUp,
  MessageSquare,
  Bookmark
} from 'lucide-react';

// Learning paths
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

// Tutorial categories
const tutorialCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of automation',
    icon: Play,
    count: 12,
    color: 'bg-green-500'
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect your favorite apps',
    icon: Globe,
    count: 25,
    color: 'bg-blue-500'
  },
  {
    id: 'ai-features',
    title: 'AI Features',
    description: 'Harness the power of AI',
    icon: Bot,
    count: 18,
    color: 'bg-purple-500'
  },
  {
    id: 'advanced',
    title: 'Advanced Techniques',
    description: 'Master complex workflows',
    icon: TrendingUp,
    count: 22,
    color: 'bg-orange-500'
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
    thumbnail: '/api/placeholder/400/225',
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
    thumbnail: '/api/placeholder/400/225',
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
    thumbnail: '/api/placeholder/400/225',
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

function AcademyPage() {
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
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'Advanced': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'Expert': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Kairo Academy
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Master workflow automation with comprehensive courses, tutorials, and certifications
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search courses, tutorials, and certifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Learning Paths</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-12">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">34.5k</div>
                  <div className="text-sm text-muted-foreground">Active Students</div>
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

            {/* Featured Learning Paths */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Rocket className="h-6 w-6 text-primary" />
                Featured Learning Paths
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

            {/* Popular Tutorials */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Popular Tutorials
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

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All Categories
              </Button>
              {tutorialCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.title} ({category.count})
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

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Professional Certifications</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Validate your automation skills with industry-recognized certifications
              </p>
            </div>

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
                            <div className="flex items-center gap-2">
                              <Award className="h-3 w-3 text-muted-foreground" />
                              {cert.completed.toLocaleString()} certifications earned
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
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(AcademyPage);