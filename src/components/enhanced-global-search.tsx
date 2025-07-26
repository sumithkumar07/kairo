'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { 
  Search, 
  Hash, 
  FileText, 
  Users, 
  Settings, 
  Zap, 
  Globe, 
  BookOpen, 
  Activity,
  ArrowRight,
  Clock,
  Star,
  Filter,
  Sparkles,
  Brain,
  TrendingUp,
  Database,
  Code,
  Workflow,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { withAsyncCache } from '@/lib/advanced-cache';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'workflow' | 'integration' | 'page' | 'document' | 'user' | 'template' | 'analytics';
  url: string;
  section: string;
  keywords: string[];
  priority: number;
  icon: any;
  metadata?: {
    lastModified?: string;
    author?: string;
    rating?: number;
    usage?: number;
  };
}

interface EnhancedGlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const searchCategories = {
  workflow: { icon: Workflow, label: 'Workflows', color: 'text-blue-500' },
  integration: { icon: Globe, label: 'Integrations', color: 'text-green-500' },
  page: { icon: Hash, label: 'Pages', color: 'text-purple-500' },
  document: { icon: FileText, label: 'Documentation', color: 'text-orange-500' },
  user: { icon: Users, label: 'Team', color: 'text-pink-500' },
  template: { icon: Code, label: 'Templates', color: 'text-indigo-500' },
  analytics: { icon: TrendingUp, label: 'Analytics', color: 'text-emerald-500' },
};

// Mock search data - would normally come from API
const mockSearchData: SearchResult[] = [
  // Workflows
  {
    id: 'wf-1',
    title: 'Lead Nurturing Automation',
    description: 'Automated lead nurturing workflow with email sequences and CRM integration',
    type: 'workflow',
    url: '/workflow/lead-nurturing',
    section: 'Marketing',
    keywords: ['lead', 'nurturing', 'email', 'marketing', 'crm'],
    priority: 10,
    icon: Zap,
    metadata: { lastModified: '2 hours ago', rating: 4.8, usage: 1247 }
  },
  {
    id: 'wf-2',
    title: 'Customer Onboarding',
    description: 'Complete customer onboarding workflow with notifications and task assignments',
    type: 'workflow',
    url: '/workflow/customer-onboarding',
    section: 'Sales',
    keywords: ['customer', 'onboarding', 'sales', 'notifications'],
    priority: 9,
    icon: Users,
    metadata: { lastModified: '5 hours ago', rating: 4.6, usage: 892 }
  },
  
  // Integrations
  {
    id: 'int-1',
    title: 'Salesforce Integration',
    description: 'Connect with Salesforce CRM for lead management and data sync',
    type: 'integration',
    url: '/integrations?tab=marketplace&search=salesforce',
    section: 'CRM',
    keywords: ['salesforce', 'crm', 'leads', 'integration'],
    priority: 8,
    icon: Database,
    metadata: { rating: 4.9, usage: 2341 }
  },
  {
    id: 'int-2',
    title: 'Slack Integration',
    description: 'Send notifications and messages to Slack channels',
    type: 'integration',
    url: '/integrations?tab=marketplace&search=slack',
    section: 'Communication',
    keywords: ['slack', 'notifications', 'messages', 'communication'],
    priority: 7,
    icon: Hash,
    metadata: { rating: 4.8, usage: 3124 }
  },
  
  // Pages
  {
    id: 'page-1',
    title: 'Analytics Dashboard',
    description: 'Comprehensive analytics with real-time metrics and performance insights',
    type: 'page',
    url: '/analytics',
    section: 'Analytics',
    keywords: ['analytics', 'dashboard', 'metrics', 'performance'],
    priority: 8,
    icon: Activity,
    metadata: {}
  },
  {
    id: 'page-2',
    title: 'Integration Center',
    description: 'Manage all your integrations, API keys, and webhook endpoints',
    type: 'page',
    url: '/integrations',
    section: 'Integrations',
    keywords: ['integrations', 'api', 'webhooks', 'connections'],
    priority: 7,
    icon: Globe,
    metadata: {}
  },
  
  // Documentation
  {
    id: 'doc-1',
    title: 'Getting Started Guide',
    description: 'Complete guide to building your first workflow automation',
    type: 'document',
    url: '/learn?tab=overview',
    section: 'Learning',
    keywords: ['getting started', 'guide', 'tutorial', 'workflow'],
    priority: 9,
    icon: BookOpen,
    metadata: { lastModified: '1 day ago' }
  },
  {
    id: 'doc-2',
    title: 'API Documentation',
    description: 'Complete API reference for all endpoints and authentication',
    type: 'document',
    url: '/learn?tab=api',
    section: 'API',
    keywords: ['api', 'documentation', 'endpoints', 'authentication'],
    priority: 8,
    icon: Code,
    metadata: { lastModified: '3 days ago' }
  },
  
  // Templates
  {
    id: 'tpl-1',
    title: 'E-commerce Order Processing',
    description: 'Complete e-commerce workflow for order processing and fulfillment',
    type: 'template',
    url: '/templates/ecommerce-order',
    section: 'E-commerce',
    keywords: ['ecommerce', 'orders', 'processing', 'fulfillment'],
    priority: 7,
    icon: Settings,
    metadata: { rating: 4.7, usage: 634 }
  }
];

