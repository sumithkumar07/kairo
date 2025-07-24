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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Users,
  TrendingUp,
  Star,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Search,
  Filter,
  Plus,
  Pin,
  Lock,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Code,
  Globe,
  Workflow,
  Zap,
  Shield,
  Crown,
  Award,
  Target,
  Activity,
  Calendar,
  MapPin,
  ExternalLink,
  Share,
  Bookmark,
  Flag,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Tag,
  Hash,
  Flame,
  TrendingDown,
  Coffee,
  Heart,
  Smile
} from 'lucide-react';

// Forum categories
const forumCategories = [
  {
    id: 'general',
    name: 'General Discussion',
    description: 'General questions and discussions about Kairo',
    icon: MessageSquare,
    color: 'text-blue-500 bg-blue-500/10',
    topics: 1247,
    posts: 8934,
    lastActivity: '2 minutes ago'
  },
  {
    id: 'workflows',
    name: 'Workflow Building',
    description: 'Share and discuss workflow patterns and best practices',
    icon: Workflow,
    color: 'text-green-500 bg-green-500/10',
    topics: 856,
    posts: 5432,
    lastActivity: '5 minutes ago'
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Help with third-party service integrations',
    icon: Globe,
    color: 'text-purple-500 bg-purple-500/10',
    topics: 634,
    posts: 3921,
    lastActivity: '12 minutes ago'
  },
  {
    id: 'ai-features',
    name: 'AI Features',
    description: 'Discuss AI-powered automation and God-tier features',
    icon: Zap,
    color: 'text-yellow-500 bg-yellow-500/10',
    topics: 423,
    posts: 2187,
    lastActivity: '18 minutes ago'
  },
  {
    id: 'showcase',
    name: 'Showcase',
    description: 'Show off your awesome automations and get feedback',
    icon: Star,
    color: 'text-pink-500 bg-pink-500/10',
    topics: 312,
    posts: 1876,
    lastActivity: '25 minutes ago'
  },
  {
    id: 'feedback',
    name: 'Feature Requests',
    description: 'Suggest new features and improvements',
    icon: Lightbulb,
    color: 'text-orange-500 bg-orange-500/10',
    topics: 289,
    posts: 1543,
    lastActivity: '1 hour ago'
  }
];

// Featured topics
const featuredTopics = [
  {
    id: 1,
    title: 'How to build a lead nurturing workflow that converts 40% better',
    category: 'Workflows',
    author: 'Sarah Chen',
    authorAvatar: 'SC',
    authorRole: 'Automation Expert',
    replies: 47,
    views: 2341,
    likes: 89,
    lastReply: '2 hours ago',
    isPinned: true,
    tags: ['lead-nurturing', 'marketing', 'conversion'],
    excerpt: 'After testing dozens of different approaches, I\'ve found a workflow pattern that consistently improves conversion rates by 40%. Here\'s exactly how to build it...'
  },
  {
    id: 2,
    title: 'Salesforce integration: Complete setup guide with troubleshooting',
    category: 'Integrations',
    author: 'Michael Rodriguez',
    authorAvatar: 'MR',
    authorRole: 'Integration Specialist',
    replies: 31,
    views: 1856,
    likes: 67,
    lastReply: '4 hours ago',
    isSolved: true,
    tags: ['salesforce', 'integration', 'guide'],
    excerpt: 'Comprehensive guide covering OAuth setup, field mapping, error handling, and common issues. Updated for 2024 with latest Salesforce changes.'
  },
  {
    id: 3,
    title: 'AI workflow generation: Tips for better prompts and results',
    category: 'AI Features',
    author: 'Emily Watson',
    authorAvatar: 'EW',
    authorRole: 'AI Researcher',
    replies: 23,
    views: 1432,
    likes: 54,
    lastReply: '6 hours ago',
    isHot: true,
    tags: ['ai', 'prompts', 'workflow-generation'],
    excerpt: 'The key to getting great results from AI workflow generation is in how you structure your prompts. Here are proven techniques that work...'
  }
];

// Recent topics
const recentTopics = [
  {
    id: 4,
    title: 'Error handling best practices for production workflows',
    category: 'Workflows',
    author: 'David Kim',
    authorAvatar: 'DK',
    replies: 12,
    views: 543,
    likes: 28,
    lastReply: '30 minutes ago',
    tags: ['error-handling', 'production', 'best-practices']
  },
  {
    id: 5,
    title: 'Slack notification not working - help needed',
    category: 'Integrations',
    author: 'Lisa Park',
    authorAvatar: 'LP',
    replies: 8,
    views: 234,
    likes: 5,
    lastReply: '45 minutes ago',
    needsHelp: true,
    tags: ['slack', 'notifications', 'troubleshooting']
  },
  {
    id: 6,
    title: 'Custom integration with Airtable - sharing my solution',
    category: 'Showcase',
    author: 'Alex Thompson',
    authorAvatar: 'AT',
    replies: 15,
    views: 687,
    likes: 34,
    lastReply: '1 hour ago',
    tags: ['airtable', 'custom-integration', 'solution']
  },
  {
    id: 7,
    title: 'Feature request: Bulk workflow operations',
    category: 'Feature Requests',
    author: 'Rachel Green',
    authorAvatar: 'RG',
    replies: 6,
    views: 189,
    likes: 12,
    lastReply: '2 hours ago',
    tags: ['feature-request', 'bulk-operations', 'workflows']
  }
];

// Community stats
const communityStats = {
  totalMembers: 15847,
  activeToday: 2341,
  totalTopics: 4156,
  totalPosts: 23784,
  expertsOnline: 47
};

