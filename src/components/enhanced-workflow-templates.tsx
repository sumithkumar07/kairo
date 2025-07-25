'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Star, 
  Play, 
  Download, 
  Heart, 
  Clock, 
  Users, 
  CheckCircle, 
  Zap, 
  Brain, 
  Crown,
  Sparkles,
  Target,
  TrendingUp,
  Shield,
  Globe,
  Workflow,
  Bot,
  Database,
  Mail,
  MessageSquare,
  CreditCard,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  ArrowRight,
  Plus,
  Copy,
  Share2,
  Bookmark,
  Tag,
  GitBranch,
  History,
  Eye
} from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  stats: {
    uses: number;
    rating: number;
    reviews: number;
    likes: number;
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  lastUpdated: string;
  isPremium: boolean;
  isOfficial: boolean;
  isFeatured: boolean;
  preview: {
    nodes: number;
    connections: number;
    triggers: string[];
    actions: string[];
  };
  versions: {
    current: string;
    changelog: string;
  };
}

interface CollaborationInfo {
  userId: string;
  userName: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
  cursor?: { x: number; y: number };
  selection?: string[];
}

interface WorkflowHistory {
  id: string;
  timestamp: string;
  action: 'created' | 'modified' | 'saved' | 'shared';
  userId: string;
  userName: string;
  description: string;
  version: string;
}

const sampleTemplates: WorkflowTemplate[] = [
  {
    id: '1',
    name: 'Customer Onboarding Automation',
    description: 'Complete customer welcome sequence with email campaigns, account setup, and follow-up tasks',
    category: 'Customer Success',
    tags: ['email', 'automation', 'onboarding', 'customer-success'],
    author: {
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      verified: true
    },
    stats: {
      uses: 1247,
      rating: 4.8,
      reviews: 89,
      likes: 234
    },
    difficulty: 'intermediate',
    estimatedTime: 30,
    lastUpdated: '2024-01-15',
    isPremium: false,
    isOfficial: true,
    isFeatured: true,
    preview: {
      nodes: 8,
      connections: 12,
      triggers: ['Form Submission', 'Email Opened'],
      actions: ['Send Email', 'Update CRM', 'Schedule Follow-up']
    },
    versions: {
      current: '2.1.0',
      changelog: 'Added Slack notifications and improved error handling'
    }
  },
  {
    id: '2',
    name: 'AI-Powered Lead Scoring',
    description: 'Automatically score and qualify leads using machine learning and behavioral data',
    category: 'Sales',
    tags: ['ai', 'lead-scoring', 'machine-learning', 'sales'],
    author: {
      name: 'Mike Chen',
      verified: true
    },
    stats: {
      uses: 892,
      rating: 4.9,
      reviews: 67,
      likes: 178
    },
    difficulty: 'advanced',
    estimatedTime: 45,
    lastUpdated: '2024-01-12',
    isPremium: true,
    isOfficial: false,
    isFeatured: true,
    preview: {
      nodes: 12,
      connections: 18,
      triggers: ['New Lead', 'Data Updated'],
      actions: ['AI Analysis', 'Score Update', 'Assign to Sales']
    },
    versions: {
      current: '1.3.2',
      changelog: 'Improved AI model accuracy and added more data sources'
    }
  },
  {
    id: '3',
    name: 'Social Media Cross-Posting',
    description: 'Automatically post content across multiple social media platforms with customized messaging',
    category: 'Marketing',
    tags: ['social-media', 'marketing', 'automation', 'content'],
    author: {
      name: 'Emily Rodriguez',
      verified: true
    },
    stats: {
      uses: 2341,
      rating: 4.7,
      reviews: 156,
      likes: 423
    },
    difficulty: 'beginner',
    estimatedTime: 15,
    lastUpdated: '2024-01-10',
    isPremium: false,
    isOfficial: true,
    isFeatured: false,
    preview: {
      nodes: 6,
      connections: 8,
      triggers: ['Content Created', 'Schedule Timer'],
      actions: ['Post to Twitter', 'Post to LinkedIn', 'Post to Facebook']
    },
    versions: {
      current: '1.5.1',
      changelog: 'Added Instagram support and improved image handling'
    }
  }
];