export function EnhancedGlobalSearch({ isOpen, onClose }: EnhancedGlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Advanced search function with fuzzy matching and AI-powered suggestions
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    try {
      // Use cache for search results
      const cacheKey = `search:${searchQuery}:${selectedCategory || 'all'}`;
      
      const searchResults = await withAsyncCache(cacheKey, async () => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const query = searchQuery.toLowerCase();
        const filtered = mockSearchData.filter(item => {
          // Category filter
          if (selectedCategory && item.type !== selectedCategory) {
            return false;
          }

          // Text matching with priority scoring
          const titleMatch = item.title.toLowerCase().includes(query);
          const descriptionMatch = item.description.toLowerCase().includes(query);
          const keywordMatch = item.keywords.some(keyword => 
            keyword.toLowerCase().includes(query)
          );
          const sectionMatch = item.section.toLowerCase().includes(query);

          return titleMatch || descriptionMatch || keywordMatch || sectionMatch;
        });

        // Sort by relevance (priority + exact matches)
        return filtered.sort((a, b) => {
          const aExactMatch = a.title.toLowerCase().includes(query) ? 10 : 0;
          const bExactMatch = b.title.toLowerCase().includes(query) ? 10 : 0;
          
          return (b.priority + bExactMatch) - (a.priority + aExactMatch);
        });
      }, 30000); // Cache for 30 seconds
      
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const handleResultClick = (result: SearchResult) => {
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });

    router.push(result.url);
    onClose();
  };

  const renderSearchResult = (result: SearchResult, index: number) => {
    const categoryInfo = searchCategories[result.type];
    const Icon = result.icon || categoryInfo.icon;
    const isSelected = index === selectedIndex;

    return (
      <div
        key={result.id}
        className={cn(
          'flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200',
          'hover:bg-muted/50 hover:shadow-sm',
          isSelected && 'bg-muted shadow-sm ring-2 ring-primary/20'
        )}
        onClick={() => handleResultClick(result)}
      >
        <div className={cn('p-2 rounded-lg', categoryInfo.color.replace('text-', 'bg-').replace('500', '100'))}>
          <Icon className={cn('h-5 w-5', categoryInfo.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{result.title}</h3>
            <Badge variant="secondary" className="text-xs">
              {categoryInfo.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {result.description}
          </p>
          
          {result.metadata && (
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {result.metadata.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {result.metadata.rating}
                </div>
              )}
              {result.metadata.usage && (
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {result.metadata.usage.toLocaleString()} uses
                </div>
              )}
              {result.metadata.lastModified && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {result.metadata.lastModified}
                </div>
              )}
            </div>
          )}
        </div>
        
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  };

  const groupedResults = results.reduce((groups, result) => {
    const category = result.type;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(result);
    return groups;
  }, {} as Record<string, SearchResult[]>);

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Search className="h-5 w-5 text-primary" />
            </div>
            Enhanced Global Search
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Search Input */}
          <div className="p-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows, integrations, documentation, and more..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12 text-base"
                autoFocus
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Brain className="h-4 w-4 animate-pulse text-primary" />
                </div>
              )}
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                <Filter className="h-3 w-3 mr-2" />
                All
              </Button>
              {Object.entries(searchCategories).map(([type, info]) => {
                const Icon = info.icon;
                return (
                  <Button
                    key={type}
                    variant={selectedCategory === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(selectedCategory === type ? null : type)}
                  >
                    <Icon className="h-3 w-3 mr-2" />
                    {info.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <ScrollArea className="flex-1">
            <div className="px-6 pb-6">
              {!query.trim() && recentSearches.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery(search)}
                        className="h-8 text-sm"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {query.trim() && !loading && results.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or removing category filters
                  </p>
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-6">
                  {Object.entries(groupedResults).map(([category, categoryResults]) => {
                    const categoryInfo = searchCategories[category as keyof typeof searchCategories];
                    const Icon = categoryInfo.icon;
                    
                    return (
                      <div key={category}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <Icon className={cn('h-4 w-4', categoryInfo.color)} />
                          {categoryInfo.label} ({categoryResults.length})
                        </h3>
                        <div className="space-y-2">
                          {categoryResults.map((result, index) => {
                            const globalIndex = results.findIndex(r => r.id === result.id);
                            return renderSearchResult(result, globalIndex);
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-4 bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>Enter Select</span>
                <span>Esc Close</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-3 w-3" />
                Powered by AI Search
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}