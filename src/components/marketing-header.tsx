'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Workflow, LogIn, Menu, User, LogOut } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';

export function MarketingHeader() {
  const { isLoggedIn, logout, user } = useSubscription();

  return (
    <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-primary flex items-center gap-2 transition-opacity hover:opacity-80">
          <Workflow className="h-8 w-8" />
          Kairo
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/subscriptions">Subscriptions</Link>
          </Button>
           <Button variant="ghost" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
          <div className="w-px h-6 bg-border mx-2"></div>
          {isLoggedIn && user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.email.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild><Link href="/dashboard">Go to Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                  </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
           <ThemeToggle />
        </nav>

         <div className="md:hidden">
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
                <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/workflow">Workflow Editor</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/run-history">Run History</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/mcp">Agent Hub</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/subscriptions">Subscriptions</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/contact">Contact</Link></DropdownMenuItem>
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
                  <>
                    <DropdownMenuItem asChild><Link href="/login">Log In</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/signup">Sign Up</Link></DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>
    </header>
  );
}
