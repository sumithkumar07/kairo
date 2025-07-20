'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Download, 
  Star, 
  Clock, 
  Users, 
  Zap, 
  TrendingUp, 
  Filter,
  Grid,
  List,
  Play,
  Heart,
  Eye,
  ArrowRight
} from 'lucide-react';
import { WORKFLOW_TEMPLATES, TEMPLATE_CATEGORIES, POPULAR_TEMPLATES, FEATURED_TEMPLATES, WorkflowTemplate } from '@/data/workflow-templates';
import { cn } from '@/lib/utils';

interface TemplateMarketplaceProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
  onPreviewTemplate: (template: WorkflowTemplate) => void;
}

export function TemplateMarketplace({ onSelectTemplate, onPreviewTemplate }: TemplateMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');

  const filteredTemplates = useMemo(() => {
    let filtered = WORKFLOW_TEMPLATES;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by difficulty
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(template => template.difficulty === difficultyFilter);
    }

    // Sort templates
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, difficultyFilter, sortBy]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const TemplateCard = ({ template }: { template: WorkflowTemplate }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold line-clamp-1">{template.name}</CardTitle>
              {template.isPremium && (
                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  Pro
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2 text-sm">{template.description}</CardDescription>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="outline" className={cn("text-xs", getDifficultyColor(template.difficulty))}>
            {template.difficulty}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {template.estimatedTime}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {template.rating}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {template.integrations.slice(0, 3).map((integration) => (
              <Badge key={integration} variant="secondary" className="text-xs">
                {integration}
              </Badge>
            ))}
            {template.integrations.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.integrations.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {template.downloadCount.toLocaleString()}
              </div>
              <div>by {template.author}</div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onSelectTemplate(template)}
            >
              <Download className="h-4 w-4 mr-2" />
              Use Template
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onPreviewTemplate(template)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Workflow Templates</h1>
        <p className="text-muted-foreground text-lg">
          Jumpstart your automation with pre-built, production-ready workflows
        </p>
      </div>

      {/* Featured Templates */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Featured Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
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
          
          <div className="w-px h-6 bg-border" />
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border rounded text-sm bg-background"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {TEMPLATE_CATEGORIES.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              {category.name}
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-medium">Difficulty:</span>
            <Button
              variant={difficultyFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficultyFilter('all')}
            >
              All
            </Button>
            <Button
              variant={difficultyFilter === 'beginner' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficultyFilter('beginner')}
            >
              Beginner
            </Button>
            <Button
              variant={difficultyFilter === 'intermediate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficultyFilter('intermediate')}
            >
              Intermediate
            </Button>
            <Button
              variant={difficultyFilter === 'advanced' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficultyFilter('advanced')}
            >
              Advanced
            </Button>
          </div>

          {/* Templates Grid/List */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                No templates found matching your criteria
              </div>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setDifficultyFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-4'
            )}>
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <div className="text-center py-8 border-t">
        <h3 className="text-lg font-semibold mb-2">Don't see what you need?</h3>
        <p className="text-muted-foreground mb-4">
          Request a custom template or build your own from scratch
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline">
            Request Template
          </Button>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            Start Building
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}