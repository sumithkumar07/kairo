'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { InteractiveButton } from '@/components/ui/interactive-button';
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
  AlertCircle,
  Monitor,
  Workflow as WorkflowIcon2,
  DollarSign,
  ChevronsRight,
  ExternalLink,
  Phone,
  Calendar,
  MapPin,
  Send,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Github,
  X,
  Info,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Video,
  Download,
  Search,
  Filter,
  Heart,
  ThumbsUp
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Workflow Generation',
    description: 'Describe your automation needs in natural language. Our advanced AI, powered by Puter.js meta-llama/llama-4-maverick, will generate complete, production-ready workflows instantly.',
    badge: 'AI Enhanced',
    color: 'from-purple-500 to-pink-500',
    stats: { accuracy: '99.1%', speed: '10x faster', usage: 'Unlimited' }
  },
  {
    icon: GitFork,
    title: 'Visual Workflow Builder',
    description: 'Professional drag-and-drop interface with advanced features including snapping, alignment guides, multi-select, real-time collaboration, and version control.',
    badge: 'Pro Tools',
    color: 'from-blue-500 to-cyan-500',
    stats: { nodes: '200+', templates: '50+', collaboration: 'Real-time' }
  },
  {
    icon: Rocket,
    title: 'Enterprise-Ready Execution',
    description: 'Built for scale with intelligent error recovery, adaptive retry strategies, circuit breakers, comprehensive monitoring, and auto-scaling capabilities.',
    badge: 'Enterprise',
    color: 'from-green-500 to-emerald-500',
    stats: { uptime: '99.9%', scale: 'Auto', recovery: 'Instant' }
  },
  {
    icon: Puzzle,
    title: '100+ Premium Integrations',
    description: 'Connect with all your favorite tools: Salesforce, Slack, Shopify, Notion, Airtable, AWS, and many more. OAuth flows and webhook support included.',
    badge: 'Extensive',
    color: 'from-orange-500 to-red-500',
    stats: { integrations: '100+', apis: 'RESTful', auth: 'OAuth 2.0' }
  },
  {
    icon: Bot,
    title: 'Advanced Puter.js AI Suite',
    description: 'Leverage state-of-the-art AI models for intelligent code generation, natural language processing, multilingual translation, logical reasoning, and document analysis.',
    badge: 'Next-Gen AI',
    color: 'from-indigo-500 to-purple-500',
    stats: { models: '10+', languages: '50+', processing: 'Real-time' }
  },
  {
    icon: ShieldCheck,
    title: 'Military-Grade Security',
    description: 'SOC 2 Type II compliant with end-to-end encryption, advanced role-based access control, comprehensive audit logs, and enterprise SSO integration.',
    badge: 'Ultra Secure',
    color: 'from-teal-500 to-blue-500',
    stats: { compliance: 'SOC 2', encryption: 'AES-256', audit: '100%' }
  }
];

const stats = [
  { value: '10x', label: 'Faster Development', icon: Rocket, description: 'Build automations 10x faster than traditional methods' },
  { value: '100+', label: 'Integrations', icon: Globe, description: 'Connect with your entire tech stack seamlessly' },
  { value: '99.9%', label: 'Uptime SLA', icon: Shield, description: 'Enterprise-grade reliability guaranteed' },
  { value: '24/7', label: 'Expert Support', icon: Headphones, description: 'World-class support team always available' }
];

const integrations = [
  { name: 'Salesforce', icon: Database, color: 'bg-blue-500', category: 'CRM' },
  { name: 'Slack', icon: MessageSquare, color: 'bg-green-500', category: 'Communication' },
  { name: 'Shopify', icon: CreditCard, color: 'bg-purple-500', category: 'E-commerce' },
  { name: 'Notion', icon: FileText, color: 'bg-gray-500', category: 'Productivity' },
  { name: 'Airtable', icon: Database, color: 'bg-orange-500', category: 'Database' },
  { name: 'Twilio', icon: Smartphone, color: 'bg-red-500', category: 'Communication' },
  { name: 'AWS', icon: Cloud, color: 'bg-yellow-500', category: 'Cloud' },
  { name: 'Google Analytics', icon: BarChart3, color: 'bg-indigo-500', category: 'Analytics' },
  { name: 'Stripe', icon: CreditCard, color: 'bg-blue-600', category: 'Payments' },
  { name: 'Mailchimp', icon: Mail, color: 'bg-yellow-600', category: 'Marketing' },
  { name: 'HubSpot', icon: Building, color: 'bg-orange-600', category: 'CRM' },
  { name: 'GitHub', icon: Code, color: 'bg-gray-600', category: 'Development' },
  { name: 'Zendesk', icon: Headphones, color: 'bg-green-600', category: 'Support' },
  { name: 'Jira', icon: Activity, color: 'bg-blue-700', category: 'Project Management' },
  { name: 'Figma', icon: Palette, color: 'bg-pink-500', category: 'Design' },
  { name: 'Discord', icon: MessageSquare, color: 'bg-indigo-600', category: 'Communication' }
];

