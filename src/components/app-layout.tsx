
'use client';

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
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Workflow, History, Cpu, Settings, LogOut, User, Menu, LayoutDashboard } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
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


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workflow', label: 'Workflow Editor', icon: Workflow },
  { href: '/run-history', label: 'Run History', icon: History },
  { href: '/mcp', label: 'AI Agent Hub', icon: Cpu },
  { href: '/settings', label: 'Settings', icon: Settings },
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
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
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
                            <Link href="/profile" className='cursor-pointer'>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
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
                    <User />
                    <span>Login</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col h-screen">
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6 sm:hidden">
                <Link
                    href="/"
                    className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                  >
                    <Workflow className="h-4 w-4 transition-all group-hover:scale-110" />
                    <span className="sr-only">Kairo</span>
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
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
                            {isLoggedIn ? (
                              <>
                                <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
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
            <div className="flex-1 h-[calc(100vh-3.5rem)] sm:h-screen">{children}</div>
        </div>
    </SidebarProvider>
  );
}
