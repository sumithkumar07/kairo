'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import { EnhancedNavigation } from "./enhanced-navigation"
import { EnhancedHeader } from "./enhanced-header"
import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  ArrowUp,
  Sparkles,
  Activity,
  Database,
  Wifi,
  Shield
} from "lucide-react"

interface EnhancedAppLayoutProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumb?: Array<{
    title: string
    href?: string
  }>
  fullWidth?: boolean
  centered?: boolean
}

export function EnhancedAppLayout({ 
  children, 
  className,
  title,
  subtitle,
  actions,
  breadcrumb,
  fullWidth = false,
  centered = false
}: EnhancedAppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [showScrollTop, setShowScrollTop] = React.useState(false)

  // Handle scroll to top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <EnhancedNavigation 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <EnhancedHeader 
          title={title}
          subtitle={subtitle}
          actions={actions}
          breadcrumb={breadcrumb}
        />

        {/* Content */}
        <main className={cn(
          "flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/20",
          className
        )}>
          <div className={cn(
            "h-full",
            !fullWidth && "container mx-auto px-4 py-6",
            centered && "flex items-center justify-center"
          )}>
            {children}
          </div>
        </main>

        {/* Status Bar */}
        <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>System Status</span>
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                    Operational
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>PostgreSQL</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Mistral AI</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  <span>Connected</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure</span>
                </div>
                
                <span>Version 1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          variant="floating"
          size="floating"
          onClick={scrollToTop}
          className="bottom-8 right-8"
          tooltip="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}

// Specialized layout components
export function DashboardLayout({ children, ...props }: EnhancedAppLayoutProps) {
  return (
    <EnhancedAppLayout 
      {...props}
      title="Dashboard"
      subtitle="Welcome back! Here's your AI automation overview"
      breadcrumb={[
        { title: "Home", href: "/" },
        { title: "Dashboard" }
      ]}
    >
      {children}
    </EnhancedAppLayout>
  )
}

export function WorkflowLayout({ children, ...props }: EnhancedAppLayoutProps) {
  return (
    <EnhancedAppLayout 
      {...props}
      title="Workflow Editor"
      subtitle="Build and manage your AI-powered automations"
      breadcrumb={[
        { title: "Home", href: "/" },
        { title: "Workflow Editor" }
      ]}
      fullWidth
    >
      {children}
    </EnhancedAppLayout>
  )
}

export function SettingsLayout({ children, ...props }: EnhancedAppLayoutProps) {
  return (
    <EnhancedAppLayout 
      {...props}
      title="Settings"
      subtitle="Manage your account and preferences"
      breadcrumb={[
        { title: "Home", href: "/" },
        { title: "Settings" }
      ]}
    >
      {children}
    </EnhancedAppLayout>
  )
}

export function AgentHubLayout({ children, ...props }: EnhancedAppLayoutProps) {
  return (
    <EnhancedAppLayout 
      {...props}
      title="AI Agent Hub"
      subtitle="Interact with your intelligent automation assistant"
      breadcrumb={[
        { title: "Home", href: "/" },
        { title: "AI Agent Hub" }
      ]}
    >
      {children}
    </EnhancedAppLayout>
  )
}