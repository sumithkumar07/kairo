
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Workflow, BrainCircuit, ArrowRight, Rocket, GitFork, GaugeCircle, Puzzle, Brain, LogIn, UserPlus, Cpu, Settings, Menu } from 'lucide-react';
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


export default function HomePage() {
  const { isLoggedIn, logout, user } = useSubscription();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
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
                      <span className="font-medium">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild><Link href="/workflow">Go to App</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                        <LogIn className="mr-2 h-4 w-4" />
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
                      <DropdownMenuItem onClick={logout}>
                        <LogIn className="mr-2 h-4 w-4" />
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

      <main className="flex-1">
        <section className="text-center py-20 md:py-32">
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground mb-6 bg-clip-text text-transparent bg-gradient-to-br from-primary via-primary/80 to-foreground/80">
              Intelligent Automation, Visually Designed
            </h1>
            <p className="max-w-3xl mx-auto text-base md:text-xl text-muted-foreground mb-10">
              Kairo empowers you to visually design, build, and deploy intelligent workflows in minutes. Turn complex processes into streamlined automations with our intuitive drag-and-drop interface and AI-driven assistance.
            </p>
            <Button asChild size="lg" className="group text-lg px-10 py-7 shadow-lg hover:shadow-primary/40 transition-all duration-300 ease-in-out hover:scale-105 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href={isLoggedIn ? "/workflow" : "/signup"}>
                {isLoggedIn ? 'Open Workflow Editor' : 'Get Started for Free'} 
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/40">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">The Future of Automation is Visual</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">Kairo provides a complete toolkit for building robust, intelligent automations without the friction of traditional development.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-card rounded-xl border border-border/50 shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 ease-in-out flex flex-col items-center text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-5 shadow-inner">
                        <BrainCircuit className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Intelligent Design</h3>
                    <p className="text-muted-foreground text-sm flex-grow">
                      Describe your automation in plain language. Our AI drafts a workflow, giving you a smart head start.
                    </p>
                </div>
                <div className="p-8 bg-card rounded-xl border border-border/50 shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 ease-in-out flex flex-col items-center text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-5 shadow-inner">
                        <GitFork className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Visual Editor</h3>
                    <p className="text-muted-foreground text-sm flex-grow">
                      Visually construct and modify workflows. Connect nodes, configure steps, and see your automation take shape in real-time.
                    </p>
                </div>
                <div className="p-8 bg-card rounded-xl border border-border/50 shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 ease-in-out flex flex-col items-center text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-5 shadow-inner">
                        <Rocket className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Simulate & Deploy</h3>
                    <p className="text-muted-foreground text-sm flex-grow">
                      Test your workflow's behavior with mock data. Deploy validated automations to handle real-world tasks reliably.
                    </p>
                </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="py-20">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">Why Choose Kairo?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center">
                <GaugeCircle className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Accelerate Development</h3>
                <p className="text-muted-foreground text-sm">Go from idea to automation significantly faster than traditional coding.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Puzzle className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Reduce Complexity</h3>
                <p className="text-muted-foreground text-sm">Abstract away intricate coding tasks with a visual, node-based approach.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Brain className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Smart Assistance</h3>
                <p className="text-muted-foreground text-sm">Leverage AI for workflow generation, suggestions, and explanations.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Cpu className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">AI Agent Control</h3>
                <p className="text-muted-foreground text-sm">Configure your AI's skills and control it programmatically via the Agent Hub.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 text-center bg-primary/5 border-y">
            <div className="container">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Streamline Your Processes?</h2>
                <p className="max-w-3xl mx-auto text-base md:text-lg text-muted-foreground mb-10">
                    Join developers and businesses who use Kairo to automate tasks, connect services, and build intelligent systems with unprecedented speed and clarity.
                </p>
                <Button asChild size="lg" className="group text-lg px-10 py-7 shadow-lg hover:shadow-primary/40 transition-all duration-300 ease-in-out hover:scale-105">
                    <Link href={isLoggedIn ? "/workflow" : "/signup"}>
                      Start Building Now
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </div>
        </section>
      </main>

      <footer className="bg-background">
        <div className="container text-center py-8">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Kairo. Automate intelligently.
              <Link href="/contact" className="ml-4 text-primary hover:underline font-medium">Contact Us</Link>
              <Link href="/subscriptions" className="ml-4 text-primary hover:underline font-medium">Pricing</Link>
            </p>
        </div>
      </footer>
    </div>
  );
}

