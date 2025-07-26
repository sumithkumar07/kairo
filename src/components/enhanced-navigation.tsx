'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  ChevronRight,
  Home,
  Workflow,
  Bot,
  Settings,
  HelpCircle,
  FileText,
  BarChart3,
  Users,
  Zap,
  Command as CommandIcon,
  Keyboard,
  BookOpen,
  Star,
  Clock,
  TrendingUp,
  Shield,
  CreditCard,
  User,
  Link as LinkIcon,
  Activity,
  Crown,
  Database,
  Code,
  MessageSquare,
  Target,
  Gauge,
  Brain,
  Sparkles,
  Calendar,
  ArrowRight,
  Plus,
  Filter,
  SortAsc
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced Navigation Components
interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  category: 'workflows' | 'integrations' | 'reports' | 'docs' | 'settings';
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

interface KeyboardShortcut {
  id: string;
  key: string;
  description: string;
  category: 'navigation' | 'workflow' | 'general';
  action: () => void;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Create New Workflow',
    description: 'Build a new automation workflow from scratch',
    href: '/workflow',
    category: 'workflows',
    icon: Workflow,
    keywords: ['workflow', 'automation', 'create', 'new', 'build']
  },
  {
    id: '2',
    title: 'AI Studio',
    description: 'Access advanced AI features and model management',
    href: '/ai-studio',
    category: 'workflows',
    icon: Bot,
    keywords: ['ai', 'studio', 'models', 'training', 'analysis']
  },
  {
    id: '3',
    title: 'Integration Marketplace',
    description: 'Browse and connect third-party services',
    href: '/integrations',
    category: 'integrations',
    icon: LinkIcon,
    keywords: ['integrations', 'marketplace', 'connect', 'services', 'apis']
  },
  {
    id: '4',
    title: 'Analytics Dashboard',
    description: 'View performance metrics and insights',
    href: '/reports',
    category: 'reports',
    icon: BarChart3,
    keywords: ['analytics', 'dashboard', 'metrics', 'performance', 'insights']
  },
  {
    id: '5',
    title: 'User Management',
    description: 'Manage users and permissions',
    href: '/account',
    category: 'settings',
    icon: Users,
    keywords: ['users', 'management', 'permissions', 'accounts', 'roles']
  },
  {
    id: '6',
    title: 'API Documentation',
    description: 'Learn about our REST API and webhooks',
    href: '/docs?tab=api',
    category: 'docs',
    icon: FileText,
    keywords: ['api', 'documentation', 'rest', 'webhooks', 'developers']
  }
];

