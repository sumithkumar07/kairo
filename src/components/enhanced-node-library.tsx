'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  Layers,
  Plus,
  Heart,
  Download,
  Share2,
  Eye,
  ThumbsUp,
  Bookmark,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Settings,
  X
} from 'lucide-react';
import type { AvailableNodeType } from '@/types/workflow';
import { getCanvasNodeStyling, AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { getAdvancedNodes } from '@/config/advanced-nodes';
import { ALL_INTEGRATIONS } from '@/config/integrations';

interface EnhancedNodeLibraryProps {
  availableNodes: AvailableNodeType[];
  onNodeSelect?: (node: AvailableNodeType) => void;
  className?: string;
}

interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  nodes: AvailableNodeType[];
  category: string;
  rating: number;
  downloads: number;
  author: string;
  featured: boolean;
  preview?: string;
}

interface NodeStats {
  totalNodes: number;
  categories: string[];
  recentlyAdded: AvailableNodeType[];
  popular: AvailableNodeType[];
  featured: AvailableNodeType[];
}

export function EnhancedNodeLibrary({ 
  availableNodes, 
  onNodeSelect, 
  className 
}: EnhancedNodeLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'popular' | 'recent'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoriteNodes, setFavoriteNodes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { hasProFeatures, isLoggedIn } = useSubscription();

  // Combine all available nodes
  const allNodes = useMemo(() => {
    const baseNodes = AVAILABLE_NODES_CONFIG;
    const advancedNodes = getAdvancedNodes();
    const integrationNodes = ALL_INTEGRATIONS;
    
    return [...baseNodes, ...advancedNodes, ...integrationNodes];
  }, []);

  // Mock templates data
  const nodeTemplates: NodeTemplate[] = [
    {
      id: 'template1',
      name: 'Customer Onboarding Flow',
      description: 'Complete customer onboarding with email verification and CRM integration',
      nodes: allNodes.slice(0, 5),
      category: 'business',
      rating: 4.8,
      downloads: 1204,
      author: 'Kairo Team',
      featured: true,
      preview: 'https://via.placeholder.com/300x200'
    },
    {
      id: 'template2',
      name: 'Data Processing Pipeline',
      description: 'ETL pipeline for data transformation and loading',
      nodes: allNodes.slice(5, 10),
      category: 'data',
      rating: 4.6,
      downloads: 892,
      author: 'Community',
      featured: false
    },
    {
      id: 'template3',
      name: 'Social Media Automation',
      description: 'Automated social media posting and engagement tracking',
      nodes: allNodes.slice(10, 15),
      category: 'marketing',
      rating: 4.9,
      downloads: 1567,
      author: 'Marketing Pro',
      featured: true
    }
  ];

  // Calculate node stats
  const nodeStats = useMemo((): NodeStats => {
    const categories = Array.from(new Set(allNodes.map(node => node.category)));
    const recentlyAdded = allNodes.slice(0, 8); // Mock recent
    const popular = allNodes.slice(8, 16); // Mock popular
    const featured = allNodes.filter(node => node.isAdvanced).slice(0, 6);
    
    return {
      totalNodes: allNodes.length,
      categories,
      recentlyAdded,
      popular,
      featured
    };
  }, [allNodes]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [inputValue]);

  // Filter and sort nodes
  const filteredAndSortedNodes = useMemo(() => {
    let filtered = allNodes;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(node =>
        node.name.toLowerCase().includes(lowerSearchTerm) ||
        (node.description && node.description.toLowerCase().includes(lowerSearchTerm)) ||
        node.type.toLowerCase().includes(lowerSearchTerm) ||
        node.category.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(node => node.category === selectedCategory);
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(node => {
        // This would work with actual tag data
        return selectedTags.some(tag => node.category.includes(tag));
      });
    }

    // Sort nodes
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'popular':
          // Mock popularity score
          comparison = (a.isAdvanced ? 1 : 0) - (b.isAdvanced ? 1 : 0);
          break;
        case 'recent':
          // Mock recent score
          comparison = allNodes.indexOf(a) - allNodes.indexOf(b);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [allNodes, searchTerm, selectedCategory, selectedTags, sortBy, sortOrder]);

  // Get available tags
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    allNodes.forEach(node => {
      tags.add(node.category);
      if (node.isAdvanced) tags.add('advanced');
    });
    return Array.from(tags);
  }, [allNodes]);

  // Handle node drag start
  const handleDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, nodeType: AvailableNodeType) => {
    if (nodeType.isAdvanced && !hasProFeatures) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData('application/json', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  }, [hasProFeatures]);

  // Handle node favorite toggle
  const handleFavoriteToggle = useCallback((nodeType: string) => {
    setFavoriteNodes(prev => 
      prev.includes(nodeType) 
        ? prev.filter(id => id !== nodeType)
        : [...prev, nodeType]
    );
  }, []);

  // Handle tag selection
  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  // Node card component
  const NodeCard = ({ node, compact = false }: { node: AvailableNodeType; compact?: boolean }) => {
    const itemStyling = getCanvasNodeStyling(node.category);
    const isLocked = node.isAdvanced && !hasProFeatures;
    const isFavorite = favoriteNodes.includes(node.type);
    
    return (
      <TooltipProvider key={node.type} delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={cn(
                "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
                compact ? "h-20" : "h-auto",
                isLocked && "opacity-60 cursor-not-allowed"
              )}
              draggable={!isLocked}
              onDragStart={(e) => handleDragStart(e, node)}
              onClick={() => !isLocked && onNodeSelect?.(node)}
            >
              <CardContent className={cn("p-4", compact && "p-3")}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg flex-shrink-0",
                    itemStyling.headerBg
                  )}>
                    <node.icon className={cn(
                      compact ? "h-4 w-4" : "h-5 w-5",
                      isLocked ? 'text-muted-foreground' : itemStyling.headerIconColor
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn(
                        "font-medium truncate",
                        compact ? "text-sm" : "text-base",
                        isLocked ? 'text-muted-foreground' : 'text-foreground'
                      )}>
                        {node.name}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {node.isAdvanced && (
                          <Badge variant="secondary" className="text-xs">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Pro
                          </Badge>
                        )}
                        {isFavorite && (
                          <Heart className="h-3 w-3 text-red-500 fill-current" />
                        )}
                      </div>
                    </div>
                    
                    {!compact && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {node.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {node.category}
                      </Badge>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteToggle(node.type);
                          }}
                        >
                          <Heart className={cn(
                            "h-3 w-3",
                            isFavorite ? "text-red-500 fill-current" : "text-muted-foreground"
                          )} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle node sharing
                          }}
                        >
                          <Share2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <node.icon className="h-4 w-4" />
                <span className="font-medium">{node.name}</span>
                {node.isAdvanced && (
                  <Badge variant="secondary" className="text-xs">Pro</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {node.description}
              </p>
              {isLocked && (
                <p className="text-xs text-amber-500">
                  Premium feature - {isLoggedIn ? 'Upgrade your plan' : 'Sign up for trial'}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className={cn("w-80 border-r bg-card h-full flex flex-col", className)}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Node Library</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search nodes..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredAndSortedNodes.length} nodes</span>
          <span>{nodeStats.categories.length} categories</span>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b bg-muted/20">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md"
              >
                <option value="all">All Categories</option>
                {nodeStats.categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-1">
                {availableTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagSelect(tag)}
                    className="h-6 text-xs"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort by</label>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-3 py-2 text-sm border rounded-md"
                >
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                  <option value="popular">Popular</option>
                  <option value="recent">Recent</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-2"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="nodes" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="nodes">Nodes</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="flex-1 mt-4">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-3 pb-4">
              {filteredAndSortedNodes.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No nodes found matching your criteria
                  </p>
                </div>
              ) : (
                filteredAndSortedNodes.map((node) => (
                  <NodeCard key={node.type} node={node} compact={viewMode === 'list'} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="templates" className="flex-1 mt-4">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 pb-4">
              {nodeTemplates.map((template) => (
                <Card key={template.id} className="group cursor-pointer hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Layers className="h-8 w-8 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{template.name}</h3>
                          {template.featured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {template.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {template.rating}
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {template.downloads}
                            </div>
                          </div>
                          
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="favorites" className="flex-1 mt-4">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-3 pb-4">
              {favoriteNodes.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No favorite nodes yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click the heart icon on any node to add it to favorites
                  </p>
                </div>
              ) : (
                favoriteNodes.map((nodeType) => {
                  const node = allNodes.find(n => n.type === nodeType);
                  return node ? (
                    <NodeCard key={node.type} node={node} compact={viewMode === 'list'} />
                  ) : null;
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}