'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu,
  Search,
  Bell,
  User,
  Settings,
  ChevronDown,
  Home,
  Workflow,
  Brain,
  Globe,
  BarChart3,
  FileText,
  Users,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Filter,
  MoreVertical,
  Grid,
  List,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

// Hook to detect mobile/tablet
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
};

// Navigation items
const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard', badge: null },
  { id: 'workflows', label: 'Workflows', icon: Workflow, href: '/workflows', badge: '12' },
  { id: 'editor', label: 'Editor', icon: Brain, href: '/editor', badge: null },
  { id: 'integrations', label: 'Integrations', icon: Globe, href: '/integrations', badge: '45+' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics', badge: null },
  { id: 'templates', label: 'Templates', icon: FileText, href: '/templates', badge: 'New' },
  { id: 'team', label: 'Team', icon: Users, href: '/team', badge: null },
  { id: 'help', label: 'Help', icon: HelpCircle, href: '/help', badge: null },
];

// Mobile navigation component
const MobileNavigation = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-[280px]">
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="font-bold text-lg">Kairo</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Mobile navigation */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12"
                  onClick={onClose}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Mobile quick actions */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Plus className="h-4 w-4" />
                  Create Workflow
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Globe className="h-4 w-4" />
                  Connect Service
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Desktop sidebar component
const DesktopSidebar = ({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) => {
  return (
    <div className={cn(
      "hidden lg:flex flex-col h-screen bg-muted/30 border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Desktop header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-lg">Kairo</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={onToggle}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Desktop navigation */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full gap-3 transition-all duration-200",
                collapsed ? "h-12 px-3 justify-center" : "h-12 justify-start"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Desktop user section */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full gap-3 transition-all duration-200",
            collapsed ? "h-12 px-3 justify-center" : "h-12 justify-start"
          )}
        >
          <User className="h-5 w-5 flex-shrink-0" />
          {!collapsed && (
            <>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Sarah Johnson</div>
                <div className="text-xs text-muted-foreground">Admin</div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Responsive top bar
const ResponsiveTopBar = ({ onMobileMenuToggle, sidebarCollapsed }: { 
  onMobileMenuToggle: () => void; 
  sidebarCollapsed: boolean;
}) => {
  const isMobile = useMediaQuery('(max-width: 1024px)');

  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb/Title */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </div>
        </div>

        {/* Search bar - hidden on mobile */}
        <div className="hidden md:flex relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search workflows, integrations..."
            className="w-full h-10 pl-10 pr-4 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Top bar actions */}
        <div className="flex items-center gap-2">
          {/* Search button for mobile */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>

          {/* User menu - hidden on mobile when sidebar is available */}
          <Button variant="ghost" size="sm" className="lg:hidden">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Responsive grid for cards
const ResponsiveGrid = ({ children, className = "" }: { 
  children: React.ReactNode; 
  className?: string;
}) => {
  return (
    <div className={cn(
      "grid gap-4",
      "grid-cols-1",
      "sm:grid-cols-2", 
      "lg:grid-cols-3",
      "xl:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
};

// Responsive card component
const ResponsiveCard = ({ 
  children, 
  className = "", 
  fullWidth = false 
}: { 
  children: React.ReactNode; 
  className?: string; 
  fullWidth?: boolean;
}) => {
  return (
    <Card className={cn(
      "transition-all duration-200",
      "hover:shadow-md",
      fullWidth && "col-span-full",
      className
    )}>
      {children}
    </Card>
  );
};

// Main responsive layout component
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1024px)');

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <ResponsiveTopBar 
          onMobileMenuToggle={() => setMobileMenuOpen(true)} 
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 xl:p-8 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Export responsive utilities
export { ResponsiveGrid, ResponsiveCard, useMediaQuery };