// Breadcrumb Navigation Component
export function BreadcrumbNavigation({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Link href="/dashboard" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          <ChevronRight className="h-4 w-4" />
          <Link 
            href={item.href} 
            className={cn(
              "flex items-center gap-1 hover:text-foreground transition-colors",
              index === items.length - 1 && "text-foreground font-medium"
            )}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}

// Global Search Component
export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const filteredResults = mockSearchResults.filter(result =>
      result.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setResults(filteredResults);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    handleSearch(query);
  }, [query, handleSearch]);

  const handleResultSelect = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  const getCategoryIcon = (category: SearchResult['category']) => {
    switch (category) {
      case 'workflows': return Workflow;
      case 'integrations': return LinkIcon;
      case 'reports': return BarChart3;
      case 'docs': return FileText;
      case 'settings': return Settings;
      default: return Search;
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        className="w-64 justify-start text-muted-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        Search everything...
        <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
          Ctrl K
        </kbd>
      </Button>

      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Global Search</DialogTitle>
        </DialogHeader>
        
        <Command>
          <CommandInput 
            placeholder="Search workflows, integrations, reports..." 
            value={query}
            onValueChange={setQuery}
            className="border-none focus:ring-0"
          />
          <CommandList>
            {query && !isLoading && results.length === 0 && (
              <CommandEmpty>No results found for "{query}"</CommandEmpty>
            )}
            
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <Search className="h-6 w-6 mx-auto mb-2 animate-pulse" />
                Searching...
              </div>
            )}
            
            {Object.entries(groupedResults).map(([category, categoryResults]) => {
              const CategoryIcon = getCategoryIcon(category as SearchResult['category']);
              return (
                <CommandGroup 
                  key={category} 
                  heading={
                    <div className="flex items-center gap-2 capitalize">
                      <CategoryIcon className="h-4 w-4" />
                      {category}
                    </div>
                  }
                >
                  {categoryResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleResultSelect(result.href)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <result.icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{result.title}</p>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// Keyboard Shortcuts Component
export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    {
      id: 'search',
      key: 'Ctrl+K',
      description: 'Open global search',
      category: 'general',
      action: () => {} // Handled by global search component
    },
    {
      id: 'dashboard',
      key: 'G then D',
      description: 'Go to Dashboard',
      category: 'navigation',
      action: () => router.push('/dashboard')
    },
    {
      id: 'workflow',
      key: 'G then W',
      description: 'Go to Workflow Editor',
      category: 'navigation',
      action: () => router.push('/workflow')
    },
    {
      id: 'ai-studio',
      key: 'G then A',
      description: 'Go to AI Studio',
      category: 'navigation',
      action: () => router.push('/ai-studio')
    },
    {
      id: 'integrations',
      key: 'G then I',
      description: 'Go to Integrations',
      category: 'navigation',
      action: () => router.push('/integrations')
    },
    {
      id: 'reports',
      key: 'G then R',
      description: 'Go to Reports',
      category: 'navigation',
      action: () => router.push('/reports')
    },
    {
      id: 'new-workflow',
      key: 'N',
      description: 'Create new workflow',
      category: 'workflow',
      action: () => router.push('/workflow')
    },
    {
      id: 'run-workflow',
      key: 'Ctrl+Enter',
      description: 'Run current workflow',
      category: 'workflow',
      action: () => {} // Would be handled by workflow editor
    },
    {
      id: 'save-workflow',
      key: 'Ctrl+S',
      description: 'Save current workflow',
      category: 'workflow',
      action: () => {} // Would be handled by workflow editor
    },
    {
      id: 'help',
      key: '?',
      description: 'Show keyboard shortcuts',
      category: 'general',
      action: () => setIsOpen(true)
    }
  ];

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K for search is handled by the search component
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Handle G+letter combinations
      if (e.key === 'g' || e.key === 'G') {
        const handleSecondKey = (secondEvent: KeyboardEvent) => {
          switch (secondEvent.key.toLowerCase()) {
            case 'd':
              router.push('/dashboard');
              break;
            case 'w':
              router.push('/workflow');
              break;
            case 'a':
              router.push('/ai-studio');
              break;
            case 'i':
              router.push('/integrations');
              break;
            case 'r':
              router.push('/reports');
              break;
          }
          document.removeEventListener('keydown', handleSecondKey);
        };
        
        document.addEventListener('keydown', handleSecondKey);
        setTimeout(() => {
          document.removeEventListener('keydown', handleSecondKey);
        }, 2000);
      }
      
      // Handle single key shortcuts
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          router.push('/workflow');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Keyboard className="h-4 w-4" />
        Shortcuts
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-96">
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h3 className="font-medium capitalize text-sm text-muted-foreground mb-3">
                    {category} Shortcuts
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut) => (
                      <div key={shortcut.id} className="flex items-center justify-between py-2">
                        <span className="text-sm">{shortcut.description}</span>
                        <kbd className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                  {category !== 'general' && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Contextual Help Component
export function ContextualHelp() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  const getHelpContent = (path: string) => {
    switch (path) {
      case '/dashboard':
        return {
          title: 'Dashboard Help',
          sections: [
            {
              title: 'Quick Actions',
              content: 'Use the quick action cards to jump into common tasks like creating workflows or viewing analytics.'
            },
            {
              title: 'Recent Activity',
              content: 'Monitor your latest workflow executions and system events in the activity feed.'
            },
            {
              title: 'Performance Metrics',
              content: 'Track your automation success rate, execution times, and resource usage.'
            }
          ]
        };
      case '/workflow':
        return {
          title: 'Workflow Editor Help',
          sections: [
            {
              title: 'Building Workflows',
              content: 'Drag nodes from the library and connect them to create automation flows.'
            },
            {
              title: 'AI Generation',
              content: 'Use natural language to describe your automation and let AI build it for you.'
            },
            {
              title: 'Testing & Debugging',
              content: 'Run workflows in simulation mode to test before deploying to production.'
            }
          ]
        };
      case '/ai-studio':
        return {
          title: 'AI Studio Help',
          sections: [
            {
              title: 'AI Terminal',
              content: 'Chat with your AI assistant to generate workflows, analyze data, and get insights.'
            },
            {
              title: 'Model Performance',
              content: 'Monitor accuracy, latency, and usage of your AI models.'
            },
            {
              title: 'Training Interface',
              content: 'Configure and monitor training sessions for custom AI models.'
            }
          ]
        };
      default:
        return {
          title: 'General Help',
          sections: [
            {
              title: 'Getting Started',
              content: 'Welcome to Kairo! Use the navigation menu to explore different sections.'
            },
            {
              title: 'Need More Help?',
              content: 'Visit our documentation or contact support for detailed guidance.'
            }
          ]
        };
    }
  };

  const helpContent = getHelpContent(pathname);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <HelpCircle className="h-4 w-4" />
        Help
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              <h2 className="text-lg font-semibold">{helpContent.title}</h2>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {helpContent.sections.map((section, index) => (
              <div key={index}>
                <h3 className="font-medium text-sm mb-2">{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.content}</p>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/docs">
                  <FileText className="h-4 w-4 mr-2" />
                  Full Documentation
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/help">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}