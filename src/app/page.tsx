'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Workflow, BrainCircuit, CheckCircle, ArrowRight, Rocket, GitFork, GaugeCircle, Puzzle, Brain, UserPlus, LogOut, Bot, Settings, Zap, Cpu } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HomePage() {
  const { isLoggedIn, logout } = useSubscription();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-primary flex items-center">
            <Workflow className="h-8 w-8 mr-2" />
            Kairo
          </Link>
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" asChild className="text-sm font-medium">
              <Link href="/workflow">Workflow Editor</Link>
            </Button>
            <Button variant="ghost" asChild className="text-sm font-medium">
              <Link href="/run-history">Run History</Link>
            </Button>
             <Button variant="ghost" asChild className="text-sm font-medium">
              <Link href="/mcp">Agent Hub</Link>
            </Button>
            <Button variant="ghost" asChild className="text-sm font-medium">
              <Link href="/subscriptions">Subscriptions</Link>
            </Button>

            {isLoggedIn ? (
              <>
                <Button variant="ghost" asChild size="sm" className="text-sm font-medium">
                  <Link href="/profile">Profile</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={logout} className="text-sm">
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild size="sm" className="text-sm font-medium">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild size="sm" className="text-sm">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>

           <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link href="/workflow">Workflow Editor</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/run-history">Run History</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/mcp">Agent Hub</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/subscriptions">Subscriptions</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isLoggedIn ? (
                    <>
                      <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
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

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
        <section className="text-center py-16 md:py-24">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 bg-clip-text text-transparent bg-gradient-to-br from-gray-200 to-gray-500">
            Intelligent Automation, <span className="text-primary">Visually Designed</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
            Kairo empowers you to visually design, build, and deploy intelligent workflows in minutes. Turn complex processes into streamlined automations with our intuitive drag-and-drop interface and AI-driven assistance.
          </p>
          <Button asChild size="lg" className="group text-lg px-10 py-7 shadow-lg hover:shadow-primary/40 transition-all duration-300 ease-in-out hover:scale-105 bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLoggedIn ? (
              <Link href="/workflow">
                Go to Workflow Editor <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link href="/signup">
                Get Started - Free Trial <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </Button>
        </section>

        <section id="features" className="py-16 md:py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Powerful Features, Simplified</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <div className="p-6 bg-card rounded-xl border border-border/50 shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 ease-in-out flex flex-col">
              <div className="flex justify-center items-center mb-4 h-[125px]">
                 <BrainCircuit className="h-20 w-20 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center">Intelligent Design</h3>
              <p className="text-muted-foreground text-sm text-center flex-grow">
                Describe your automation in plain language. Our AI drafts a workflow, giving you a smart head start.
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border/50 shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 ease-in-out flex flex-col">
               <div className="flex justify-center items-center mb-4 h-[125px]">
                <GitFork className="h-20 w-20 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center">Visual Editor</h3>
              <p className="text-muted-foreground text-sm text-center flex-grow">
                Visually construct and modify workflows. Connect nodes, configure steps, and see your automation take shape in real-time.
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border/50 shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 ease-in-out flex flex-col">
              <div className="flex justify-center items-center mb-4 h-[125px]">
                 <Rocket className="h-20 w-20 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center">Simulate & Deploy</h3>
              <p className="text-muted-foreground text-sm text-center flex-grow">
                Test your workflow's behavior with mock data. Deploy validated automations to handle real-world tasks reliably.
              </p>
            </div>
          </div>
        </section>

        <section id="benefits" className="py-16 md:py-20 bg-card/50 border border-border/50 rounded-xl my-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Why Choose Kairo?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-card p-6 rounded-xl shadow-xl hover:shadow-accent/30 hover:scale-[1.02] transition-all duration-300 ease-in-out flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-4 shadow-inner flex items-center justify-center h-[80px] w-[80px]">
                   <GaugeCircle className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Accelerate Development</h3>
                <p className="text-muted-foreground text-sm flex-grow">Go from idea to automation significantly faster than traditional coding.</p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-xl hover:shadow-accent/30 hover:scale-[1.02] transition-all duration-300 ease-in-out flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-4 shadow-inner flex items-center justify-center h-[80px] w-[80px]">
                   <Puzzle className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Reduce Complexity</h3>
                <p className="text-muted-foreground text-sm flex-grow">Abstract away intricate coding tasks with a visual, node-based approach.</p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-xl hover:shadow-accent/30 hover:scale-[1.02] transition-all duration-300 ease-in-out flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-4 shadow-inner flex items-center justify-center h-[80px] w-[80px]">
                  <Brain className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Smart Assistance</h3>
                <p className="text-muted-foreground text-sm flex-grow">Leverage AI for workflow generation, suggestions, and explanations.</p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-xl hover:shadow-accent/30 hover:scale-[1.02] transition-all duration-300 ease-in-out flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-4 shadow-inner flex items-center justify-center h-[80px] w-[80px]">
                    <Cpu className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">AI Agent Control</h3>
                <p className="text-muted-foreground text-sm flex-grow">Configure your AI's skills and control it programmatically via the Agent Hub.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 text-center">
           <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">Ready to Streamline Your Processes?</h2>
            <div className="max-w-3xl mx-auto">
                <p className="text-lg text-muted-foreground mb-6 text-center">
                    Kairo empowers you to connect various services, process data, and automate repetitive tasks with unparalleled ease. From simple API calls to complex multi-step AI-driven processes, build it all without writing extensive code.
                </p>
                <ul className="space-y-3 mb-8 text-left mx-auto max-w-xl">
                    <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2.5 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">Generate complete workflows from natural language prompts.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2.5 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">Visually connect and configure diverse nodes for any task.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2.5 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">Simulate execution to test and debug before going live.</span>
                    </li>
                     <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2.5 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">Leverage AI for suggestions, explanations, and configuration help.</span>
                    </li>
                </ul>
                <div className="text-center mt-8">
                    <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 shadow-md hover:shadow-accent/30 transition-all duration-300 ease-in-out border-primary/70 hover:border-primary text-primary hover:bg-primary/10 group hover:scale-105">
                        {isLoggedIn ? (
                            <Link href="/workflow">
                                Open Workflow Editor
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <Link href="/signup">
                                Sign Up & Build Now
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                    </Button>
                </div>
            </div>
        </section>
      </main>

      <footer className="text-center py-10 border-t border-border/50 mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Kairo. Automate intelligently.
          <Link href="/contact" className="ml-2 text-primary hover:underline font-medium">Contact Us</Link>
        </p>
      </footer>
    </div>
  );
}