export function EnhancedWorkflowTemplates() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>(sampleTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkflowTemplate[]>(sampleTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [collaborators, setCollaborators] = useState<CollaborationInfo[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowHistory[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock collaboration data
  useEffect(() => {
    const mockCollaborators: CollaborationInfo[] = [
      {
        userId: '1',
        userName: 'John Doe',
        avatar: '/avatars/john.jpg',
        status: 'online',
        lastSeen: new Date().toISOString(),
        cursor: { x: 245, y: 180 },
        selection: ['node-1', 'node-2']
      },
      {
        userId: '2',
        userName: 'Jane Smith',
        status: 'away',
        lastSeen: new Date(Date.now() - 300000).toISOString()
      }
    ];
    setCollaborators(mockCollaborators);

    const mockHistory: WorkflowHistory[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        action: 'modified',
        userId: '1',
        userName: 'John Doe',
        description: 'Updated email template configuration',
        version: '1.2.3'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        action: 'saved',
        userId: '2',
        userName: 'Jane Smith',
        description: 'Saved workflow checkpoint',
        version: '1.2.2'
      }
    ];
    setWorkflowHistory(mockHistory);
  }, []);

  useEffect(() => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(template => template.difficulty === selectedDifficulty);
    }

    setFilteredTemplates(filtered);
  }, [searchTerm, selectedCategory, selectedDifficulty, templates]);

  const categories = Array.from(new Set(templates.map(t => t.category)));
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const handleUseTemplate = (template: WorkflowTemplate) => {
    // Logic to load template into workflow editor
    console.log('Using template:', template);
    // Navigate to workflow editor with template data
    // router.push(`/workflow?template=${template.id}`);
  };

  const handleLikeTemplate = (templateId: string) => {
    setTemplates(prev => 
      prev.map(template => 
        template.id === templateId 
          ? { ...template, stats: { ...template.stats, likes: template.stats.likes + 1 } }
          : template
      )
    );
  };

  const handleShareTemplate = (template: WorkflowTemplate) => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: template.name,
        text: template.description,
        url: `${window.location.origin}/templates/${template.id}`
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/templates/${template.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            Workflow <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Templates</span>
          </h1>
          <p className="text-muted-foreground">
            Discover and customize proven automation workflows for your business
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowHistoryDialog(true)}>
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Collaboration Indicators */}
      {collaborators.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg border">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Active Collaborators:</span>
          </div>
          <div className="flex items-center gap-2">
            {collaborators.map(collab => (
              <div key={collab.userId} className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={collab.avatar} />
                    <AvatarFallback>{collab.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                    collab.status === 'online' ? 'bg-green-500' : 
                    collab.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                </div>
                <span className="text-sm">{collab.userName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Templates */}
      {filteredTemplates.some(t => t.isFeatured) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.filter(t => t.isFeatured).map(template => (
              <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 border-2 border-yellow-200 dark:border-yellow-800">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                        <Crown className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getDifficultyColor(template.difficulty)}>
                            {template.difficulty}
                          </Badge>
                          {template.isPremium && (
                            <Badge variant="secondary">Premium</Badge>
                          )}
                          {template.isOfficial && (
                            <Badge variant="secondary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Official
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeTemplate(template.id)}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShareTemplate(template)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{template.description}</CardDescription>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Author:</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={template.author.avatar} />
                          <AvatarFallback>{template.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{template.author.name}</span>
                        {template.author.verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{template.stats.rating}</span>
                        <span className="text-muted-foreground">({template.stats.reviews})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Used by:</span>
                      <span>{template.stats.uses.toLocaleString()} users</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Time to setup:</span>
                      <span>{template.estimatedTime} min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Button onClick={() => handleUseTemplate(template)} className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedTemplate(template)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Templates</h2>
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
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.filter(t => !t.isFeatured).map(template => (
              <Card key={template.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Workflow className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getDifficultyColor(template.difficulty)}>
                            {template.difficulty}
                          </Badge>
                          {template.isPremium && (
                            <Badge variant="secondary">Premium</Badge>
                          )}
                          {template.isOfficial && (
                            <Badge variant="secondary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Official
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeTemplate(template.id)}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShareTemplate(template)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{template.description}</CardDescription>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Author:</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={template.author.avatar} />
                          <AvatarFallback>{template.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{template.author.name}</span>
                        {template.author.verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{template.stats.rating}</span>
                        <span className="text-muted-foreground">({template.stats.reviews})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Used by:</span>
                      <span>{template.stats.uses.toLocaleString()} users</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Time to setup:</span>
                      <span>{template.estimatedTime} min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Button onClick={() => handleUseTemplate(template)} className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedTemplate(template)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTemplates.filter(t => !t.isFeatured).map(template => (
              <Card key={template.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Workflow className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(template.difficulty)}>
                            {template.difficulty}
                          </Badge>
                          {template.isPremium && (
                            <Badge variant="secondary">Premium</Badge>
                          )}
                          {template.isOfficial && (
                            <Badge variant="secondary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Official
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{template.stats.rating}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {template.stats.uses.toLocaleString()} uses
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleUseTemplate(template)}>
                          <Play className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedTemplate(template)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Template Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                {selectedTemplate.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedTemplate.author.avatar} />
                    <AvatarFallback>{selectedTemplate.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedTemplate.author.name}</span>
                      {selectedTemplate.author.verified && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Version {selectedTemplate.versions.current}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                    {selectedTemplate.difficulty}
                  </Badge>
                  {selectedTemplate.isPremium && (
                    <Badge variant="secondary">Premium</Badge>
                  )}
                  {selectedTemplate.isOfficial && (
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Official
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-muted-foreground">{selectedTemplate.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{selectedTemplate.preview.nodes}</div>
                  <div className="text-muted-foreground">Nodes</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{selectedTemplate.preview.connections}</div>
                  <div className="text-muted-foreground">Connections</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{selectedTemplate.estimatedTime}</div>
                  <div className="text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{selectedTemplate.stats.rating}</div>
                  <div className="text-muted-foreground">Rating</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <Button onClick={() => handleUseTemplate(selectedTemplate)} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Use This Template
                </Button>
                <Button variant="outline" onClick={() => handleLikeTemplate(selectedTemplate.id)}>
                  <Heart className="h-4 w-4 mr-2" />
                  Like
                </Button>
                <Button variant="outline" onClick={() => handleShareTemplate(selectedTemplate)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}