const useCases = [
  {
    title: 'Marketing Automation',
    description: 'Automate lead nurturing, email campaigns, and customer journeys with intelligent personalization and AI-driven insights.',
    icon: Target,
    features: ['AI-powered lead scoring', 'Dynamic email sequences', 'Real-time CRM sync', 'Advanced analytics tracking'],
    color: 'from-pink-500 to-rose-500',
    image: '/marketing-automation.jpg',
    roi: '300% ROI increase',
    customers: '2,500+ marketers'
  },
  {
    title: 'Sales Operations',
    description: 'Streamline sales processes, data synchronization, and deal management with smart automation and predictive analytics.',
    icon: TrendingUp,
    features: ['Intelligent deal tracking', 'Automated pipeline management', 'Smart quote generation', 'Predictive forecasting'],
    color: 'from-blue-500 to-indigo-500',
    image: '/sales-operations.jpg',
    roi: '40% faster deal closure',
    customers: '1,800+ sales teams'
  },
  {
    title: 'Customer Support',
    description: 'Automate support tickets, customer communications, and knowledge base management with AI-powered responses.',
    icon: Headphones,
    features: ['Smart ticket routing', 'AI-powered auto-responses', 'Dynamic escalation rules', 'Knowledge base automation'],
    color: 'from-green-500 to-teal-500',
    image: '/customer-support.jpg',
    roi: '60% faster resolution',
    customers: '3,200+ support teams'
  },
  {
    title: 'Data Processing',
    description: 'Transform, validate, and sync data across multiple systems with intelligent error handling and real-time processing.',
    icon: Database,
    features: ['Real-time data validation', 'Format conversion', 'Multi-system sync', 'Intelligent error recovery'],
    color: 'from-purple-500 to-violet-500',
    image: '/data-processing.jpg',
    roi: '80% reduction in errors',
    customers: '1,200+ data teams'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'VP of Operations',
    company: 'TechCorp',
    avatar: 'SJ',
    content: 'Kairo has revolutionized our workflow automation. What previously took our team weeks to implement now takes just minutes. The AI-powered generation is incredible and has saved us thousands of hours.',
    rating: 5,
    results: ['300% faster deployment', '90% cost reduction', '99.8% reliability'],
    industry: 'Technology'
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    company: 'StartupXYZ',
    avatar: 'MC',
    content: 'The most intuitive automation platform we\'ve ever used. The Puter.js AI integration understands complex business requirements and delivers production-ready workflows instantly. Game-changing technology.',
    rating: 5,
    results: ['500% ROI increase', '10x faster development', 'Zero downtime'],
    industry: 'Fintech'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Marketing Director',
    company: 'GrowthCo',
    avatar: 'ER',
    content: 'Best automation platform in the market. The integrations are seamless, the UI is beautiful, and the performance is outstanding. Our team productivity has increased by 300% since implementation.',
    rating: 5,
    results: ['300% productivity gain', '50+ integrations', '24/7 reliability'],
    industry: 'Marketing'
  }
];

const platformFeatures = [
  { icon: Cpu, title: 'High Performance', description: 'Lightning-fast execution with advanced caching', metric: '< 100ms response' },
  { icon: Shield, title: 'Enterprise Security', description: 'Bank-grade protection with SOC 2 compliance', metric: '99.99% secure' },
  { icon: RefreshCw, title: 'Auto-Scaling', description: 'Handles any workload with intelligent scaling', metric: '1M+ operations/day' },
  { icon: Eye, title: 'Real-time Monitoring', description: 'Complete visibility with advanced analytics', metric: '24/7 monitoring' },
  { icon: Gauge, title: 'Smart Analytics', description: 'Actionable insights with AI-powered recommendations', metric: '360° visibility' },
  { icon: Boxes, title: 'Modular Design', description: 'Flexible architecture for any use case', metric: '200+ modules' }
];

