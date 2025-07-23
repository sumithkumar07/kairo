'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  ShieldCheck
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

      {/* Popular Articles */}
      <section className="py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Popular Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
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
      </section>

      {/* Categories */}
      <section className="py-8 px-4">
        <div className="container max-w-6xl mx-auto">
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
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container max-w-4xl mx-auto">
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
                <Button variant="outline" className="w-full">
                  Watch Tutorials
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
                <Button variant="outline" className="w-full">
                  Join Community
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
                <Button className="w-full" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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