'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Users,
  Globe,
  BarChart3,
  Settings,
  Plus,
  Play,
  Pause,
  Stop,
  RefreshCw,
  Download,
  Upload,
  Share,
  Copy,
  Edit,
  Trash2,
  Eye,
  Heart,
  Star,
  Bookmark,
  MessageSquare,
  Bell,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
  gradient?: string;
  glow?: boolean;
  pulse?: boolean;
  asChild?: boolean;
}

export function InteractiveButton({
  children,
  variant = 'default',
  size = 'default',
  className,
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  gradient,
  glow = false,
  pulse = false,
  asChild = false,
  ...props
}: InteractiveButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonClasses = cn(
    "relative overflow-hidden transition-all duration-300",
    gradient && `bg-gradient-to-r ${gradient}`,
    glow && isHovered && "shadow-lg shadow-primary/25",
    pulse && "animate-pulse",
    loading && "cursor-wait",
    className
  );

  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  const buttonContent = (
    <>
      {/* Shimmer effect */}
      {isHovered && !disabled && !loading && (
        <div className="absolute inset-0 -top-2 flex h-full w-full justify-center blur-md">
          <div className="relative h-full w-8 bg-white/20 -skew-x-12" />
        </div>
      )}
      
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <RefreshCw className={cn(iconSize, "animate-spin")} />
        ) : (
          Icon && iconPosition === 'left' && <Icon className={iconSize} />
        )}
        {children}
        {Icon && iconPosition === 'right' && !loading && <Icon className={iconSize} />}
      </span>
    </>
  );

  if (asChild) {
    return (
      <div
        className={buttonClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {buttonContent}
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {buttonContent}
    </Button>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
  color: string;
  badge?: string;
  category?: string;
  isNew?: boolean;
  isPro?: boolean;
  isPopular?: boolean;
  className?: string;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  color,
  badge,
  category,
  isNew = false,
  isPro = false,
  isPopular = false,
  className
}: ActionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden",
        "border-border/50 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background gradient effect */}
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-0 transition-opacity duration-500",
        isHovered && "opacity-10",
        color.includes('blue') && "bg-gradient-to-br from-blue-500/30 to-cyan-500/30",
        color.includes('green') && "bg-gradient-to-br from-green-500/30 to-emerald-500/30",
        color.includes('purple') && "bg-gradient-to-br from-purple-500/30 to-pink-500/30",
        color.includes('orange') && "bg-gradient-to-br from-orange-500/30 to-yellow-500/30"
      )} style={{ transform: 'translate(50%, -50%)' }} />

      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm",
            color
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg leading-tight">{title}</h3>
              {isNew && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-xs">
                  New
                </Badge>
              )}
              {isPro && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-xs">
                  Pro
                </Badge>
              )}
              {isPopular && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-xs">
                  Popular
                </Badge>
              )}
            </div>
            
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              {description}
            </p>
            
            <div className="flex items-center justify-between">
              {category && (
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
              )}
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
              <ChevronRight className={cn(
                "h-4 w-4 text-muted-foreground transition-all duration-200 ml-auto",
                isHovered && "translate-x-1 text-foreground"
              )} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

interface QuickActionGridProps {
  actions: Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    href?: string;
    onClick?: () => void;
    color: string;
    category?: string;
    isNew?: boolean;
    isPro?: boolean;
    isPopular?: boolean;
  }>;
  columns?: number;
  className?: string;
}

export function QuickActionGrid({
  actions,
  columns = 3,
  className
}: QuickActionGridProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={cn('grid gap-6', gridClass, className)}>
      {actions.map((action) => (
        <ActionCard
          key={action.id}
          title={action.title}
          description={action.description}
          icon={action.icon}
          href={action.href}
          onClick={action.onClick}
          color={action.color}
          category={action.category}
          isNew={action.isNew}
          isPro={action.isPro}
          isPopular={action.isPopular}
        />
      ))}
    </div>
  );
}

// Enhanced notification badge with animation
export function NotificationBadge({
  count,
  showCount = true,
  maxCount = 99,
  dot = false,
  className
}: {
  count: number;
  showCount?: boolean;
  maxCount?: number;
  dot?: boolean;
  className?: string;
}) {
  if (count === 0) return null;

  if (dot) {
    return (
      <div className={cn(
        "absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse",
        className
      )} />
    );
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <Badge 
      className={cn(
        "absolute -top-2 -right-2 h-5 min-w-5 px-1 text-xs bg-red-500 text-white",
        "animate-bounce border-2 border-background",
        !showCount && "w-3 h-3 p-0",
        className
      )}
    >
      {showCount ? displayCount : ''}
    </Badge>
  );
}

// Enhanced loading states
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-muted rounded-xl animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-3 bg-muted/50 rounded animate-pulse w-2/3" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted/50 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

// Professional action buttons with hover effects
export const QUICK_ACTIONS = {
  createWorkflow: {
    id: 'create-workflow',
    title: 'Create Workflow',
    description: 'Build a new automation from scratch',
    icon: Plus,
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    category: 'Creation',
    href: '/workflow/new'
  },
  
  aiStudio: {
    id: 'ai-studio',
    title: 'AI Studio',
    description: 'Generate workflows with AI assistance',
    icon: Sparkles,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    category: 'AI',
    isNew: true,
    href: '/ai-studio'
  },
  
  browseTemplates: {
    id: 'browse-templates',
    title: 'Browse Templates',
    description: 'Start with pre-built workflow templates',
    icon: Target,
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    category: 'Templates',
    isPopular: true,
    href: '/templates'
  },
  
  integrations: {
    id: 'integrations',
    title: 'Connect Apps',
    description: 'Set up integrations with your favorite tools',
    icon: Globe,
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    category: 'Integration',
    href: '/integrations'
  },
  
  analytics: {
    id: 'analytics',
    title: 'View Analytics',
    description: 'Monitor performance and gain insights',
    icon: BarChart3,
    color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    category: 'Analytics',
    href: '/analytics'
  },
  
  teamManagement: {
    id: 'team-management',
    title: 'Manage Team',
    description: 'Collaborate with team members',
    icon: Users,
    color: 'bg-gradient-to-r from-teal-500 to-blue-500',
    category: 'Team',
    href: '/account?tab=team'
  }
};