
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, BrainCircuit, BarChart3 } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-primary flex items-center">
            <Zap className="h-8 w-8 mr-2" />
            FlowAI Studio
          </Link>
          <nav className="space-x-4">
            <Link href="/workflow" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Workflow Editor
            </Link>
            {/* Add more links later e.g. Features, Pricing, Docs */}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Automate Anything with <span className="text-primary">AI-Powered Workflows</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
            Visually design, build, and deploy complex automations. Let our intelligent assistant guide you from idea to execution.
          </p>
          <Link href="/workflow">
            <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-primary/30 transition-shadow">
              Go to Workflow Editor
            </Button>
          </Link>
        </section>

        <section className="py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="p-6 bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
              <BrainCircuit className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Intelligent Design</h3>
              <p className="text-muted-foreground text-sm">
                Describe your workflow in plain English and let our AI generate the initial structure for you.
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Visual Workflow Editor" 
                width={300} 
                height={200} 
                className="mx-auto mb-4 rounded-lg shadow-md"
                data-ai-hint="workflow editor interface"
              />
              <h3 className="text-xl font-semibold text-foreground mb-2">Visual Editor</h3>
              <p className="text-muted-foreground text-sm">
                Drag, drop, and connect nodes to build and refine your automations on an intuitive canvas.
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
              <BarChart3 className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Simulate & Deploy</h3>
              <p className="text-muted-foreground text-sm">
                Test your workflows in a simulated environment before deploying them to handle real-world tasks.
              </p>
            </div>
          </div>
        </section>
        
        <section className="py-16 text-center">
           <h2 className="text-3xl font-bold text-foreground mb-8">Ready to Streamline Your Processes?</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="md:w-1/2">
                     <Image 
                        src="https://placehold.co/800x500.png" 
                        alt="Workflow automation example" 
                        width={500} 
                        height={312} 
                        className="rounded-lg shadow-xl mx-auto"
                        data-ai-hint="automation abstract"
                      />
                </div>
                <div className="md:w-1/2 md:text-left">
                    <p className="text-lg text-muted-foreground mb-6">
                        FlowAI Studio empowers you to connect various services, process data, and automate repetitive tasks with unparalleled ease. From simple API calls to complex multi-step AI-driven processes, build it all without writing extensive code.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6 text-left ml-4 md:ml-0">
                        <li>Generate workflows from natural language prompts.</li>
                        <li>Visually connect and configure diverse nodes.</li>
                        <li>Simulate execution before going live.</li>
                        <li>Leverage AI for suggestions and explanations.</li>
                    </ul>
                    <Link href="/workflow">
                        <Button size="lg" variant="outline" className="text-lg px-8 py-6 shadow-md hover:shadow-accent/30 transition-shadow">
                            Start Building Now
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
      </main>

      <footer className="text-center py-8 border-t">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} FlowAI Studio. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
