'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Workflow, 
  BrainCircuit, 
  ArrowRight, 
  Rocket, 
  GitFork, 
  Puzzle, 
  Bot, 
  ShieldCheck,
  Zap,
  Users,
  Globe,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Code,
  Database,
  Cloud,
  Settings,
  ChevronRight,
  Play,
  Sparkles,
  Target,
  Award,
  MessageSquare,
  Mail,
  Smartphone,
  CreditCard,
  BarChart3,
  FileText,
  Lightbulb,
  Briefcase,
  Building,
  Headphones,
  Layers,
  Eye,
  Timer,
  Activity,
  Network,
  Cpu,
  MousePointer,
  Palette,
  Wand2,
  Infinity,
  Lock,
  Shield,
  RefreshCw,
  Gauge,
  Boxes,
  Flame,
  Fingerprint,
  AlignLeft,
  BarChart,
  Webhook,
  GitBranch,
  FlaskConical,
  Microscope,
  Megaphone,
  Compass,
  Radar,
  Puzzle as PuzzleIcon,
  Wrench,
  Cog,
  Crosshair,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Workflow Generation',
    description: 'Describe your automation needs in natural language. Our advanced AI, powered by Puter.js meta-llama/llama-4-maverick, will generate complete, production-ready workflows instantly with unlimited usage.',
    badge: 'AI Enhanced',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: GitFork,
    title: 'Visual Workflow Builder',
    description: 'Professional drag-and-drop interface with advanced features including snapping, alignment guides, multi-select, real-time collaboration, and version control.',
    badge: 'Pro Tools',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Rocket,
    title: 'Enterprise-Ready Execution',
    description: 'Built for scale with intelligent error recovery, adaptive retry strategies, circuit breakers, comprehensive monitoring, and auto-scaling capabilities.',
    badge: 'Enterprise',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Puzzle,
    title: '100+ Premium Integrations',
    description: 'Connect with all your favorite tools: Salesforce, Slack, Shopify, Notion, Airtable, AWS, and many more. OAuth flows and webhook support included.',
    badge: 'Extensive',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Bot,
    title: 'Advanced Puter.js AI Suite',
    description: 'Leverage state-of-the-art AI models for intelligent code generation, natural language processing, multilingual translation, logical reasoning, and document analysis.',
    badge: 'Next-Gen AI',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: ShieldCheck,
    title: 'Military-Grade Security',
    description: 'SOC 2 Type II compliant with end-to-end encryption, advanced role-based access control, comprehensive audit logs, and enterprise SSO integration.',
    badge: 'Ultra Secure',
    color: 'from-teal-500 to-blue-500'
  }
];

const stats = [
  { value: '10x', label: 'Faster Development', icon: Rocket },
  { value: '100+', label: 'Integrations', icon: Globe },
  { value: '99.9%', label: 'Uptime SLA', icon: Shield },
  { value: '24/7', label: 'Expert Support', icon: Headphones }
];

const integrations = [
  { name: 'Salesforce', icon: Database, color: 'bg-blue-500' },
  { name: 'Slack', icon: MessageSquare, color: 'bg-green-500' },
  { name: 'Shopify', icon: CreditCard, color: 'bg-purple-500' },
  { name: 'Notion', icon: FileText, color: 'bg-gray-500' },
  { name: 'Airtable', icon: Database, color: 'bg-orange-500' },
  { name: 'Twilio', icon: Smartphone, color: 'bg-red-500' },
  { name: 'AWS', icon: Cloud, color: 'bg-yellow-500' },
  { name: 'Google Analytics', icon: BarChart3, color: 'bg-indigo-500' },
  { name: 'Stripe', icon: CreditCard, color: 'bg-blue-600' },
  { name: 'Mailchimp', icon: Mail, color: 'bg-yellow-600' },
  { name: 'HubSpot', icon: Building, color: 'bg-orange-600' },
  { name: 'GitHub', icon: Code, color: 'bg-gray-600' },
  { name: 'Zendesk', icon: Headphones, color: 'bg-green-600' },
  { name: 'Jira', icon: Activity, color: 'bg-blue-700' },
  { name: 'Figma', icon: Palette, color: 'bg-pink-500' },
  { name: 'Discord', icon: MessageSquare, color: 'bg-indigo-600' }
];

const useCases = [
  {
    title: 'Marketing Automation',
    description: 'Automate lead nurturing, email campaigns, and customer journeys with intelligent personalization',
    icon: Target,
    features: ['AI-powered lead scoring', 'Dynamic email sequences', 'Real-time CRM sync', 'Advanced analytics tracking'],
    color: 'from-pink-500 to-rose-500'
  },
  {
    title: 'Sales Operations',
    description: 'Streamline sales processes, data synchronization, and deal management with smart automation',
    icon: TrendingUp,
    features: ['Intelligent deal tracking', 'Automated pipeline management', 'Smart quote generation', 'Real-time reporting'],
    color: 'from-blue-500 to-indigo-500'
  },
  {
    title: 'Customer Support',
    description: 'Automate support tickets, customer communications, and knowledge base management',
    icon: Headphones,
    features: ['Smart ticket routing', 'AI-powered auto-responses', 'Dynamic escalation rules', 'Knowledge base automation'],
    color: 'from-green-500 to-teal-500'
  },
  {
    title: 'Data Processing',
    description: 'Transform, validate, and sync data across multiple systems with intelligent error handling',
    icon: Database,
    features: ['Real-time data validation', 'Format conversion', 'Multi-system sync', 'Intelligent error recovery'],
    color: 'from-purple-500 to-violet-500'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'VP of Operations',
    company: 'TechCorp',
    content: 'Kairo has revolutionized our workflow automation. What previously took our team weeks to implement now takes just minutes. The AI-powered generation is incredible.',
    rating: 5,
    avatar: 'SJ'
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    company: 'StartupXYZ',
    content: 'The most intuitive automation platform we\'ve ever used. The Puter.js AI integration with meta-llama/llama-4-maverick understands complex business requirements and delivers production-ready workflows instantly with unlimited usage.',
    rating: 5,
    avatar: 'MC'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Marketing Director',
    company: 'GrowthCo',
    content: 'Best automation platform in the market. The integrations are seamless, the UI is beautiful, and the performance is outstanding. Our team productivity has increased by 300%.',
    rating: 5,
    avatar: 'ER'
  }
];

