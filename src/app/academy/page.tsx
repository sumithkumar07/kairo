'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  Award,
  Star,
  Clock,
  Users,
  BookOpen,
  Play,
  CheckCircle,
  Trophy,
  Target,
  Zap,
  Crown,
  Workflow,
  Globe,
  Code,
  Shield,
  Database,
  BarChart3,
  Brain,
  Lightbulb,
  Rocket,
  Search,
  Filter,
  Calendar,
  MapPin,
  ExternalLink,
  Download,
  Share,
  Bookmark,
  Eye,
  ThumbsUp,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  Plus,
  TrendingUp,
  Activity,
  Settings,
  Lock,
  Unlock,
  Flame,
  Sparkles,
  Medal,
  Certificate,
  Layers
} from 'lucide-react';

// Learning paths
const learningPaths = [
  {
    id: 'automation-fundamentals',
    title: 'Automation Fundamentals',
    description: 'Master the basics of workflow automation and build your first automated processes',
    level: 'Beginner',
    duration: '4-6 weeks',
    modules: 8,
    students: 15420,
    rating: 4.9,
    progress: 0,
    icon: Lightbulb,
    color: 'from-green-500 to-emerald-500',
    prerequisites: [],
    skills: ['Workflow Building', 'Trigger Understanding', 'Basic Actions', 'Testing & Debugging'],
    modules_list: [
      { title: 'Introduction to Automation', duration: '45 min', completed: false },
      { title: 'Understanding Triggers', duration: '1h 15min', completed: false },
      { title: 'Working with Actions', duration: '1h 30min', completed: false },
      { title: 'Data Flow and Mapping', duration: '1h 10min', completed: false },
      { title: 'Testing Your Workflows', duration: '50min', completed: false },
      { title: 'Error Handling Basics', duration: '40min', completed: false },
      { title: 'Publishing and Monitoring', duration: '35min', completed: false },
      { title: 'Best Practices', duration: '55min', completed: false }
    ]
  },
  {
    id: 'integration-mastery',
    title: 'Integration Mastery',
    description: 'Connect all your favorite tools and services with advanced integration techniques',
    level: 'Intermediate',
    duration: '6-8 weeks',
    modules: 12,
    students: 8750,
    rating: 4.8,
    progress: 25,
    icon: Globe,
    color: 'from-blue-500 to-cyan-500',
    prerequisites: ['Automation Fundamentals'],
    skills: ['OAuth Setup', 'API Integration', 'Data Mapping', 'Rate Limiting', 'Custom Connectors'],
    modules_list: [
      { title: 'Integration Fundamentals', duration: '1h', completed: true },
      { title: 'OAuth and Authentication', duration: '1h 30min', completed: true },
      { title: 'Popular Service Integrations', duration: '2h', completed: true },
      { title: 'API Rate Limiting', duration: '45min', completed: false },
      { title: 'Custom Integration Development', duration: '2h 30min', completed: false },
      { title: 'Error Handling in Integrations', duration: '1h 15min', completed: false }
    ]
  },
  {
    id: 'ai-automation-expert',
    title: 'AI Automation Expert',
    description: 'Leverage cutting-edge AI features to build intelligent, self-optimizing workflows',
    level: 'Advanced',
    duration: '8-10 weeks',
    modules: 15,
    students: 4230,
    rating: 4.9,
    progress: 0,
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    prerequisites: ['Automation Fundamentals', 'Integration Mastery'],
    skills: ['AI Workflow Generation', 'Natural Language Processing', 'Smart Decision Making', 'God-Tier Features'],
    modules_list: []
  },
  {
    id: 'enterprise-architect',
    title: 'Enterprise Automation Architect',
    description: 'Design and implement large-scale automation solutions for enterprise environments',
    level: 'Expert',
    duration: '10-12 weeks',
    modules: 18,
    students: 1890,
    rating: 4.7,
    progress: 0,
    icon: Crown,
    color: 'from-yellow-500 to-orange-500',
    prerequisites: ['AI Automation Expert'],
    skills: ['Enterprise Architecture', 'Scalability Planning', 'Security Implementation', 'Team Management'],
    modules_list: []
  }
];

