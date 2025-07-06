
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Workflow, BrainCircuit, ArrowRight, Rocket, GitFork, GaugeCircle, Puzzle, Brain, Cpu, ShieldCheck } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';


export default function HomePage() {
  const { isLoggedIn } = useSubscription();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <MarketingHeader />

      <main className="flex-1">
        <section className="text-center py-20 md:py-32 bg-muted/20 dot-grid-background">
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground mb-6 bg-clip-text text-transparent bg-gradient-to-br from-primary via-primary/80 to-foreground/80">
              Build Workflows at the Speed of Thought
            </h1>
            <p className="max-w-3xl mx-auto text-base md:text-xl text-muted-foreground mb-10">
              Kairo is an intelligent, visual-first platform that empowers you to design, automate, and deploy complex workflows in minutes, not weeks.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button asChild size="lg" className="group text-lg px-10 py-7 shadow-lg hover:shadow-primary/40 transition-all duration-300 ease-in-out hover:scale-105 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                  {isLoggedIn ? 'Go to Dashboard' : 'Get Started for Free'} 
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="group text-lg px-10 py-7 shadow-lg hover:shadow-accent/40 transition-all duration-300 ease-in-out hover:scale-105">
                <Link href="/contact">
                  Request a Demo
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">15-day free trial. No credit card required.</p>
          </div>
        </section>

        <section id="features" className="py-20 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">The Future of Automation is Visual</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">Kairo provides a complete toolkit for building robust, intelligent automations without the friction of traditional development.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-card rounded-xl border border-border/50 shadow-lg hover:shadow-primary/10 hover:scale-[1.02] transition-all duration-300 ease-in-out flex flex-col items-center text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-5 shadow-inner">
                        <BrainCircuit className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">AI-Powered Generation</h3>
                    <p className="text-muted-foreground text-sm flex-grow">
                      Describe your goal in plain text. Our AI assistant will draft a complete, functional workflow on the canvas, giving you a massive head start.
                    </p>
                </div>
                <div className="p-8 bg-card rounded-xl border border-border/50 shadow-lg hover:shadow-primary/10 hover:scale-[1.02] transition-all duration-300 ease-in-out flex flex-col items-center text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-5 shadow-inner">
                        <GitFork className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Intuitive Visual Editor</h3>
                    <p className="text-muted-foreground text-sm flex-grow">
                      Visually construct and modify any workflow. Drag and drop nodes, map data flows, and see your entire automation take shape in real-time.
                    </p>
                </div>
                <div className="p-8 bg-card rounded-xl border border-border/50 shadow-lg hover:shadow-primary/10 hover:scale-[1.02] transition-all duration-300 ease-in-out flex flex-col items-center text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-5 shadow-inner">
                        <Rocket className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Safe Simulation & Deployment</h3>
                    <p className="text-muted-foreground text-sm flex-grow">
                      Test your workflow's logic with mock data in Simulation Mode. When you're ready, switch to Live Mode to handle real-world tasks reliably and securely.
                    </p>
                </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="py-20 bg-muted/20">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">Why Choose Kairo?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center">
                <GaugeCircle className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Accelerate Development</h3>
                <p className="text-muted-foreground text-sm">Go from idea to production-ready automation up to 10x faster than traditional coding.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Puzzle className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Reduce Complexity</h3>
                <p className="text-muted-foreground text-sm">Abstract away boilerplate code and intricate API connections with a visual, node-based approach.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <ShieldCheck className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Build with Confidence</h3>
                <p className="text-muted-foreground text-sm">Built-in error handling, live debugging, and simulation modes ensure your workflows are robust and reliable.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Cpu className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Agentic AI Control</h3>
                <p className="text-muted-foreground text-sm">Configure your AI's skills and control it programmatically via the secure Agent Hub API for advanced use cases.</p>
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
                    <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                      Start Building Now
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
