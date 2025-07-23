'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import {
  Calendar,
  Plus,
  ArrowRight,
  Zap,
  Bug,
  Shield,
  Sparkles,
  Workflow,
  Brain,
  Crown,
  Star,
  Users,
  Globe,
  Database,
  Code,
  Palette,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Lightbulb,
  Rocket,
  Heart,
  Gift,
  Settings,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const changelog = [
  {
    version: '2.1.0',
    date: '2025-01-23',
    type: 'major',
    title: 'Divine Powers & Quantum Simulation Engine',
    description: 'Introducing revolutionary quantum-powered workflow prediction and divine automation capabilities',
    changes: [
      {
        type: 'feature',
        title: 'Quantum Simulation Engine',
        description: 'Predict workflow outcomes with 99.1% accuracy using quantum computing principles',
        tags: ['quantum', 'prediction', 'ai']
      },
      {
        type: 'feature',
        title: 'HIPAA Compliance Pack',
        description: 'Enterprise-grade healthcare automation with full audit documentation',
        tags: ['healthcare', 'compliance', 'enterprise']
      },
      {
        type: 'feature',
        title: 'Reality Fabricator API',
        description: 'Control physical reality through IoT and robotics integrations',
        tags: ['iot', 'robotics', 'api']
      },
      {
        type: 'improvement',
        title: 'Enhanced AI Workflow Generation',
        description: 'Improved natural language processing for workflow creation',
        tags: ['ai', 'nlp', 'generation']
      }
    ]
  },
  {
    version: '2.0.5',
    date: '2025-01-20',
    type: 'minor',
    title: 'Performance & Security Enhancements',
    description: 'Significant performance improvements and enhanced security features',
    changes: [
      {
        type: 'improvement',
        title: '40% Faster Workflow Execution',
        description: 'Optimized workflow engine for better performance',
        tags: ['performance', 'optimization']
      },
      {
        type: 'security',
        title: 'Enhanced API Security',
        description: 'Improved rate limiting and authentication mechanisms',
        tags: ['security', 'api', 'authentication']
      },
      {
        type: 'fix',
        title: 'Integration Stability Fixes',
        description: 'Fixed connection issues with Salesforce and HubSpot',
        tags: ['integrations', 'stability']
      }
    ]
  },
  {
    version: '2.0.4',
    date: '2025-01-15',
    type: 'patch',
    title: 'Bug Fixes & UI Improvements',
    description: 'Various bug fixes and user interface enhancements',
    changes: [
      {
        type: 'fix',
        title: 'Workflow Editor Crash Fix',
        description: 'Resolved crashes when editing complex workflows',
        tags: ['editor', 'stability']
      },
      {
        type: 'ui',
        title: 'Improved Dashboard Layout',
        description: 'Better responsive design for mobile devices',
        tags: ['ui', 'mobile', 'responsive']
      },
      {
        type: 'improvement',
        title: 'Template Search Enhancement',
        description: 'Better search algorithms for finding relevant templates',
        tags: ['search', 'templates']
      }
    ]
  },
  {
    version: '2.0.3',
    date: '2025-01-10',
    type: 'minor',
    title: 'New Integrations & AI Features',
    description: 'Added support for new third-party services and enhanced AI capabilities',
    changes: [
      {
        type: 'feature',
        title: 'Microsoft Teams Integration',
        description: 'Send notifications and updates directly to Teams channels',
        tags: ['integrations', 'teams', 'notifications']
      },
      {
        type: 'feature',
        title: 'Advanced AI Debugging',
        description: 'AI-powered workflow debugging and optimization suggestions',
        tags: ['ai', 'debugging', 'optimization']
      },
      {
        type: 'improvement',
        title: 'Template Marketplace Expansion',
        description: 'Added 150+ new community-contributed templates',
        tags: ['templates', 'community']
      }
    ]
  },
  {
    version: '2.0.2',
    date: '2025-01-05',
    type: 'patch',
    title: 'Holiday Performance Optimizations',
    description: 'Performance improvements for handling increased holiday traffic',
    changes: [
      {
        type: 'improvement',
        title: 'Load Balancing Enhancements',
        description: 'Better distribution of workflow execution across servers',
        tags: ['performance', 'infrastructure']
      },
      {
        type: 'fix',
        title: 'Memory Leak Resolution',
        description: 'Fixed memory leaks in long-running workflows',
        tags: ['performance', 'memory']
      }
    ]
  }
];