const companies = [
  { name: 'Microsoft', logo: '/logos/microsoft.png' },
  { name: 'Google', logo: '/logos/google.png' },
  { name: 'Amazon', logo: '/logos/amazon.png' },
  { name: 'Netflix', logo: '/logos/netflix.png' },
  { name: 'Spotify', logo: '/logos/spotify.png' },
  { name: 'Airbnb', logo: '/logos/airbnb.png' }
];

const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for individuals and small projects',
    features: [
      '5 workflows',
      '1,000 executions/month',
      'Basic integrations',
      'Community support',
      '1 GB storage'
    ],
    limitations: [
      'No AI assistant',
      'Basic templates only'
    ],
    cta: 'Get Started Free',
    popular: false
  },
  {
    name: 'Gold',
    price: 49,
    description: 'Ideal for growing teams and businesses',
    features: [
      '100 workflows',
      '50,000 executions/month',
      'All integrations',
      'AI assistant',
      'Premium templates',
      '10 GB storage',
      '10 team members',
      'Priority support'
    ],
    limitations: [],
    cta: 'Start 15-Day Trial',
    popular: true
  },
  {
    name: 'Diamond',
    price: 149,
    description: 'For enterprises needing maximum power',
    features: [
      'Unlimited workflows',
      '500,000 executions/month',
      'God-tier AI features',
      'Custom integrations',
      'Dedicated support',
      '100 GB storage',
      '50 team members',
      'SLA guarantee',
      'Custom branding'
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false
  }
];

const faqs = [
  {
    question: 'How does the AI workflow generation work?',
    answer: 'Our AI uses advanced natural language processing to understand your requirements and automatically generates complete workflow configurations. Simply describe what you want to automate in plain English, and our AI will create the nodes, connections, and logic needed.'
  },
  {
    question: 'Can I integrate with my existing tools?',
    answer: 'Yes! Kairo supports 100+ integrations including Salesforce, Slack, Shopify, AWS, and many more. We also provide webhooks and REST APIs for custom integrations.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We\'re SOC 2 Type II compliant with end-to-end encryption, advanced access controls, and comprehensive audit logs. Your data is protected with military-grade security.'
  },
  {
    question: 'What support do you provide?',
    answer: 'We offer 24/7 expert support for all paid plans, comprehensive documentation, video tutorials, and an active community forum. Enterprise customers get dedicated support channels.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. You\'ll continue to have access until the end of your billing period.'
  }
];

