'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Search,
  Filter,
  Grid,
  List,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function MobileOptimizedLayout({ 
  children, 
  sidebar, 
  header, 
  footer, 
  className 
}: MobileLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        {/* Mobile Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between p-4">
            {sidebar && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <ScrollArea className="h-full">
                    {sidebar}
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            )}
            
            <div className="flex-1 px-4">
              {header}
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="p-4">
          {children}
        </div>

        {/* Mobile Footer */}
        {footer && (
          <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4">
            {footer}
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className={cn("min-h-screen bg-background flex", className)}>
      {sidebar && (
        <div className="w-64 border-r bg-muted/10">
          <ScrollArea className="h-full">
            {sidebar}
          </ScrollArea>
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        {header && (
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {header}
          </div>
        )}
        
        <div className="flex-1 overflow-auto">
          {children}
        </div>
        
        {footer && (
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  columns = { default: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 4,
  className 
}: ResponsiveGridProps) {
  const getGridCols = () => {
    const classes = [];
    if (columns.default) classes.push(`grid-cols-${columns.default}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    return classes.join(' ');
  };

  return (
    <div className={cn(`grid ${getGridCols()} gap-${gap}`, className)}>
      {children}
    </div>
  );
}

interface MobileCardProps {
  title: string;
  description?: string;
  badge?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export function MobileOptimizedCard({
  title,
  description,
  badge,
  children,
  actions,
  collapsible = false,
  defaultCollapsed = false,
  className
}: MobileCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn("pb-3", isMobile && "px-4 py-3")}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className={cn("truncate", isMobile && "text-base")}>
                {title}
              </CardTitle>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <CardDescription className={cn("line-clamp-2", isMobile && "text-sm")}>
                {description}
              </CardDescription>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            {actions && (
              <div className="flex items-center gap-1">
                {actions}
              </div>
            )}
            
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className={cn("pt-0", isMobile && "px-4 pb-4")}>
          {children}
        </CardContent>
      )}
    </Card>
  );
}

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  className?: string;
}

export function MobilePagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  className
}: MobilePaginationProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  // Desktop pagination with page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {showPageNumbers && (
        <>
          {currentPage > 3 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
              >
                1
              </Button>
              {currentPage > 4 && <span className="text-muted-foreground">...</span>}
            </>
          )}

          {getPageNumbers().map(page => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}

          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && <span className="text-muted-foreground">...</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function MobileViewToggle({
  view,
  onViewChange,
  options = [
    { key: 'grid', label: 'Grid', icon: Grid },
    { key: 'list', label: 'List', icon: List }
  ],
  className
}: {
  view: string;
  onViewChange: (view: string) => void;
  options?: Array<{ key: string; label: string; icon: any }>;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center border rounded-lg p-1", className)}>
      {options.map(option => {
        const IconComponent = option.icon;
        return (
          <Button
            key={option.key}
            variant={view === option.key ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange(option.key)}
            className="h-8 px-3"
          >
            <IconComponent className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}