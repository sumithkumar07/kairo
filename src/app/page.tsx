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
  GaugeCircle, 
  Puzzle, 
  Brain, 
  Cpu, 
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
  Layers,
  Bot,
  MessageSquare,
  Mail,
  Smartphone,
  CreditCard,
  BarChart3,
  FileText,
  Filter,
  Repeat,
  GitBranch,
  Timer,
  Network,
  Eye,
  Lightbulb,
  Briefcase,
  Building,
  Headphones
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Workflow Generation',
    description: 'Describe your automation needs in plain text. Our advanced AI, powered by Mistral AI, will generate complete, production-ready workflows instantly.',
    badge: 'AI Enhanced'
  },
  {
    icon: GitFork,
    title: 'Visual Workflow Builder',
    description: 'Drag-and-drop interface with professional-grade features including snapping, alignment guides, multi-select, and real-time collaboration.',
    badge: 'Pro Tools'
  },
  {
    icon: Rocket,
    title: 'Production-Ready Execution',
    description: 'Built for scale with error recovery, retry strategies, circuit breakers, and comprehensive monitoring. Deploy with confidence.',
    badge: 'Enterprise'
  },
  {
    icon: Puzzle,
    title: '100+ Integrations',
    description: 'Connect with all your favorite tools: Salesforce, Slack, Shopify, Notion, Airtable, AWS, and many more. OAuth flows included.',
    badge: 'Extensive'
  },
  {
    icon: Bot,
    title: 'Mistral AI Integration',
    description: 'Leverage cutting-edge AI models for code generation, text analysis, translation, reasoning, and document summarization.',
    badge: 'Advanced AI'
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with end-to-end encryption, role-based access control, audit logs, and SSO integration.',
    badge: 'Secure'
  }
];

const stats = [
  { value: '10x', label: 'Faster Development' },
  { value: '100+', label: 'Integrations' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' }
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
  { name: 'GitHub', icon: Code, color: 'bg-gray-600' }
];

const useCases = [
  {
    title: 'Marketing Automation',
    description: 'Automate lead nurturing, email campaigns, and customer journeys',
    icon: Target,
    features: ['Lead scoring', 'Email sequences', 'CRM sync', 'Analytics tracking']
  },
  {
    title: 'Sales Operations',
    description: 'Streamline sales processes and data synchronization',
    icon: TrendingUp,
    features: ['Deal tracking', 'Pipeline management', 'Quote generation', 'Reporting']
  },
  {
    title: 'Customer Support',
    description: 'Automate support tickets and customer communications',
    icon: Headphones,
    features: ['Ticket routing', 'Auto-responses', 'Escalation rules', 'Knowledge base']
  },
  {
    title: 'Data Processing',
    description: 'Transform and sync data across multiple systems',
    icon: Database,
    features: ['Data validation', 'Format conversion', 'Real-time sync', 'Error handling']
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'VP of Operations',
    company: 'TechCorp',
    content: 'Kairo has transformed our workflow automation. What used to take weeks now takes minutes.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    company: 'StartupXYZ',
    content: 'The AI-powered workflow generation is incredible. It understands complex requirements instantly.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Marketing Director',
    company: 'GrowthCo',
    content: 'Best automation platform we\'ve used. The integrations are seamless and the UI is beautiful.',
    rating: 5
  }
];

export default function HomePage() {
  const { isLoggedIn } = useSubscription();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
          
          <div className="container relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-6">
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by Mistral AI
              </Badge>
              
              <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-foreground mb-6">
                Build Workflows at the
                <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  {' '}Speed of Thought
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Kairo is the most advanced AI-powered workflow automation platform. 
                Design, deploy, and scale intelligent automations with zero-code complexity.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
                <Button 
                  asChild 
                  size="lg" 
                  className="group text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
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
                  className="text-lg px-8 py-6 hover:bg-primary/10 border-primary/20 hover:border-primary/40"
                >
                  <Link href="/workflow">
                    <Play className="mr-2 h-5 w-5" />
                    Try Demo
                  </Link>
                </Button>
              </div>
              
              <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  15-day free trial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y bg-muted/20">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Lightbulb className="w-3 h-3 mr-1" />
                Core Features
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Everything You Need for
                <span className="text-primary"> Modern Automation</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Built for developers, loved by teams. Our comprehensive platform handles everything from simple tasks to complex enterprise workflows.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-20 bg-muted/20">
          <div className="container">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Globe className="w-3 h-3 mr-1" />
                Integrations
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Connect with Your
                <span className="text-primary"> Favorite Tools</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Seamlessly integrate with 100+ popular services. OAuth flows, webhooks, and API connections made simple.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {integrations.map((integration, index) => (
                <Card key={index} className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-background/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-lg ${integration.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <integration.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{integration.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="group">
                View All Integrations
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Briefcase className="w-3 h-3 mr-1" />
                Use Cases
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Built for Every
                <span className="text-primary"> Business Need</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                From marketing automation to data processing, Kairo handles all your workflow requirements.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {useCases.map((useCase, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <useCase.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold">{useCase.title}</CardTitle>
                        <CardDescription className="mt-1">{useCase.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {useCase.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2 text-sm">
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

        {/* Testimonials Section */}
        <section className="py-20 bg-muted/20">
          <div className="container">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Users className="w-3 h-3 mr-1" />
                Testimonials
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Loved by Teams
                <span className="text-primary"> Worldwide</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                See why thousands of companies trust Kairo for their automation needs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-purple-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="container relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20">
                <Award className="w-3 h-3 mr-1" />
                Ready to Get Started?
              </Badge>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Transform Your Business with
                <span className="text-yellow-300"> Intelligent Automation</span>
              </h2>
              
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join thousands of companies already automating their workflows with Kairo. 
                Start your free trial today and see the difference AI can make.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="group text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
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
                  className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10 hover:border-white/40"
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