// Top contributors
const topContributors = [
  { name: 'Sarah Chen', avatar: 'SC', posts: 234, reputation: 2847, badge: 'Expert' },
  { name: 'Michael Rodriguez', avatar: 'MR', posts: 198, reputation: 2156, badge: 'Specialist' },
  { name: 'Emily Watson', avatar: 'EW', posts: 167, reputation: 1923, badge: 'Researcher' },
  { name: 'David Kim', avatar: 'DK', posts: 142, reputation: 1654, badge: 'Helper' },
  { name: 'Lisa Park', avatar: 'LP', posts: 128, reputation: 1432, badge: 'Contributor' }
];

function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const allTopics = [...featuredTopics, ...recentTopics];

  const filteredTopics = allTopics.filter(topic => {
    if (searchTerm && !topic.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedCategory !== 'all' && topic.category !== selectedCategory) return false;
    return true;
  });

  const getTopicIcon = (topic: any) => {
    if (topic.isPinned) return <Pin className="h-4 w-4 text-primary" />;
    if (topic.isSolved) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (topic.isHot) return <Flame className="h-4 w-4 text-orange-500" />;
    if (topic.needsHelp) return <HelpCircle className="h-4 w-4 text-blue-500" />;
    return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Expert': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Specialist': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Researcher': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'Helper': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Contributor': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Community</span> Forum
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with fellow automation enthusiasts, share knowledge, and get help from the community
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {communityStats.totalMembers.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {communityStats.activeToday.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Active Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {communityStats.totalTopics.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Topics</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {communityStats.totalPosts.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {communityStats.expertsOnline}
              </div>
              <div className="text-sm text-muted-foreground">Experts Online</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="contributors">Contributors</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Categories */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Hash className="h-6 w-6" />
                Forum Categories
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forumCategories.map((category) => {
                  const CategoryIcon = category.icon;
                  return (
                    <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${category.color}`}>
                            <CategoryIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            <CardDescription className="text-sm">{category.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Topics:</span>
                            <span className="font-medium">{category.topics}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Posts:</span>
                            <span className="font-medium">{category.posts}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Last activity:</span>
                            <span className="font-medium">{category.lastActivity}</span>
                          </div>
                          <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            Browse Topics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Featured Topics */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Featured Discussions
              </h2>
              <div className="space-y-4">
                {featuredTopics.map((topic) => (
                  <Card key={topic.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getTopicIcon(topic)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg leading-6 hover:text-primary cursor-pointer">
                              {topic.title}
                            </h3>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant="outline" className="shrink-0">
                                {topic.category}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {topic.excerpt}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {topic.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs bg-gradient-to-r from-primary to-purple-600 text-white">
                                    {topic.authorAvatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="font-medium text-foreground">{topic.author}</span>
                                  {topic.authorRole && (
                                    <span className="text-xs text-muted-foreground ml-1">• {topic.authorRole}</span>
                                  )}
                                </div>
                              </div>
                              <span>•</span>
                              <span>{topic.lastReply}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                {topic.replies}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {topic.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                {topic.likes}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-8">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search discussions..."
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
                    {forumCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="unanswered">Unanswered</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Topic
                </Button>
              </div>
            </div>

            {/* Topics List */}
            <div className="space-y-4">
              {filteredTopics.map((topic) => (
                <Card key={topic.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getTopicIcon(topic)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold hover:text-primary cursor-pointer">
                            {topic.title}
                          </h3>
                          <Badge variant="outline" className="ml-4 shrink-0">
                            {topic.category}
                          </Badge>
                        </div>
                        {topic.excerpt && (
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
                            {topic.excerpt}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {topic.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-gradient-to-r from-primary to-purple-600 text-white">
                                {topic.authorAvatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{topic.author}</span>
                            <span className="text-sm text-muted-foreground">• {topic.lastReply}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {topic.replies}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {topic.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              {topic.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contributors Tab */}
          <TabsContent value="contributors" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Top Contributors */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-500" />
                  Top Contributors
                </h2>
                <div className="space-y-4">
                  {topContributors.map((contributor, index) => (
                    <Card key={contributor.name} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-muted-foreground">
                                #{index + 1}
                              </span>
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="text-lg bg-gradient-to-r from-primary to-purple-600 text-white">
                                  {contributor.avatar}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{contributor.name}</h3>
                                <Badge className={getBadgeColor(contributor.badge)}>
                                  {contributor.badge}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {contributor.posts} posts • {contributor.reputation} reputation
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-lg font-bold text-primary">
                              <Star className="h-5 w-5 fill-current" />
                              {contributor.reputation}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Community Guidelines */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Community Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-semibold mb-2">Be Respectful</h4>
                        <p className="text-muted-foreground">
                          Treat all community members with respect and kindness.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Stay On Topic</h4>
                        <p className="text-muted-foreground">
                          Keep discussions relevant to the category they're posted in.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Search First</h4>
                        <p className="text-muted-foreground">
                          Check if your question has already been answered.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Share Knowledge</h4>
                        <p className="text-muted-foreground">
                          Help others and contribute to the community's growth.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coffee className="h-5 w-5" />
                      Quick Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Feature Requests
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Get Help
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Star className="h-4 w-4 mr-2" />
                        Showcase
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Code className="h-4 w-4 mr-2" />
                        Developer Resources
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-8">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Community Events</h2>
              <p className="text-muted-foreground mb-6">
                Stay tuned for upcoming webinars, workshops, and community meetups
              </p>
              <Button>
                <Bell className="h-4 w-4 mr-2" />
                Get Notified
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(CommunityPage);