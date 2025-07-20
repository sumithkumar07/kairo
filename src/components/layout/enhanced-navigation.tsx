'use client';

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Workflow, 
  Bot, 
  Settings, 
  User, 
  History, 
  CreditCard,
  ChevronRight,
  Sparkles,
  Activity,
  BarChart3,
  Database,
  Terminal,
  Layers,
  Search,
  HelpCircle,
  Bell,
  Menu,
  X,
  Zap,
  Plus
} from "lucide-react"

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
  premium?: boolean
  external?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and analytics"
  },
  {
    title: "Workflow Editor",
    href: "/workflow",
    icon: Workflow,
    description: "Build and edit workflows"
  },
  {
    title: "AI Agent Hub",
    href: "/agent-hub",
    icon: Bot,
    description: "AI-powered automation",
    premium: true
  },
  {
    title: "Run History",
    href: "/run-history",
    icon: History,
    description: "Execution logs and debugging"
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Performance insights",
    premium: true
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Configure your account"
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    description: "Account information"
  },
  {
    title: "Subscription",
    href: "/subscriptions",
    icon: CreditCard,
    description: "Manage your plan"
  },
]

const quickActions = [
  {
    title: "New Workflow",
    href: "/workflow",
    icon: Workflow,
    color: "bg-blue-500",
    shortcut: "N"
  },
  {
    title: "AI Generate",
    href: "/workflow?ai=true",
    icon: Sparkles,
    color: "bg-purple-500",
    shortcut: "G"
  },
  {
    title: "Terminal",
    href: "/agent-hub",
    icon: Terminal,
    color: "bg-green-500",
    shortcut: "T"
  },
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
    color: "bg-orange-500",
    shortcut: "?"
  },
]

interface EnhancedNavigationProps {
  className?: string
  collapsed?: boolean
  onToggle?: () => void
}

export function EnhancedNavigation({ 
  className, 
  collapsed = false, 
  onToggle 
}: EnhancedNavigationProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const NavigationLink = ({ item }: { item: NavigationItem }) => {
    const isActive = pathname === item.href
    
    return (
      <Link 
        href={item.href}
        className={cn(
          "nav-link group relative",
          isActive && "active",
          collapsed && "justify-center"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <item.icon className={cn(
            "h-5 w-5 transition-colors",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )} />
          
          {!collapsed && (
            <>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.title}</span>
                  {item.premium && (
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Pro
                    </Badge>
                  )}
                  {item.badge && (
                    <Badge variant="default" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                )}
              </div>
              
              {isActive && (
                <ChevronRight className="h-4 w-4 text-primary" />
              )}
            </>
          )}
        </div>
      </Link>
    )
  }

  const QuickAction = ({ action }: { action: any }) => (
    <Link
      href={action.href}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group",
        collapsed && "justify-center"
      )}
      onClick={() => setMobileMenuOpen(false)}
    >
      <div className={cn(
        "p-2 rounded-lg text-white",
        action.color
      )}>
        <action.icon className="h-4 w-4" />
      </div>
      
      {!collapsed && (
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{action.title}</span>
            <kbd className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {action.shortcut}
            </kbd>
          </div>
        </div>
      )}
    </Link>
  )

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-50 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
            <div className="fixed left-0 top-0 h-full w-80 bg-card border-r shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Navigation</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-4 space-y-2">
                {navigationItems.map((item) => (
                  <NavigationLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border/50 transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-border/50",
        collapsed && "px-2"
      )}>
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">Kairo</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Quick Actions
          </h3>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <QuickAction key={action.href} action={action} />
            ))}
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-2">
          {!collapsed && (
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Main Menu
            </h3>
          )}
          
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavigationLink key={item.href} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={cn(
        "p-4 border-t border-border/50",
        collapsed && "px-2"
      )}>
        {!collapsed && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>All systems operational</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Connected to PostgreSQL</span>
            </div>
          </div>
        )}
        
        <div className={cn(
          "flex items-center gap-2 mt-3",
          collapsed && "justify-center"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 relative"
          >
            <Bell className="h-4 w-4" />
            <span className="notification-badge">3</span>
          </Button>
          
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}