// Certifications
const certifications = [
  {
    id: 'certified-automation-specialist',
    title: 'Certified Automation Specialist',
    description: 'Demonstrate your expertise in workflow automation and earn industry recognition',
    level: 'Professional',
    duration: '3 hours',
    passingScore: 80,
    attempts: 3,
    validFor: '2 years',
    price: 149,
    icon: Award,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    prerequisites: ['Automation Fundamentals'],
    topics: [
      'Workflow Design Principles',
      'Integration Best Practices',
      'Error Handling and Recovery',
      'Performance Optimization',
      'Security and Compliance'
    ],
    benefits: [
      'Industry-recognized credential',
      'Digital certificate and badge',
      'Access to exclusive community',
      'Priority support access'
    ]
  },
  {
    id: 'certified-integration-expert',
    title: 'Certified Integration Expert',
    description: 'Master complex integrations and become a recognized integration specialist',
    level: 'Expert',
    duration: '4 hours',
    passingScore: 85,
    attempts: 2,
    validFor: '2 years',
    price: 249,
    icon: Globe,
    color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    prerequisites: ['Integration Mastery', 'Certified Automation Specialist'],
    topics: [
      'Advanced API Integration',
      'Custom Connector Development',
      'OAuth and Security',
      'Performance and Scaling',
      'Enterprise Integration Patterns'
    ],
    benefits: [
      'Expert-level recognition',
      'Exclusive integration resources',
      'Direct access to integration team',
      'Quarterly expert roundtables'
    ]
  },
  {
    id: 'certified-ai-automation-master',
    title: 'Certified AI Automation Master',
    description: 'The highest level of AI automation expertise and mastery certification',
    level: 'Master',
    duration: '5 hours',
    passingScore: 90,
    attempts: 1,
    validFor: '3 years',
    price: 399,
    icon: Brain,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
    prerequisites: ['AI Automation Expert', 'Certified Integration Expert'],
    topics: [
      'AI-Powered Workflow Generation',
      'Natural Language Processing',
      'God-Tier Feature Implementation',
      'Advanced Decision Making',
      'AI Ethics and Compliance'
    ],
    benefits: [
      'Master-level recognition',
      'Lifetime learning access',
      'AI feature beta access',
      'Annual master summit invitation'
    ]
  }
];

// Skill assessments
const skillAssessments = [
  {
    id: 'workflow-basics',
    title: 'Workflow Building Basics',
    description: 'Test your understanding of fundamental workflow concepts',
    duration: '15 minutes',
    questions: 20,
    difficulty: 'Beginner',
    completions: 12450,
    averageScore: 87
  },
  {
    id: 'integration-skills',
    title: 'Integration Skills Assessment',
    description: 'Evaluate your integration and API connection abilities',
    duration: '25 minutes',
    questions: 30,
    difficulty: 'Intermediate',
    completions: 5670,
    averageScore: 78
  },
  {
    id: 'ai-automation',
    title: 'AI Automation Proficiency',
    description: 'Assess your knowledge of AI-powered automation features',
    duration: '30 minutes',
    questions: 35,
    difficulty: 'Advanced',
    completions: 2340,
    averageScore: 71
  }
];

// Upcoming events
const upcomingEvents = [
  {
    id: 1,
    title: 'Automation Best Practices Webinar',
    description: 'Learn proven strategies for building reliable, scalable workflows',
    type: 'Webinar',
    date: '2024-03-25',
    time: '2:00 PM EST',
    duration: '1 hour',
    instructor: 'Sarah Chen',
    attendees: 234,
    maxAttendees: 500,
    isLive: false
  },
  {
    id: 2,
    title: 'AI Features Deep Dive Workshop',
    description: 'Hands-on workshop exploring advanced AI automation capabilities',
    type: 'Workshop',
    date: '2024-03-28',
    time: '10:00 AM EST',
    duration: '3 hours',
    instructor: 'Michael Rodriguez',
    attendees: 45,
    maxAttendees: 100,
    isLive: false
  },
  {
    id: 3,
    title: 'Integration Troubleshooting Live Session',
    description: 'Bring your integration challenges and get expert help',
    type: 'Live Session',
    date: '2024-03-30',
    time: '1:00 PM EST',
    duration: '2 hours',
    instructor: 'Emily Watson',
    attendees: 67,
    maxAttendees: 150,
    isLive: true
  }
];

function AcademyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPath, setSelectedPath] = useState<any>(null);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Advanced': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Expert': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Professional': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Master': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Kairo <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Academy</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Master automation through structured learning paths, earn certifications, and become an expert
          </p>
        </div>

        <Tabs defaultValue="paths" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="assessments">Skill Tests</TabsTrigger>
            <TabsTrigger value="events">Live Events</TabsTrigger>
          </TabsList>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="space-y-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Progress</span>
                          <span>12%</span>
                        </div>
                        <Progress value={12} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span>3 Certificates Earned</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span>2 Paths In Progress</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-green-500" />
                          <span>24h Study Time</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content */}
              <div className="lg:col-span-3">
                <div className="space-y-8">
                  {learningPaths.map((path) => {
                    const PathIcon = path.icon;
                    return (
                      <Card key={path.id} className="group hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-8">
                          <div className="grid lg:grid-cols-3 gap-6">
                            {/* Content */}
                            <div className="lg:col-span-2 space-y-4">
                              <div className="flex items-start gap-4">
                                <div className={`p-4 bg-gradient-to-r ${path.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                  <PathIcon className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-bold">{path.title}</h3>
                                    <Badge className={getLevelColor(path.level)}>
                                      {path.level}
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground mb-4">
                                    {path.description}
                                  </p>
                                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {path.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <BookOpen className="h-4 w-4" />
                                      {path.modules} modules
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      {path.students.toLocaleString()} students
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      {path.rating}
                                    </span>
                                  </div>
                                  
                                  {path.progress > 0 && (
                                    <div className="mb-4">
                                      <div className="flex justify-between text-sm mb-2">
                                        <span>Your Progress</span>
                                        <span>{path.progress}%</span>
                                      </div>
                                      <Progress value={path.progress} className="h-2" />
                                    </div>
                                  )}

                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="font-semibold mb-2">You'll Learn:</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {path.skills.map((skill) => (
                                          <Badge key={skill} variant="secondary" className="text-xs">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {path.prerequisites.length > 0 && (
                                      <div>
                                        <h4 className="font-semibold mb-2">Prerequisites:</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {path.prerequisites.map((prereq) => (
                                            <Badge key={prereq} variant="outline" className="text-xs">
                                              {prereq}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex gap-3 mt-6">
                                    <Button className="group">
                                      {path.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <Button variant="outline" onClick={() => setSelectedPath(path)}>
                                      View Curriculum
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Visual */}
                            <div className="lg:col-span-1">
                              <div className="aspect-square bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
                                <div className={`p-6 bg-gradient-to-r ${path.color} rounded-full shadow-xl`}>
                                  <PathIcon className="h-12 w-12 text-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Path Details Modal would go here */}
            {selectedPath && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <selectedPath.icon className="h-6 w-6" />
                    {selectedPath.title} - Curriculum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedPath.modules_list.map((module: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <span className="text-sm font-bold text-primary">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{module.title}</div>
                            <div className="text-sm text-muted-foreground">{module.duration}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {module.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => setSelectedPath(null)} className="mt-4">
                    Close
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert) => {
                const CertIcon = cert.icon;
                return (
                  <Card key={cert.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-lg ${cert.color}`}>
                          <CertIcon className="h-6 w-6" />
                        </div>
                        <Badge className={getLevelColor(cert.level)}>
                          {cert.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{cert.title}</CardTitle>
                      <CardDescription>{cert.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <div className="font-medium">{cert.duration}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Passing Score:</span>
                            <div className="font-medium">{cert.passingScore}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Attempts:</span>
                            <div className="font-medium">{cert.attempts}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valid For:</span>
                            <div className="font-medium">{cert.validFor}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Prerequisites:</h4>
                          <div className="flex flex-wrap gap-1">
                            {cert.prerequisites.map((prereq) => (
                              <Badge key={prereq} variant="outline" className="text-xs">
                                {prereq}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Benefits:</h4>
                          <ul className="space-y-1">
                            {cert.benefits.slice(0, 2).map((benefit, index) => (
                              <li key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <div className="text-2xl font-bold text-primary">
                            ${cert.price}
                          </div>
                          <Button size="sm" className="group">
                            Register
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Skill Assessments Tab */}
          <TabsContent value="assessments" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillAssessments.map((assessment) => (
                <Card key={assessment.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getLevelColor(assessment.difficulty)}>
                        {assessment.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {assessment.duration}
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2">{assessment.title}</CardTitle>
                    <CardDescription>{assessment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Questions:</span>
                          <div className="font-medium">{assessment.questions}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Completions:</span>
                          <div className="font-medium">{assessment.completions.toLocaleString()}</div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Average Score</span>
                          <span className="font-medium">{assessment.averageScore}%</span>
                        </div>
                        <Progress value={assessment.averageScore} className="h-2" />
                      </div>

                      <Button className="w-full group">
                        Start Assessment
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Events Tab */}
          <TabsContent value="events" className="space-y-8">
            <div className="space-y-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-3">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold">{event.title}</h3>
                              <Badge variant={event.isLive ? "destructive" : "secondary"}>
                                {event.type}
                              </Badge>
                              {event.isLive && (
                                <Badge variant="destructive" className="animate-pulse">
                                  <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                                  Live
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-4">
                              {event.description}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {event.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {event.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.attendees}/{event.maxAttendees} registered
                              </span>
                            </div>
                            <div className="mt-4">
                              <div className="text-sm text-muted-foreground mb-2">
                                Instructor: <span className="font-medium text-foreground">{event.instructor}</span>
                              </div>
                              <Progress 
                                value={(event.attendees / event.maxAttendees) * 100} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-span-1 flex flex-col justify-center">
                        <div className="space-y-3">
                          <Button className="w-full">
                            {event.isLive ? 'Join Live' : 'Register'}
                          </Button>
                          <Button variant="outline" size="sm" className="w-full">
                            Add to Calendar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(AcademyPage);