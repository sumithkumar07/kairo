
'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import { Workflow, History, Cpu, Settings, LogOut, User, Menu, LayoutDashboard, Compass, FileText, Shield, Activity, CreditCard, Calendar, BarChart3, Crown, Link as LinkIcon, HelpCircle, BookOpen, AlertCircle, GraduationCap, Bot, BarChart2 } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { GlobalSearch, KeyboardShortcuts, ContextualHelp } from '@/components/enhanced-navigation';
import { EnhancedThemeToggle } from '@/components/enhanced-user-experience';
import { RealTimeNotifications } from '@/components/real-time-notifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';


// Main Navigation - Core App Features
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workflow', label: 'Workflow Editor', icon: Workflow },
  { href: '/ai-studio', label: 'AI Studio', icon: Bot },
  { href: '/integrations', label: 'Integrations', icon: LinkIcon },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/account', label: 'Account', icon: User },
];

// Secondary Navigation - Support & System
const secondaryNavItems = [
  { href: '/help', label: 'Help Center', icon: HelpCircle },
  { href: '/docs', label: 'Documentation', icon: BookOpen },
  { href: '/academy', label: 'Academy', icon: GraduationCap },
  { href: '/security', label: 'Security', icon: Shield },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/status', label: 'Status', icon: AlertCircle },
];


export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user, logout } = useSubscription();
  const pathname = usePathname();

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                <Link href="/" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
                    <Workflow className="h-4 w-4 transition-all group-hover:scale-110" />
                    <span className="sr-only">Kairo</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === item.href}
                                tooltip={{
                                    children: item.label,
                                    side: 'right',
                                }}
                            >
                                <Link href={item.href}>
                                    {React.createElement(item.icon, { className: "h-4 w-4" })}
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>

                {/* Secondary Navigation Section */}
                <div className="mt-8">
                    <div className="px-3 py-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Support & System
                        </h4>
                    </div>
                    <SidebarMenu>
                        {secondaryNavItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === item.href}
                                    tooltip={{
                                        children: item.label,
                                        side: 'right',
                                    }}
                                    className="text-sm"
                                >
                                    <Link href={item.href}>
                                        {React.createElement(item.icon, { className: "h-4 w-4" })}
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </div>
            </SidebarContent>
            <SidebarFooter>
              {isLoggedIn && user ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-lg mt-auto">
                          <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end">
                        <DropdownMenuItem asChild>
                            <Link href="/account" className='cursor-pointer'>
                                <User className="mr-2 h-4 w-4" />
                                <span>Account</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className='cursor-pointer'>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
              ) : (
                <SidebarMenuButton asChild tooltip={{ children: "Login", side: "right" }}>
                  <Link href="/login">
                    <User className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
                <Link
                    href="/"
                    className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base sm:hidden"
                  >
                    <Workflow className="h-4 w-4 transition-all group-hover:scale-110" />
                    <span className="sr-only">Kairo</span>
                </Link>
                <div className="flex items-center gap-2">
                    <RealTimeNotifications />
                    <ThemeToggle />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="sm:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {isLoggedIn && user && (
                                <>
                                  <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                      <p className="text-sm font-medium leading-none">Signed in as</p>
                                      <p className="text-xs leading-none text-muted-foreground truncate">
                                        {user.email}
                                      </p>
                                    </div>
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                </>
                            )}
                            {navItems.map(item => (
                                <DropdownMenuItem key={`mobile-${item.href}`} asChild><Link href={item.href}>{item.label}</Link></DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            {secondaryNavItems.slice(0, 3).map(item => (
                                <DropdownMenuItem key={`mobile-secondary-${item.href}`} asChild><Link href={item.href}>{item.label}</Link></DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            {isLoggedIn ? (
                              <>
                                <DropdownMenuItem asChild><Link href="/account">Account</Link></DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                                  <LogOut className="mr-2 h-4 w-4" />
                                  Logout
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem asChild><Link href="/login">Log In</Link></DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            {children}
        </SidebarInset>
    </SidebarProvider>
  );
}