const upcomingFeatures = [
  {
    title: 'White-Label Enterprise Solution',
    description: 'Custom branding and deployment options for enterprise clients',
    expectedDate: '2025-02-15',
    status: 'in_development',
    tags: ['enterprise', 'branding', 'deployment']
  },
  {
    title: 'Advanced Team Collaboration',
    description: 'Real-time collaborative workflow editing and team workspaces',
    expectedDate: '2025-03-01',
    status: 'planning',
    tags: ['collaboration', 'teams', 'workspaces']
  },
  {
    title: 'Mobile App Release',
    description: 'Native iOS and Android apps for workflow monitoring',
    expectedDate: '2025-03-15',
    status: 'design',
    tags: ['mobile', 'ios', 'android']
  },
  {
    title: 'Global Consciousness 2.0',
    description: 'Next-generation collective intelligence with 10B+ device integration',
    expectedDate: '2025-04-01',
    status: 'research',
    tags: ['ai', 'consciousness', 'iot']
  }
];

const featureRequests = [
  {
    id: '1',
    title: 'Slack Direct Message Integration',
    description: 'Send DMs to specific Slack users from workflows',
    votes: 247,
    status: 'considering',
    submittedBy: 'Sarah M.',
    tags: ['slack', 'messaging']
  },
  {
    id: '2',
    title: 'Custom Webhook Headers',
    description: 'Support for custom headers in webhook triggers',
    votes: 189,
    status: 'planned',
    submittedBy: 'Dev Team',
    tags: ['webhooks', 'api']
  },
  {
    id: '3',
    title: 'Workflow Scheduling with Cron',
    description: 'Advanced scheduling using cron expressions',
    votes: 156,
    status: 'in_development',
    submittedBy: 'Mike J.',
    tags: ['scheduling', 'cron']
  }
];

function ChangelogPage() {
  const [activeTab, setActiveTab] = useState('changelog');

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Plus className="h-4 w-4 text-green-600" />;
      case 'improvement': return <ArrowRight className="h-4 w-4 text-blue-600" />;
      case 'fix': return <Bug className="h-4 w-4 text-red-600" />;
      case 'security': return <Shield className="h-4 w-4 text-purple-600" />;
      case 'ui': return <Palette className="h-4 w-4 text-pink-600" />;
      default: return <Sparkles className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-green-100 text-green-800 dark:bg-green-900/20';
      case 'improvement': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20';
      case 'fix': return 'bg-red-100 text-red-800 dark:bg-red-900/20';
      case 'security': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20';
      case 'ui': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20';
    }
  };

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'minor': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'patch': return 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_development': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20';
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20';
      case 'design': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20';
      case 'research': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20';
      case 'planned': return 'bg-green-100 text-green-800 dark:bg-green-900/20';
      case 'considering': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-2xl" />
          <div className="relative p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      Changelog
                    </h1>
                    <p className="text-muted-foreground text-lg">
                      Stay updated with the latest features, improvements, and fixes
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Subscribe to Updates
                </Button>
                <Button asChild>
                  <Link href="/feedback">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Request Feature
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="changelog" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Recent Updates
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Coming Soon
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Feature Requests
            </TabsTrigger>
          </TabsList>

          {/* Changelog Tab */}
          <TabsContent value="changelog" className="space-y-8 mt-6">
            {changelog.map((release) => (
              <Card key={release.version} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge className={getVersionTypeColor(release.type)}>
                          v{release.version}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(release.date).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-2xl">{release.title}</CardTitle>
                      <CardDescription className="text-base">
                        {release.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {release.changes.map((change, index) => (
                      <div key={index} className="flex gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {getChangeTypeIcon(change.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold">{change.title}</h4>
                            <Badge className={getChangeTypeColor(change.type)}>
                              {change.type}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {change.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {change.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingFeatures.map((feature, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500" />
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge className={getStatusColor(feature.status)}>
                          {feature.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {new Date(feature.expectedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {feature.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Feature Requests Tab */}
          <TabsContent value="requests" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Community Feature Requests</CardTitle>
                    <CardDescription>
                      Vote on features you'd like to see implemented
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href="/feedback">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Request
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featureRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold">{request.title}</h4>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {request.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Submitted by {request.submittedBy}</span>
                          <div className="flex flex-wrap gap-1">
                            {request.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-center">
                          <p className="text-lg font-bold">{request.votes}</p>
                          <p className="text-xs text-muted-foreground">votes</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4 mr-1" />
                          Vote
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(ChangelogPage);