const platformFeatures = [
  { icon: Cpu, title: 'High Performance', description: 'Lightning-fast execution' },
  { icon: Shield, title: 'Enterprise Security', description: 'Bank-grade protection' },
  { icon: RefreshCw, title: 'Auto-Scaling', description: 'Handles any workload' },
  { icon: Eye, title: 'Real-time Monitoring', description: 'Complete visibility' },
  { icon: Gauge, title: 'Smart Analytics', description: 'Actionable insights' },
  { icon: Boxes, title: 'Modular Design', description: 'Flexible architecture' }
];

export default function HomePage() {
  const { isLoggedIn } = useSubscription();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="container relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              <div className="animate-fade-in-up">
                <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Powered by Advanced Mistral AI
                </Badge>
              </div>
              
              <div className="animate-fade-in-up animation-delay-200">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground mb-6">
                  Build Workflows at the
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {' '}Speed of Thought
                  </span>
                </h1>
              </div>
              
              <div className="animate-fade-in-up animation-delay-400">
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
                  Kairo is the world's most advanced AI-powered workflow automation platform. 
                  Design, deploy, and scale intelligent automations with zero-code complexity.
                </p>
              </div>
              
              <div className="animate-fade-in-up animation-delay-600">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
                  <Button 
                    asChild 
                    size="lg" 
                    className="group text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300 ease-in-out hover:scale-105 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  >
                    <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                      {isLoggedIn ? 'Go to Dashboard' : 'Start Building Free'} 
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6 hover:bg-primary/10 border-primary/20 hover:border-primary/40 backdrop-blur-sm"
                  >
                    <Link href="/workflow">
                      <Play className="mr-2 h-5 w-5" />
                      Try Interactive Demo
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="animate-fade-in-up animation-delay-800">
                <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    15-day premium trial
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Cancel anytime
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Enterprise support
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="py-16 border-y bg-gradient-to-r from-muted/20 via-background to-muted/20">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="p-4 bg-primary/10 rounded-full inline-block mb-4 group-hover:bg-primary/20 transition-colors">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-20 lg:py-32 bg-background">
          <div className="container">
            <div className="text-center mb-20">
              <Badge variant="outline" className="mb-6">
                <Lightbulb className="w-4 h-4 mr-2" />
                Core Features
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Everything You Need for
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"> Modern Automation</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Built for developers, loved by teams. Our comprehensive platform handles everything from simple tasks to complex enterprise workflows.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-border/50 hover:border-primary/20 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-4 bg-gradient-to-r ${feature.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground leading-relaxed text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for <span className="text-primary">Performance</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Enterprise-grade platform features that scale with your business
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 p-6 bg-card rounded-lg hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Integrations Section */}
        <section className="py-20 lg:py-32 bg-background">
          <div className="container">
            <div className="text-center mb-20">
              <Badge variant="outline" className="mb-6">
                <Globe className="w-4 h-4 mr-2" />
                Integrations
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Connect with Your
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"> Favorite Tools</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Seamlessly integrate with 100+ popular services. OAuth flows, webhooks, and API connections made simple.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {integrations.map((integration, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-lg ${integration.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <integration.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{integration.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-16">
              <Button variant="outline" size="lg" className="group">
                View All 100+ Integrations
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* Enhanced Use Cases Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-br from-muted/20 via-background to-muted/20">
          <div className="container">
            <div className="text-center mb-20">
              <Badge variant="outline" className="mb-6">
                <Briefcase className="w-4 h-4 mr-2" />
                Use Cases
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Built for Every
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"> Business Need</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From marketing automation to data processing, Kairo handles all your workflow requirements with intelligent automation.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {useCases.map((useCase, index) => (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-4 bg-gradient-to-r ${useCase.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                        <useCase.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">{useCase.title}</CardTitle>
                        <CardDescription className="mt-2 text-base">{useCase.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {useCase.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section */}
        <section className="py-20 lg:py-32 bg-background">
          <div className="container">
            <div className="text-center mb-20">
              <Badge variant="outline" className="mb-6">
                <Users className="w-4 h-4 mr-2" />
                Testimonials
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Loved by Teams
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"> Worldwide</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                See why thousands of companies trust Kairo for their mission-critical automation needs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed text-base">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {testimonial.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 to-purple-600/20 blur-3xl" />
          <div className="container relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-8 bg-white/10 text-white border-white/20">
                <Award className="w-4 h-4 mr-2" />
                Ready to Transform Your Business?
              </Badge>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
                Start Your Journey with
                <span className="text-yellow-300"> Intelligent Automation</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
                Join thousands of companies already automating their workflows with Kairo. 
                Start your free trial today and experience the future of business automation.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <Button 
                  asChild 
                  size="lg" 
                  className="group text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                >
                  <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                    {isLoggedIn ? 'Go to Dashboard' : 'Start Free Trial'} 
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm"
                >
                  <Link href="/contact">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Talk to Sales
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}