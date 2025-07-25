'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  BookOpen, 
  Play, 
  Code, 
  MessageCircle, 
  ArrowRight, 
  Zap,
  FileText,
  Video,
  Users,
  Bot,
  Workflow,
  Settings,
  ShieldCheck,
  Target,
  Globe,
  Sparkles,
  CheckCircle,
  Mail,
  Database
} from 'lucide-react';

const categories = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of workflow automation',
    icon: Play,
    articles: [
      'Creating Your First Workflow',
      'Understanding Triggers and Actions', 
      'Connecting Your Apps',
      'Testing Your Automations'
    ]
  },
  {
    title: 'Workflow Builder',
    description: 'Master the visual workflow editor',
    icon: Workflow,
    articles: [
      'Using the Drag-and-Drop Editor',
      'Advanced Node Configuration',
      'Conditional Logic and Branching',
      'Error Handling Best Practices'
    ]
  },
  {
    title: 'AI Features',
    description: 'Leverage AI-powered automation',
    icon: Bot,
    articles: [
      'AI Workflow Generation',
      'Smart Data Processing',
      'Natural Language Commands',
      'AI Agent Configuration'
    ]
  },
  {
    title: 'Integrations',
    description: 'Connect with your favorite apps',
    icon: Settings,
    articles: [
      'Popular App Integrations',
      'OAuth Setup and Security',
      'Custom API Connections',
      'Webhook Configuration'
    ]
  },
  {
    title: 'API Documentation',
    description: 'Build with our powerful APIs',
    icon: Code,
    articles: [
      'REST API Reference',
      'Authentication Methods',
      'Webhook Endpoints',
      'SDK and Libraries'
    ]
  },
  {
    title: 'Security & Compliance',
    description: 'Keep your data safe and compliant',
    icon: ShieldCheck,
    articles: [
      'Data Encryption Standards',
      'GDPR Compliance Guide',
      'Enterprise Security Features',
      'Audit Logs and Monitoring'
    ]
  }
];

const popularArticles = [
  {
    title: 'How to Create Your First Automation',
    description: 'Step-by-step guide to building your first workflow',
    readTime: '5 min read',
    category: 'Getting Started'
  },
  {
    title: 'Connecting Slack and Google Sheets',
    description: 'Automate data entry between your favorite apps',
    readTime: '8 min read', 
    category: 'Integrations'
  },
  {
    title: 'Using AI to Generate Workflows',
    description: 'Let AI build automations from natural language',
    readTime: '6 min read',
    category: 'AI Features'
  },
  {
    title: 'Troubleshooting Common Issues',
    description: 'Solve the most frequent automation problems',
    readTime: '10 min read',
    category: 'Troubleshooting'
  }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Kairo</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/pricing" className="hover:text-primary">Pricing</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/login" className="hover:text-primary">Log In</Link>
            <Button asChild size="sm">
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            How can we help you?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers, learn best practices, and get the most out of Kairo automation
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search for help articles, guides, and tutorials..."
              className="pl-12 py-6 text-lg"
            />
          </div>
        </div>
      </section>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Help Center</TabsTrigger>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Popular Articles */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8">Popular Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularArticles.map((article, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <Badge variant="secondary" className="w-fit mb-2">
                        {article.category}
                      </Badge>
                      <CardTitle className="text-lg leading-tight">
                        {article.title}
                      </CardTitle>
                      <CardDescription>
                        {article.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{article.readTime}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((category, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <category.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{category.title}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.articles.map((article, articleIndex) => (
                          <li key={articleIndex}>
                            <Link 
                              href="#" 
                              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 py-1"
                            >
                              <FileText className="h-3 w-3" />
                              {article}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Button variant="ghost" className="mt-4 p-0 h-auto">
                        View all articles
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-muted/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-center mb-12">Need More Help?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="text-center">
                  <CardHeader>
                    <Video className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle>Video Tutorials</CardTitle>
                    <CardDescription>
                      Watch step-by-step video guides and walkthroughs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/tutorials">Watch Tutorials</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle>Community Forum</CardTitle>
                    <CardDescription>
                      Connect with other users and share best practices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/community">Join Community</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>
                      Get personalized help from our support team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href="/contact">Contact Us</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="getting-started" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Getting Started Guide</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Complete guide to building powerful workflows, connecting integrations, and scaling your automation
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Your First Workflow</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4">
                    Create a simple automation in under 5 minutes with our step-by-step guide
                  </CardDescription>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/workflow">
                      Start Building
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Connect Your Apps</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4">
                    Integrate with your favorite tools and services using OAuth 2.0 authentication
                  </CardDescription>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/integrations">
                      Browse Integrations
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">AI-Powered Generation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4">
                    Let AI build workflows from natural language descriptions instantly
                  </CardDescription>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/ai-studio">
                      Try AI Studio
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quick-start" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">3-Minute Quick Start</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Build, test, and deploy your first automation in under 3 minutes
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Interactive Quick Start</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-6">
                    Follow our interactive guide to create your first workflow with real-time feedback and achievements
                  </CardDescription>
                  <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Choose a workflow template
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Configure triggers and actions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Test with sample data
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Deploy to production
                    </li>
                  </ul>
                  <Button asChild className="w-full">
                    <Link href="/workflow">
                      Start Quick Tutorial
                      <Play className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <Workflow className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Popular Templates</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-6">
                    Start with proven workflow templates that solve common automation challenges
                  </CardDescription>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Welcome Email Automation</p>
                        <p className="text-xs text-muted-foreground">Send personalized welcome emails</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Slack Notification Bot</p>
                        <p className="text-xs text-muted-foreground">Get notified of important events</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Database className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Data Sync Workflow</p>
                        <p className="text-xs text-muted-foreground">Keep your systems in sync</p>
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/templates">
                      Browse Templates
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guides" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Detailed Guides</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                In-depth tutorials and best practices for advanced automation
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Code className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Advanced Workflows</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Learn to build complex workflows with conditional logic, loops, and error handling
                  </CardDescription>
                  <Button variant="outline" size="sm" className="w-full">
                    Read Guide
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Security Best Practices</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Secure your automations with proper authentication and data protection
                  </CardDescription>
                  <Button variant="outline" size="sm" className="w-full">
                    Read Guide
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">Performance Optimization</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Optimize your workflows for speed, efficiency, and scalability
                  </CardDescription>
                  <Button variant="outline" size="sm" className="w-full">
                    Read Guide
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold">Kairo</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary">Privacy</Link>
              <Link href="/terms" className="hover:text-primary">Terms</Link>
              <Link href="/contact" className="hover:text-primary">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}