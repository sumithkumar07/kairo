/**
 * Enhanced Template Marketplace with Community Features
 * Advanced template sharing, rating, and deployment system
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  Filter, 
  Download, 
  Star, 
  Eye, 
  Clock, 
  Users, 
  Zap, 
  Upload,
  Heart,
  MessageSquare,
  Tag,
  TrendingUp,
  Award,
  Crown,
  Share2,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ALL_WORKFLOW_TEMPLATES, TEMPLATE_CATEGORIES, DIFFICULTY_LEVELS } from '@/data/advanced-templates';

interface CommunityTemplate extends typeof ALL_WORKFLOW_TEMPLATES[0] {
  author: {
    name: string;
    avatar?: string;
    badge?: 'verified' | 'pro' | 'expert';
    reputation: number;
  };
  community: {
    likes: number;
    comments: number;
    forks: number;
    isLiked: boolean;
    isBookmarked: boolean;
  };
  stats: {
    downloadCount: number;
    rating: number;
    ratingCount: number;
    successRate: number;
  };
  pricing: {
    type: 'free' | 'premium' | 'enterprise';
    price?: number;
  };
  lastUpdated: string;
  version: string;
}

const mockCommunityTemplates: CommunityTemplate[] = ALL_WORKFLOW_TEMPLATES.map((template, index) => ({
  ...template,
  author: {
    name: ['Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'David Kim', 'Lisa Wang'][index % 5],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
    badge: ['verified', 'pro', 'expert'][index % 3] as 'verified' | 'pro' | 'expert',
    reputation: 850 + (index * 127) % 2000
  },
  community: {
    likes: 45 + (index * 23) % 200,
    comments: 12 + (index * 7) % 50,
    forks: 8 + (index * 3) % 30,
    isLiked: index % 4 === 0,
    isBookmarked: index % 6 === 0
  },
  stats: {
    downloadCount: template.downloadCount || 100 + (index * 47) % 1000,
    rating: 4.2 + (index * 0.13) % 0.8,
    ratingCount: 23 + (index * 11) % 100,
    successRate: 85 + (index * 3) % 15
  },
  pricing: {
    type: index % 3 === 0 ? 'premium' : 'free',
    price: index % 3 === 0 ? 19 + (index * 5) % 50 : undefined
  },
  lastUpdated: new Date(Date.now() - (index * 86400000)).toISOString(),
  version: `1.${index % 10}.${index % 5}`
}));

export default function EnhancedTemplateMarketplace() {
  const [templates, setTemplates] = useState<CommunityTemplate[]>(mockCommunityTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showShareDialog, setShowShareDialog] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { toast } = useToast();

  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
      const matchesPricing = selectedPricing === 'all' || template.pricing.type === selectedPricing;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesPricing;
    });

    // Sort templates
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.stats.downloadCount - a.stats.downloadCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.stats.rating - a.stats.rating);
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'trending':
        filtered.sort((a, b) => b.community.likes - a.community.likes);
        break;
      default:
        break;
    }

    return filtered;
  }, [templates, searchTerm, selectedCategory, selectedDifficulty, selectedPricing, sortBy]);

  const handleLikeTemplate = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? {
            ...template,
            community: {
              ...template.community,
              isLiked: !template.community.isLiked,
              likes: template.community.isLiked 
                ? template.community.likes - 1 
                : template.community.likes + 1
            }
          }
        : template
    ));
  };

  const handleBookmarkTemplate = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? {
            ...template,
            community: {
              ...template.community,
              isBookmarked: !template.community.isBookmarked
            }
          }
        : template
    ));
  };

  const handleDeployTemplate = (template: CommunityTemplate) => {
    toast({
      title: "Template Deployed!",
      description: `"${template.name}" has been deployed to your workflow library.`,
    });
  };

  const handleShareTemplate = (templateId: string) => {
    const shareUrl = `https://kairo.ai/templates/${templateId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Share link copied!",
      description: "Template share link has been copied to your clipboard.",
    });
    setShowShareDialog(null);
  };

  const getAuthorBadge = (badge: CommunityTemplate['author']['badge']) => {
    const badges = {
      verified: { icon: CheckCircle, color: 'text-blue-500', label: 'Verified' },
      pro: { icon: Crown, color: 'text-purple-500', label: 'Pro' },
      expert: { icon: Award, color: 'text-yellow-500', label: 'Expert' }
    };

    if (!badge) return null;
    const BadgeIcon = badges[badge].icon;
    
    return (
      <div className={`flex items-center ${badges[badge].color}`}>
        <BadgeIcon className="w-4 h-4" />
        <span className="sr-only">{badges[badge].label}</span>
      </div>
    );
  };

  const getPricingBadge = (pricing: CommunityTemplate['pricing']) => {
    if (pricing.type === 'free') {
      return <Badge variant="outline" className="text-green-600 border-green-600">Free</Badge>;
    } else if (pricing.type === 'premium') {
      return <Badge variant="outline" className="text-purple-600 border-purple-600">${pricing.price}</Badge>;
    } else {
      return <Badge variant="outline" className="text-blue-600 border-blue-600">Enterprise</Badge>;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-blue-100 text-blue-800', 
      'advanced': 'bg-orange-100 text-orange-800',
      'expert': 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Marketplace</h1>
          <p className="text-muted-foreground">
            Discover, deploy, and share production-ready workflow templates
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Share Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Share Your Template</DialogTitle>
              <DialogDescription>
                Share your workflow template with the community
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input id="template-name" placeholder="My Awesome Workflow" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Textarea 
                  id="template-description" 
                  placeholder="Describe what your template does and how it helps users..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATEGORIES.slice(1).map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="public-template" />
                <Label htmlFor="public-template">Make template public</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Template Shared!",
                    description: "Your template has been submitted for review.",
                  });
                  setShowUploadDialog(false);
                }}>
                  Share Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_CATEGORIES.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name} ({category.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPricing} onValueChange={setSelectedPricing}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Pricing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedTemplates.length} of {templates.length} templates
        </p>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span>{templates.reduce((sum, t) => sum + t.stats.downloadCount, 0).toLocaleString()} total downloads</span>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedTemplates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                    {getPricingBadge(template.pricing)}
                  </div>
                  <CardDescription className="line-clamp-2 mb-2">
                    {template.description}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <img 
                    src={template.author.avatar} 
                    alt={template.author.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{template.author.name}</span>
                  {getAuthorBadge(template.author.badge)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{template.stats.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({template.stats.ratingCount})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="w-4 h-4 text-blue-500" />
                      <span>{template.stats.downloadCount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span>{template.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{template.stats.successRate}% success</span>
                    </div>
                  </div>
                </div>

                {/* Community Stats */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Heart className={`w-4 h-4 ${template.community.isLiked ? 'text-red-500 fill-current' : ''}`} />
                      <span>{template.community.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{template.community.comments}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleLikeTemplate(template.id)}
                      className={template.community.isLiked ? 'text-red-500' : ''}
                    >
                      <Heart className={`w-4 h-4 ${template.community.isLiked ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Dialog open={showShareDialog === template.id} onOpenChange={() => setShowShareDialog(showShareDialog === template.id ? null : template.id)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share Template</DialogTitle>
                          <DialogDescription>
                            Share "{template.name}" with your team
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Input 
                              value={`https://kairo.ai/templates/${template.id}`} 
                              readOnly 
                              className="flex-1"
                            />
                            <Button onClick={() => handleShareTemplate(template.id)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleDeployTemplate(template)}
                    className="flex-1"
                    disabled={template.pricing.type === 'premium' || template.pricing.type === 'enterprise'}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Deploy
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedTemplates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No templates found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters to find templates.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                  setSelectedPricing('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}