
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, BrainCircuit, BarChart3, CheckCircle, ArrowRight, Rocket, Wrench, Lightbulb } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/20">
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
            {/* <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Benefits
            </Link> */}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
        <section className="text-center py-16 md:py-24">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Unleash AI-Powered Automation, <span className="text-primary">Effortlessly</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
            FlowAI Studio empowers you to visually design, build, and deploy intelligent workflows in minutes. Turn complex processes into streamlined automations with our intuitive drag-and-drop interface and AI-driven assistance.
          </p>
          <Link href="/workflow">
            <Button size="lg" className="text-lg px-10 py-7 shadow-lg hover:shadow-primary/40 transition-shadow group">
              Start Building Your First Workflow <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </section>

        <section id="features" className="py-16 md:py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Everything You Need to Automate</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <div className="p-6 bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out">
              <div className="flex justify-center mb-4">
                <BrainCircuit className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center">AI-Powered Workflow Generation</h3>
              <p className="text-muted-foreground text-sm text-center">
                Describe your automation needs in plain language. Our AI assistant will intelligently draft a workflow, giving you a powerful head start.
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out">
               <div className="flex justify-center mb-4">
                <Image 
                  src="https://placehold.co/600x400.png" 
                  alt="Visual Workflow Editor" 
                  width={200} 
                  height={125} 
                  className="rounded-lg shadow-md"
                  data-ai-hint="workflow canvas editor"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center">Intuitive Drag & Drop Canvas</h3>
              <p className="text-muted-foreground text-sm text-center">
                Visually construct and modify your workflows. Connect nodes, configure steps, and see your automation take shape in real-time.
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out">
              <div className="flex justify-center mb-4">
                <BarChart3 className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center">Test & Deploy with Confidence</h3>
              <p className="text-muted-foreground text-sm text-center">
                Simulate your workflow's behavior with mock data to ensure everything works as expected. Deploy validated automations to handle real-world tasks reliably.
              </p>
            </div>
          </div>
        </section>

        <section id="benefits" className="py-16 md:py-20 bg-muted/30 rounded-xl my-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Why Choose FlowAI Studio?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center p-4">
                <div className="p-3 bg-primary/20 rounded-full mb-4">
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Accelerate Development</h3>
                <p className="text-muted-foreground text-sm">Go from idea to automation significantly faster than traditional coding.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="p-3 bg-primary/20 rounded-full mb-4">
                  <Wrench className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Reduce Complexity</h3>
                <p className="text-muted-foreground text-sm">Abstract away intricate coding tasks with a visual, node-based approach.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="p-3 bg-primary/20 rounded-full mb-4">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Smart Assistance</h3>
                <p className="text-muted-foreground text-sm">Leverage AI for workflow generation, suggestions, and explanations.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="p-3 bg-primary/20 rounded-full mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Boost Efficiency</h3>
                <p className="text-muted-foreground text-sm">Automate repetitive processes and free up your team for high-value work.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 text-center">
           <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">Ready to Streamline Your Processes?</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                <div className="md:w-1/2">
                     <Image 
                        src="https://placehold.co/800x500.png" 
                        alt="Workflow automation example" 
                        width={500} 
                        height={312} 
                        className="rounded-lg shadow-xl mx-auto transform hover:scale-105 transition-transform duration-300"
                        data-ai-hint="process automation abstract"
                      />
                </div>
                <div className="md:w-1/2 md:text-left">
                    <p className="text-lg text-muted-foreground mb-6">
                        FlowAI Studio empowers you to connect various services, process data, and automate repetitive tasks with unparalleled ease. From simple API calls to complex multi-step AI-driven processes, build it all without writing extensive code.
                    </p>
                    <ul className="space-y-2 mb-6 text-left">
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">Generate complete workflows from natural language prompts.</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">Visually connect and configure diverse nodes for any task.</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">Simulate execution to test and debug before going live.</span>
                        </li>
                         <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">Leverage AI for suggestions, explanations, and configuration help.</span>
                        </li>
                    </ul>
                    <Link href="/workflow">
                        <Button size="lg" variant="outline" className="text-lg px-8 py-6 shadow-md hover:shadow-accent/30 transition-shadow border-primary/50 hover:border-primary text-primary hover:bg-primary/5">
                            Start Building Now
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
      </main>

      <footer className="text-center py-10 border-t mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} FlowAI Studio. Automate intelligently.
        </p>
      </footer>
    </div>
  );
}

