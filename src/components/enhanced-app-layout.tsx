'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Home,
  Workflow,
  BarChart3,
  Globe,
  Users,
  BookOpen,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Bell,
  HelpCircle,
  Sparkles,
  Zap,
  Target,
  BrainCircuit,
  Code,
  Database,
  Cloud,
  Monitor,
  FileText,
  MessageSquare,
  Calendar,
  CreditCard,
  Shield,
  Activity,
  Menu,
  LogOut,
  User,
  Mail,
  Phone,
  Building,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  description?: string;
  isNew?: boolean;
  isPro?: boolean;
  children?: NavItem[];
}

interface BreadcrumbItem {
  title: string;
  href?: string;
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and insights'
  },
  {
    title: 'Workflows',
    href: '/workflow',
    icon: Workflow,
    badge: '12',
    description: 'Automation workflows',
    children: [
      { title: 'Active Workflows', href: '/workflow/active', icon: Activity },
      { title: 'Templates', href: '/workflow/templates', icon: FileText },
      { title: 'AI Studio', href: '/workflow/ai-studio', icon: BrainCircuit, isNew: true }
    ]
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Performance metrics',
    children: [
      { title: 'Overview', href: '/analytics?tab=overview', icon: Monitor },
      { title: 'Real-time', href: '/analytics?tab=real-time', icon: Activity },
      { title: 'Reports', href: '/analytics?tab=reports', icon: FileText }
    ]
  },
  {
    title: 'Integrations',
    href: '/integrations',
    icon: Globe,
    badge: '45+',
    description: 'Connected services',
    children: [
      { title: 'Marketplace', href: '/integrations?tab=marketplace', icon: Globe },
      { title: 'My Integrations', href: '/integrations?tab=my-integrations', icon: Zap },
      { title: 'Health Monitor', href: '/integrations?tab=health', icon: Monitor, isPro: true }
    ]
  },
  {
    title: 'Team',
    href: '/account?tab=team',
    icon: Users,
    description: 'Collaboration tools'
  },
  {
    title: 'Learning',
    href: '/learn',
    icon: BookOpen,
    description: 'Tutorials and docs',
    children: [
      { title: 'Getting Started', href: '/learn?tab=getting-started', icon: Target },
      { title: 'Tutorials', href: '/learn?tab=tutorials', icon: BookOpen },
      { title: 'API Reference', href: '/learn?tab=api', icon: Code }
    ]
  }
];

const quickActions = [
  { title: 'Create Workflow', href: '/workflow/new', icon: Plus },
  { title: 'AI Assistant', href: '/ai-studio', icon: Sparkles },
  { title: 'Templates', href: '/templates', icon: FileText }
];

// Enhanced Breadcrumbs Component
export function EnhancedBreadcrumbs() {
  const pathname = usePathname();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Home', href: '/dashboard' }];
    
    if (pathname.includes('/workflow')) {
      breadcrumbs.push({ title: 'Workflows', href: '/workflow' });
      if (pathname.includes('/new')) breadcrumbs.push({ title: 'New Workflow' });
      if (pathname.includes('/templates')) breadcrumbs.push({ title: 'Templates' });
    } else if (pathname.includes('/analytics')) {
      breadcrumbs.push({ title: 'Analytics', href: '/analytics' });
    } else if (pathname.includes('/integrations')) {
      breadcrumbs.push({ title: 'Integrations', href: '/integrations' });
    } else if (pathname.includes('/learn')) {
      breadcrumbs.push({ title: 'Learning', href: '/learn' });
    } else if (pathname.includes('/account')) {
      breadcrumbs.push({ title: 'Account', href: '/account' });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.title}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {breadcrumb.href && index < breadcrumbs.length - 1 ? (
            <Link 
              href={breadcrumb.href}
              className="hover:text-foreground transition-colors"
            >
              {breadcrumb.title}
            </Link>
          ) : (
            <span className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
              {breadcrumb.title}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Enhanced App Layout
export function EnhancedAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>(['Workflows']);

  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems(prev => 
      prev.includes(itemTitle) 
        ? prev.filter(item => item !== itemTitle)
        : [...prev, itemTitle]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const NavItemComponent = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);

    if (hasChildren) {
      return (
        <Collapsible
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.title)}
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className={cn(
                "w-full justify-start gap-3 h-11 group transition-all duration-200",
                depth > 0 && "ml-4 w-[calc(100%-1rem)]",
                active && "bg-primary/10 text-primary font-medium border-r-2 border-primary",
                "hover:bg-primary/5 hover:text-primary"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-colors",
                active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )} />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.isNew && (
                      <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500">
                        New
                      </Badge>
                    )}
                    {item.isPro && (
                      <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500">
                        Pro
                      </Badge>
                    )}
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isExpanded && "transform rotate-180"
                    )} />
                  </div>
                </>
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => (
              <NavItemComponent key={child.href} item={child} depth={depth + 1} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    const navButton = (
      <SidebarMenuButton
        className={cn(
          "w-full justify-start gap-3 h-11 group transition-all duration-200",
          depth > 0 && "ml-4 w-[calc(100%-1rem)]",
          active && "bg-primary/10 text-primary font-medium border-r-2 border-primary",
          "hover:bg-primary/5 hover:text-primary"
        )}
        asChild
      >
        <Link href={item.href}>
          <item.icon className={cn(
            "h-5 w-5 transition-colors",
            active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
          )} />
          {!sidebarCollapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
                {item.isNew && (
                  <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500">
                    New
                  </Badge>
                )}
                {item.isPro && (
                  <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500">
                    Pro
                  </Badge>
                )}
              </div>
            </>
          )}
        </Link>
      </SidebarMenuButton>
    );

    if (sidebarCollapsed && item.description) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {navButton}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              <p>{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return navButton;
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r" collapsible="icon">
        {/* Enhanced Header */}
        <SidebarHeader className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  KAIRO
                </h2>
                <p className="text-xs text-muted-foreground">AI Automation</p>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Search */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workflows, integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/50 border-none focus:bg-background"
                />
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {quickActions.map((action) => (
                    <TooltipProvider key={action.href}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-12 w-full flex-col gap-1 hover:bg-primary/5 hover:border-primary/20"
                            asChild
                          >
                            <Link href={action.href}>
                              <action.icon className="h-4 w-4" />
                              <span className="text-xs">{action.title}</span>
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{action.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <ScrollArea className="flex-1 px-4">
            <SidebarMenu className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <NavItemComponent item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>

        {/* Enhanced Footer */}
        <SidebarFooter className="p-4 border-t space-y-3">
          {/* System Status */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {!sidebarCollapsed && <span className="text-muted-foreground">All systems operational</span>}
          </div>

          {/* User Profile */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{user.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account?tab=billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account?tab=security">
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/help">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Enhanced Top Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 p-0"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
              
              {/* Breadcrumbs */}
              <EnhancedBreadcrumbs />
            </div>

            <div className="flex items-center gap-4">
              {/* Global Search */}
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search anything..."
                  className="pl-9 bg-muted/50 border-none focus:bg-background"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>

              {/* User Menu */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account?tab=team">
                        <Users className="mr-2 h-4 w-4" />
                        Team
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}