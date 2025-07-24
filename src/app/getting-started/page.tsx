'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  CheckCircle, 
  Play,
  Copy,
  ExternalLink,
  BookOpen,
  Workflow, 
  Cpu, 
  Zap,
  Target,
  Rocket,
  Globe,
  Crown,
  Sparkles,
  Timer,
  Users,
  Settings,
  Database,
  MessageSquare,
  Mail,
  ShoppingCart,
  BarChart3,
  Calendar,
  FileText,
  Code,
  Lightbulb,
  Star,
  TrendingUp,
  Shield,
  Clock,
  Activity
} from 'lucide-react';

const sampleWorkflows = [
  {
    id: 1,
    title: 'Lead Nurturing Automation',
    description: 'Automatically nurture leads from form submission to qualified opportunity',
    category: 'Marketing',
    icon: Target,
    color: 'from-pink-500 to-rose-500',
    difficulty: 'Beginner',
    duration: '5 minutes',
    triggers: ['Form Submission', 'Email Open'],
    actions: ['Send Email', 'Update CRM', 'Assign Sales Rep'],
    integrations: ['HubSpot', 'Mailchimp', 'Salesforce'],
    code: `{
  "name": "Lead Nurturing Flow",
  "trigger": "form_submission",
  "steps": [
    {
      "action": "send_welcome_email",
      "template": "welcome_series_1"
    },
    {
      "action": "create_crm_contact",
      "service": "salesforce"
    },
    {
      "action": "schedule_followup",
      "delay": "3_days"
    }
  ]
}`
  },
  {
    id: 2,
    title: 'Customer Support Automation',
    description: 'Route support tickets, auto-respond, and escalate based on priority',
    category: 'Support',
    icon: MessageSquare,
    color: 'from-blue-500 to-indigo-500',
    difficulty: 'Intermediate',
    duration: '8 minutes',
    triggers: ['New Ticket', 'Priority Change'],
    actions: ['Auto-Reply', 'Route Ticket', 'Escalate'],
    integrations: ['Zendesk', 'Slack', 'Jira'],
    code: `{
  "name": "Support Ticket Router",
  "trigger": "new_ticket",
  "conditions": [
    {
      "if": "priority == 'high'",
      "then": "escalate_immediately"
    },
    {
      "if": "category == 'billing'",
      "then": "route_to_billing_team"
    }
  ]
}`
  },
  {
    id: 3,
    title: 'E-commerce Order Processing',
    description: 'Process orders, update inventory, send confirmations, and track shipping',
    category: 'E-commerce',
    icon: ShoppingCart,
    color: 'from-green-500 to-emerald-500',
    difficulty: 'Advanced',
    duration: '12 minutes',
    triggers: ['New Order', 'Payment Confirmed'],
    actions: ['Update Inventory', 'Send Confirmation', 'Create Shipment'],
    integrations: ['Shopify', 'Stripe', 'ShipStation'],
    code: `{
  "name": "Order Processing Pipeline",
  "trigger": "new_order",
  "parallel_steps": [
    {
      "action": "update_inventory",
      "service": "shopify"
    },
    {
      "action": "send_confirmation_email",
      "template": "order_confirmation"
    },
    {
      "action": "create_shipping_label",
      "service": "shipstation"
    }
  ]
}`
  }
];

const quickStartGuides = [
  {
    title: 'Your First Workflow',
    description: 'Create a simple automation in under 5 minutes',
    duration: '5 min',
    icon: Rocket,
    steps: [
      'Choose a trigger (email, webhook, schedule)',
      'Add your first action (send email, update database)',
      'Test the workflow with sample data',
      'Deploy and monitor'
    ]
  },
  {
    title: 'Connect Your Apps',
    description: 'Integrate with your favorite tools and services',
    duration: '8 min',
    icon: Globe,
    steps: [
      'Browse the integration marketplace',
      'Authenticate with OAuth 2.0',
      'Configure data mapping',
      'Test the connection'
    ]
  },
  {
    title: 'AI-Powered Generation',
    description: 'Let AI build workflows from natural language',
    duration: '3 min',
    icon: Sparkles,
    steps: [
      'Describe your automation needs',
      'Review AI-generated workflow',
      'Customize if needed',
      'Deploy and activate'
    ]
  }
];

const bestPractices = [
  {
    title: 'Start Simple',
    description: 'Begin with basic workflows before adding complexity',
    icon: Target,
    tips: [
      'Use single triggers and actions initially',
      'Test thoroughly in development mode',
      'Add error handling gradually',
      'Monitor performance closely'
    ]
  },
  {
    title: 'Design for Scale',
    description: 'Build workflows that can handle growing business needs',
    icon: TrendingUp,
    tips: [
      'Use parallel processing where possible',
      'Implement proper error recovery',
      'Set up monitoring and alerts',
      'Plan for rate limiting'
    ]
  },
  {
    title: 'Security First',
    description: 'Protect sensitive data and maintain compliance',
    icon: Shield,
    tips: [
      'Use encrypted connections always',
      'Implement proper access controls',
      'Regular security audits',
      'Keep credentials secure'
    ]
  }
];

function GettingStartedPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <BookOpen className="w-4 h-4 mr-2" />
            Getting Started Guide
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Master <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Kairo</span> in Minutes
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete guide to building powerful workflows, connecting integrations, and scaling your automation
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflows">Sample Workflows</TabsTrigger>
            <TabsTrigger value="guides">Quick Guides</TabsTrigger>
            <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-12">
            {/* Platform Overview */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">
                  Welcome to the Future of Automation
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Kairo combines AI-powered workflow generation, visual building tools, and enterprise-grade integrations 
                  to help you automate any business process in minutes.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">10x</div>
                    <div className="text-sm text-muted-foreground">Faster Development</div>
                  </div>
                  <div className="p-4 bg-green-500/5 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">100+</div>
                    <div className="text-sm text-muted-foreground">Integrations</div>
                  </div>
                  <div className="p-4 bg-blue-500/5 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime SLA</div>
                  </div>
                  <div className="p-4 bg-purple-500/5 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">24/7</div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                </div>
              </div>
              <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-card to-card/50">
                <div className="aspect-video bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center space-x-4">
                      <div className="p-4 bg-gradient-to-r from-primary to-blue-500 rounded-full shadow-lg animate-pulse">
                        <Workflow className="h-8 w-8 text-white" />
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg animate-pulse animation-delay-200">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg animate-pulse animation-delay-400">
                        <Crown className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">AI-Powered Automation Platform</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                      <Cpu className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">AI Generation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4">
                    Describe your automation needs in natural language and watch our AI create production-ready workflows instantly.
                  </CardDescription>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/ai-studio">
                      Try AI Studio
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <Workflow className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Visual Builder</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4">
                    Professional drag-and-drop interface with advanced features, real-time collaboration, and version control.
                  </CardDescription>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/workflow">
                      Open Builder
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Integrations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4">
                    Connect with 100+ popular services including Salesforce, Slack, Shopify, and more with OAuth flows.
                  </CardDescription>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/integrations">
                      Browse All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sample Workflows Tab */}
          <TabsContent value="workflows" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready-to-Use Workflow Templates
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start with these proven workflow templates and customize them for your specific needs
              </p>
            </div>

            <div className="space-y-8">
              {sampleWorkflows.map((workflow) => (
                <Card key={workflow.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="grid lg:grid-cols-2">
                    <CardHeader className="pb-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 bg-gradient-to-r ${workflow.color} rounded-xl shadow-lg`}>
                            <workflow.icon className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl mb-2">{workflow.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <Badge variant="outline">{workflow.category}</Badge>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {workflow.duration}
                              </div>
                              <div className="flex items-center gap-1">
                                <Activity className="h-4 w-4" />
                                {workflow.difficulty}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <CardDescription className="text-base leading-relaxed mb-6">
                        {workflow.description}
                      </CardDescription>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Triggers:</h4>
                          <div className="flex flex-wrap gap-2">
                            {workflow.triggers.map((trigger) => (
                              <Badge key={trigger} variant="secondary" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Actions:</h4>
                          <div className="flex flex-wrap gap-2">
                            {workflow.actions.map((action) => (
                              <Badge key={action} variant="outline" className="text-xs">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Integrations:</h4>
                          <div className="flex flex-wrap gap-2">
                            {workflow.integrations.map((integration) => (
                              <Badge key={integration} variant="default" className="text-xs">
                                {integration}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button size="sm" className="group">
                          <Play className="mr-2 h-4 w-4" />
                          Use Template
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="bg-muted/20 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-sm">Workflow Configuration</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(workflow.code, workflow.id.toString())}
                          className="h-8 px-3"
                        >
                          {copiedCode === workflow.id.toString() ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="text-xs bg-background p-4 rounded-lg overflow-x-auto border">
                        <code className="text-muted-foreground">{workflow.code}</code>
                      </pre>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center pt-8">
              <Button asChild size="lg" className="group">
                <Link href="/workflow">
                  Create Custom Workflow
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Quick Guides Tab */}
          <TabsContent value="guides" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Step-by-Step Quick Start Guides
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get up and running quickly with these focused tutorials
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {quickStartGuides.map((guide, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <guide.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{guide.title}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Timer className="h-4 w-4" />
                          {guide.duration}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed mb-6">
                      {guide.description}
                    </CardDescription>
                    
                    <div className="space-y-3 mb-6">
                      {guide.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-xs font-bold text-primary">{stepIndex + 1}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{step}</span>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" size="sm" className="w-full group">
                      Start Guide
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center pt-8">
              <Button asChild size="lg" variant="outline" className="group">
                <Link href="/quick-start">
                  3-Minute Quick Start
                  <Timer className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Best Practices Tab */}
          <TabsContent value="best-practices" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Best Practices & Pro Tips
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Learn from experts and build workflows that scale with your business
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {bestPractices.map((practice, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg">
                        <practice.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{practice.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {practice.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {practice.tips.map((tip, tipIndex) => (
                        <div key={tipIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Resources */}
            <div className="mt-16 pt-12 border-t">
              <h3 className="text-2xl font-bold text-center mb-8">Additional Resources</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <BookOpen className="h-6 w-6 text-blue-500" />
                      </div>
                      <CardTitle className="text-lg">Documentation</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      Complete API documentation, guides, and technical references
                    </CardDescription>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/docs">
                        View Documentation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500/10 rounded-lg">
                        <Users className="h-6 w-6 text-purple-500" />
                      </div>
                      <CardTitle className="text-lg">Community</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      Join our community for discussions, tips, and support
                    </CardDescription>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/community">
                        Join Community
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(GettingStartedPage);