'use client';

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut, 
  CreditCard, 
  HelpCircle,
  Sparkles,
  Activity,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  Command,
  Plus,
  Workflow,
  Bot,
  Terminal,
  Zap,
  Home,
  History
} from "lucide-react"
import { useTheme } from "next-themes"
import { useSubscription } from "@/contexts/SubscriptionContext"

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  action?: {
    label: string
    href: string
  }
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Workflow Completed',
    message: 'Customer Onboarding Flow has finished successfully',
    type: 'success',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    action: {
      label: 'View Details',
      href: '/run-history'
    }
  },
  {
    id: '2',
    title: 'New Integration Available',
    message: 'Slack integration is now available in the node library',
    type: 'info',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    action: {
      label: 'Explore',
      href: '/workflow'
    }
  },
  {
    id: '3',
    title: 'Monthly Usage Report',
    message: 'You have used 68% of your monthly workflow runs',
    type: 'warning',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    action: {
      label: 'View Usage',
      href: '/subscriptions'
    }
  },
]

const quickCommands = [
  {
    title: 'New Workflow',
    href: '/workflow',
    icon: Workflow,
    shortcut: ['⌘', 'N']
  },
  {
    title: 'AI Generate',
    href: '/workflow?ai=true',
    icon: Sparkles,
    shortcut: ['⌘', 'G']
  },
  {
    title: 'Agent Hub',
    href: '/agent-hub',
    icon: Bot,
    shortcut: ['⌘', 'T']
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    shortcut: ['⌘', 'D']
  },
  {
    title: 'Run History',
    href: '/run-history',
    icon: History,
    shortcut: ['⌘', 'H']
  },
]

interface EnhancedHeaderProps {
  className?: string
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumb?: Array<{
    title: string
    href?: string
  }>
}

export function EnhancedHeader({ 
  className, 
  title, 
  subtitle, 
  actions,
  breadcrumb 
}: EnhancedHeaderProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user, currentTier, logout } = useSubscription()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false)

  const unreadNotifications = mockNotifications.filter(n => !n.read)

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case 'warning':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMin = Math.floor(diffInMs / (1000 * 60))
    const diffInHour = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDay = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMin < 60) {
      return `${diffInMin}m ago`
    } else if (diffInHour < 24) {
      return `${diffInHour}h ago`
    } else {
      return `${diffInDay}d ago`
    }
  }

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault()
            setCommandPaletteOpen(true)
            break
          case '/':
            e.preventDefault()
            setSearchOpen(true)
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          {/* Logo (mobile) */}
          <div className="flex md:hidden">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">Kairo</span>
            </Link>
          </div>

          {/* Breadcrumb */}
          {breadcrumb && (
            <nav className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              {breadcrumb.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronDown className="h-3 w-3 rotate-[-90deg]" />}
                  {item.href ? (
                    <Link 
                      href={item.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">{item.title}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Title */}
          {title && (
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8 hidden lg:block">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4 mr-2" />
            <span>Search workflows, nodes...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2 mr-4">
              {actions}
            </div>
          )}

          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              asChild
              tooltip="New Workflow"
            >
              <Link href="/workflow">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCommandPaletteOpen(true)}
              tooltip="Command Palette"
            >
              <Command className="h-4 w-4" />
            </Button>
          </div>

          {/* Search (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" tooltip="Toggle theme">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <span className="notification-badge">
                    {unreadNotifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadNotifications.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadNotifications.length} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {mockNotifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 hover:bg-muted/50 cursor-pointer border-l-2 transition-colors",
                        notification.read 
                          ? "border-transparent" 
                          : "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            {notification.action && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6"
                                asChild
                              >
                                <Link href={notification.action.href}>
                                  {notification.action.label}
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button variant="ghost" size="sm" className="w-full justify-center">
                  View All Notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.email} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {currentTier}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className="status-online w-2 h-2 rounded-full" />
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/subscriptions">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Subscription</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}