export default function ConsolidatedHomepage() {
  const { isLoggedIn } = useSubscription();
  const [activeTab, setActiveTab] = useState('overview');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm);
  };

  // Hero Section Component
  const HeroSection = () => (
    <section className="relative py-20 md:py-32 lg:py-40 bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse opacity-40" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse opacity-40" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse opacity-30" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      </div>
      
      <div className="container relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Enhanced Badge */}
          <div className="animate-fade-in-up mb-8">
            <Badge variant="secondary" className="px-6 py-3 text-base font-medium bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
              <Sparkles className="w-5 h-5 mr-3" />
              Powered by Advanced Puter.js AI • Trusted by 10,000+ Companies
            </Badge>
          </div>
          
          {/* Enhanced Headline */}
          <div className="animate-fade-in-up animation-delay-200 mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-tight">
              Build Workflows at the
              <span className="block bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Speed of Thought
              </span>
            </h1>
          </div>
          
          {/* Enhanced Description */}
          <div className="animate-fade-in-up animation-delay-400 mb-12">
            <p className="text-xl md:text-3xl text-muted-foreground max-w-5xl mx-auto leading-relaxed">
              The world's most advanced AI-powered workflow automation platform. 
              <br className="hidden md:block" />
              Design, deploy, and scale intelligent automations with zero-code complexity.
            </p>
          </div>
          
          {/* Enhanced CTAs */}
          <div className="animate-fade-in-up animation-delay-600 mb-16">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <InteractiveButton
                asChild
                size="lg"
                gradient="from-primary to-purple-600"
                glow
                className="text-xl px-10 py-6 shadow-2xl"
              >
                <Link href={isLoggedIn ? "/dashboard" : "/auth?tab=signup"}>
                  {isLoggedIn ? 'Go to Dashboard' : 'Start Building Free'}
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </InteractiveButton>
              
              <InteractiveButton
                asChild
                variant="outline"
                size="lg"
                icon={Play}
                iconPosition="left"
                className="text-xl px-10 py-6 hover:bg-primary/10 border-2 border-primary/20 hover:border-primary/40 backdrop-blur-sm"
              >
                <Link href="/editor">
                  Try Interactive Demo
                </Link>
              </InteractiveButton>
            </div>
          </div>
          
          {/* Enhanced Trust Indicators */}
          <div className="animate-fade-in-up animation-delay-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                <span className="text-sm font-medium">15-day premium trial</span>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                <span className="text-sm font-medium">No credit card required</span>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                <span className="text-sm font-medium">Cancel anytime</span>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                <span className="text-sm font-medium">24/7 enterprise support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Pricing Section Component
  const PricingSection = () => (
    <div className="space-y-12">
      <div className="text-center">
        <Badge variant="outline" className="mb-6">
          <DollarSign className="w-4 h-4 mr-2" />
          Pricing Plans
        </Badge>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8">
          Choose Your
          <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Perfect Plan
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Start free and scale as you grow. All plans include our core features with no hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <Card key={index} className={cn(
            "relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2",
            plan.popular && "border-primary/50 ring-2 ring-primary/20 scale-105"
          )}>
            {plan.popular && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-purple-600 text-white text-center py-2 text-sm font-medium">
                Most Popular
              </div>
            )}
            
            <CardHeader className={cn("text-center", plan.popular && "pt-12")}>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <div className="py-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="text-base">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.limitations.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-center gap-3">
                      <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                className={cn(
                  "w-full mt-6",
                  plan.popular && "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                )}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-muted-foreground mb-6">Need a custom solution for your enterprise?</p>
        <Button variant="outline" size="lg">
          <Building className="h-4 w-4 mr-2" />
          Contact Enterprise Sales
        </Button>
      </div>
    </div>
  );

  // Contact Section Component
  const ContactSection = () => (
    <div className="space-y-12">
      <div className="text-center">
        <Badge variant="outline" className="mb-6">
          <MessageSquare className="w-4 h-4 mr-2" />
          Get in Touch
        </Badge>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8">
          Ready to Get
          <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Started?
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Have questions? Need a demo? Want to discuss enterprise solutions? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Send us a message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={contactForm.company}
                  onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                Talk to Sales
              </CardTitle>
              <CardDescription>
                Speak with our sales team to find the perfect solution for your needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+1 (555) 123-KAIRO</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>sales@kairo.ai</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Mon-Fri 9AM-6PM PST</span>
                </div>
              </div>
              <Button className="w-full mt-6" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule a Demo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Support Center
              </CardTitle>
              <CardDescription>
                Get instant help with our comprehensive documentation and resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Video className="h-4 w-4 mr-2" />
                  Video Tutorials
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Community Forum
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  API Documentation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Visit Our Office
              </CardTitle>
              <CardDescription>
                Come visit us at our San Francisco headquarters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">Kairo Technologies</p>
                <p className="text-sm text-muted-foreground">
                  123 Innovation Drive<br />
                  San Francisco, CA 94107<br />
                  United States
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Enterprise Section Component
  const EnterpriseSection = () => (
    <div className="space-y-12">
      <div className="text-center">
        <Badge variant="outline" className="mb-6">
          <Building className="w-4 h-4 mr-2" />
          Enterprise Solutions
        </Badge>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8">
          Built for
          <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Enterprise Scale
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Secure, scalable, and compliant automation solutions for the world's largest organizations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <Shield className="h-12 w-12 text-blue-600 mb-4" />
            <CardTitle>Enterprise Security</CardTitle>
            <CardDescription>
              SOC 2 Type II, GDPR, HIPAA compliant with advanced security controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                End-to-end encryption
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                SSO integration
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Advanced audit logs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Role-based access control
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <Rocket className="h-12 w-12 text-green-600 mb-4" />
            <CardTitle>Unlimited Scale</CardTitle>
            <CardDescription>
              Handle millions of executions with enterprise-grade infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Auto-scaling infrastructure
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                99.99% uptime SLA
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Global edge deployment
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Dedicated support team
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
          <CardHeader>
            <Wrench className="h-12 w-12 text-purple-600 mb-4" />
            <CardTitle>Custom Solutions</CardTitle>
            <CardDescription>
              Tailored integrations and workflows for your specific needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Custom integrations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                White-label solutions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                On-premise deployment
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Professional services
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600">
          <Building className="h-4 w-4 mr-2" />
          Schedule Enterprise Demo
        </Button>
      </div>
    </div>
  );

  // FAQ Section Component
  const FAQSection = () => (
    <div className="space-y-12">
      <div className="text-center">
        <Badge variant="outline" className="mb-6">
          <HelpCircle className="w-4 h-4 mr-2" />
          Frequently Asked Questions
        </Badge>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8">
          Got
          <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Questions?
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Find answers to the most common questions about Kairo's features, pricing, and implementation.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-muted-foreground mb-6">Still have questions?</p>
        <Button variant="outline" size="lg">
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact Support
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero Section - Always visible */}
        <HeroSection />

        {/* Trusted By Companies Section */}
        <section className="py-16 border-y bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <p className="text-lg font-semibold text-muted-foreground mb-8">
                Trusted by industry leaders worldwide
              </p>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-60">
                {companies.map((company, index) => (
                  <div key={index} className="flex items-center justify-center">
                    <div className="text-2xl font-bold text-muted-foreground/80">
                      {company.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 border-border/50">
                  <CardContent className="p-6">
                    <div className="p-4 bg-primary/10 rounded-full inline-block mb-4 group-hover:bg-primary/20 transition-colors">
                      <stat.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-2">{stat.label}</div>
                    <div className="text-xs text-muted-foreground">{stat.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Consolidated Content Tabs */}
        <section className="py-24 lg:py-32 bg-background">
          <div className="container">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
              <div className="text-center">
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 max-w-4xl mx-auto">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Features</span>
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">Pricing</span>
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Contact</span>
                  </TabsTrigger>
                  <TabsTrigger value="enterprise" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span className="hidden sm:inline">Enterprise</span>
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">FAQ</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Features Overview Tab */}
              <TabsContent value="overview" className="space-y-24">
                {/* Enhanced Features Section */}
                <div className="space-y-20">
                  <div className="text-center">
                    <Badge variant="outline" className="mb-6">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Core Features
                    </Badge>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8">
                      Everything You Need for
                      <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Modern Automation
                      </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                      Built for developers, loved by teams. Our comprehensive platform handles everything from simple tasks to complex enterprise workflows with AI-powered intelligence.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                      <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-border/50 hover:border-primary/20 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full -translate-y-16 translate-x-16`} />
                        
                        <CardHeader className="pb-6 relative">
                          <div className="flex items-center justify-between mb-6">
                            <div className={`p-4 bg-gradient-to-r ${feature.color} rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                              <feature.icon className="h-8 w-8 text-white" />
                            </div>
                            <Badge variant="secondary" className="text-xs font-medium bg-gradient-to-r from-primary/10 to-purple-500/10">
                              {feature.badge}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl font-bold mb-3">{feature.title}</CardTitle>
                          <CardDescription className="text-muted-foreground leading-relaxed text-base">
                            {feature.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                            {Object.entries(feature.stats).map(([key, value]) => (
                              <div key={key} className="text-center">
                                <div className="text-sm font-bold text-foreground">{value}</div>
                                <div className="text-xs text-muted-foreground capitalize">{key}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Enhanced Platform Features */}
                <div className="py-20 bg-muted/30 rounded-3xl">
                  <div className="container">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Built for <span className="text-primary">Performance</span>
                      </h2>
                      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Enterprise-grade platform features that scale with your business needs
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {platformFeatures.map((feature, index) => (
                        <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <feature.icon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold mb-1">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                              </div>
                            </div>
                            <div className="text-center p-3 bg-primary/5 rounded-lg">
                              <Badge variant="outline" className="text-primary font-medium">
                                {feature.metric}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Integrations Section */}
                <div className="space-y-20">
                  <div className="text-center">
                    <Badge variant="outline" className="mb-6">
                      <Globe className="w-4 h-4 mr-2" />
                      Integrations
                    </Badge>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8">
                      Connect with Your
                      <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Favorite Tools
                      </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                      Seamlessly integrate with 100+ popular services. OAuth flows, webhooks, and API connections made simple with enterprise-grade security.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-16">
                    {integrations.map((integration, index) => (
                      <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6 text-center">
                          <div className={`w-12 h-12 rounded-lg ${integration.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                            <integration.icon className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1">{integration.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {integration.category}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <InteractiveButton 
                      variant="outline" 
                      size="lg" 
                      icon={ChevronRight}
                      iconPosition="right"
                      className="group border-2 hover:shadow-lg"
                    >
                      View All 100+ Integrations
                    </InteractiveButton>
                  </div>
                </div>

                {/* Enhanced Use Cases Section */}
                <div className="py-20 bg-gradient-to-br from-muted/20 via-background to-muted/20 rounded-3xl">
                  <div className="container">
                    <div className="text-center mb-20">
                      <Badge variant="outline" className="mb-6">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Use Cases
                      </Badge>
                      <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8">
                        Built for Every
                        <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                          Business Need
                        </span>
                      </h2>
                      <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                        From marketing automation to data processing, Kairo handles all your workflow requirements with intelligent automation and measurable results.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {useCases.map((useCase, index) => (
                        <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm overflow-hidden">
                          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${useCase.color} opacity-10 rounded-full -translate-y-16 translate-x-16`} />
                          
                          <CardHeader className="pb-6 relative">
                            <div className="flex items-center gap-4 mb-6">
                              <div className={`p-4 bg-gradient-to-r ${useCase.color} rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                <useCase.icon className="h-8 w-8 text-white" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-xl font-bold mb-2">{useCase.title}</CardTitle>
                                <CardDescription className="text-base leading-relaxed">{useCase.description}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-3">
                              {useCase.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-center gap-3 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  <span className="text-muted-foreground">{feature}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                              <div className="text-center">
                                <div className="text-sm font-bold text-primary">{useCase.roi}</div>
                                <div className="text-xs text-muted-foreground">Average ROI</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-bold text-foreground">{useCase.customers}</div>
                                <div className="text-xs text-muted-foreground">Active Users</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Testimonials Section */}
                <div className="space-y-20">
                  <div className="text-center">
                    <Badge variant="outline" className="mb-6">
                      <Users className="w-4 h-4 mr-2" />
                      Testimonials
                    </Badge>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8">
                      Loved by Teams
                      <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Worldwide
                      </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                      See why thousands of companies trust Kairo for their mission-critical automation needs with measurable business impact.
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
                          
                          <p className="text-muted-foreground mb-6 leading-relaxed text-base italic">
                            "{testimonial.content}"
                          </p>
                          
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-white">
                                  {testimonial.avatar}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{testimonial.name}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.company} • {testimonial.industry}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2">
                              {testimonial.results.map((result, resultIndex) => (
                                <div key={resultIndex} className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span className="text-xs text-muted-foreground">{result}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-6">
                <PricingSection />
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-6">
                <ContactSection />
              </TabsContent>

              {/* Enterprise Tab */}
              <TabsContent value="enterprise" className="space-y-6">
                <EnterpriseSection />
              </TabsContent>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="space-y-6">
                <FAQSection />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-24 lg:py-32 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          </div>
          
          <div className="container relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              <Badge variant="secondary" className="mb-8 bg-white/10 text-white border-white/20 px-6 py-3">
                <Award className="w-5 h-5 mr-2" />
                Ready to Transform Your Business?
              </Badge>
              
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                Start Your Journey with
                <span className="block text-yellow-300">Intelligent Automation</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
                Join thousands of companies already automating their workflows with Kairo. 
                Start your free trial today and experience the future of business automation.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12">
                <InteractiveButton
                  asChild
                  size="lg"
                  className="text-xl px-10 py-6 bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-3xl font-semibold"
                >
                  <Link href={isLoggedIn ? "/dashboard" : "/auth?tab=signup"}>
                    {isLoggedIn ? 'Go to Dashboard' : 'Start Free Trial'}
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Link>
                </InteractiveButton>
                
                <InteractiveButton
                  asChild
                  variant="outline"
                  size="lg"
                  icon={MessageSquare}
                  iconPosition="left"
                  className="text-xl px-10 py-6 border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm"
                  onClick={() => setActiveTab('contact')}
                >
                  <button>
                    Talk to Sales
                  </button>
                </InteractiveButton>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center opacity-90">
                <div>
                  <div className="text-2xl font-bold">10,000+</div>
                  <div className="text-sm text-white/80">Companies Trust Us</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-sm text-white/80">Uptime Guaranteed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-white/80">Expert Support</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">15 Days</div>
                  <div className="text-sm text-white/80">Free Trial</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}