
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Workflow, History, Cpu, Settings, LogOut, User, LifeBuoy } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NavLink = ({ href, label, icon: Icon }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant={isActive ? 'secondary' : 'ghost'}
            size="icon"
            className={cn("rounded-lg", isActive && "text-primary")}
            aria-label={label}
          >
            <Link href={href}>
              <Icon className="size-5" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={5}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user, logout } = useSubscription();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Workflow className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Kairo</span>
          </Link>
          <NavLink href="/workflow" label="Workflow Editor" icon={Workflow} />
          <NavLink href="/run-history" label="Run History" icon={History} />
          <NavLink href="/mcp" label="AI Agent Hub" icon={Cpu} />
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <NavLink href="/settings" label="Settings" icon={Settings} />
           {isLoggedIn && user ? (
             <DropdownMenu>
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-lg mt-auto">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={5}>Profile & Logout</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
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
            <NavLink href="/login" label="Login" icon={User} />
          )}
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:pl-14 h-screen">
        {children}
      </div>
    </div>
  );
}
