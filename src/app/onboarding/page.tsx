'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  User, 
  Workflow, 
  Cpu, 
  Zap,
  Play,
  Target,
  Rocket,
  Globe,
  Crown,
  Sparkles,
  Gift,
  Timer,
  BookOpen,
  Users,
  Settings
} from 'lucide-react';

const onboardingSteps = [
  {
    id: 1,
    title: 'Welcome to Kairo',
    subtitle: 'Your AI-Powered Workflow Automation Journey Begins',
    description: 'Discover how Kairo can transform your business processes with intelligent automation, seamless integrations, and enterprise-grade security.',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    features: [
      'AI-powered workflow generation',
      'Visual drag-and-drop builder',
      '100+ premium integrations',
      'Enterprise-grade security'
    ],
    cta: 'Let\'s Get Started',
    image: '/api/placeholder/600/400'
  },
  {
    id: 2,
    title: 'Create Your First Workflow',
    subtitle: 'Build Your Automation in Minutes, Not Hours',
    description: 'Use our AI assistant to generate workflows from natural language descriptions, or start with our visual builder for complete customization.',
    icon: Workflow,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Natural language workflow generation',
      'Professional drag-and-drop interface',
      'Real-time collaboration',
      'Version control & rollback'
    ],
    cta: 'Build First Workflow',
    actionUrl: '/workflow',
    image: '/api/placeholder/600/400'
  },
  {
    id: 3,
    title: 'Connect Your Tools',
    subtitle: 'Seamless Integration with Your Favorite Apps',
    description: 'Connect Kairo with your existing tools and services. OAuth flows, webhooks, and API connections made simple.',
    icon: Globe,
    color: 'from-green-500 to-emerald-500',
    features: [
      'Salesforce, Slack, Shopify, Notion',
      'OAuth 2.0 authentication',
      'Webhook support',
      'Real-time data sync'
    ],
    cta: 'Browse Integrations',
    actionUrl: '/integrations',
    image: '/api/placeholder/600/400'  
  },
  {
    id: 4,
    title: 'Explore God-Tier Features',
    subtitle: 'Unlock Advanced AI & Quantum Computing',
    description: 'Access cutting-edge features including quantum simulation, neuro-adaptive UI, global consciousness feeds, and reality fabrication.',
    icon: Crown,
    color: 'from-yellow-500 to-orange-500',
    features: [
      'Quantum workflow simulation',
      'HIPAA compliance automation',
      'Neuro-adaptive interfaces',
      'Global consciousness feeds'
    ],
    cta: 'Explore God-Tier',
    actionUrl: '/god-tier',
    image: '/api/placeholder/600/400'
  },
  {
    id: 5,
    title: 'You\'re All Set!',
    subtitle: 'Ready to Transform Your Business Operations',
    description: 'Congratulations! You\'ve completed the onboarding process. Start building workflows, explore integrations, and unlock the full potential of AI automation.',
    icon: Rocket,
    color: 'from-indigo-500 to-purple-500',
    features: [
      'Dashboard with analytics',
      '24/7 expert support',
      'Advanced monitoring tools',
      'Unlimited workflow creation'
    ],
    cta: 'Go to Dashboard',
    actionUrl: '/dashboard',
    image: '/api/placeholder/600/400'
  }
];

function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const currentStepData = onboardingSteps.find(step => step.id === currentStep);
  const progress = ((currentStep - 1) / (onboardingSteps.length - 1)) * 100;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <Gift className="w-4 h-4 mr-2" />
            15-Day Premium Trial Active
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Welcome to <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Kairo</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Let's get you set up with the world's most advanced workflow automation platform
          </p>
        </div>

        {/* Progress Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {onboardingSteps.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-6" />
          
          {/* Step Navigation */}
          <div className="flex justify-center space-x-4 mb-8">
            {onboardingSteps.map((step) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  step.id === currentStep
                    ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-110'
                    : completedSteps.includes(step.id)
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-muted bg-background text-muted-foreground hover:border-primary/50'
                }`}
              >
                {completedSteps.includes(step.id) ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-bold">{step.id}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        {currentStepData && (
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 bg-gradient-to-r ${currentStepData.color} rounded-xl shadow-lg`}>
                  <currentStepData.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {currentStepData.title}
                  </h2>
                  <p className="text-lg text-primary font-medium">
                    {currentStepData.subtitle}
                  </p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {currentStepData.description}
              </p>

              <div className="space-y-3">
                {currentStepData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-6">
                {currentStepData.actionUrl ? (
                  <Button asChild size="lg" className="group">
                    <Link href={currentStepData.actionUrl}>
                      {currentStepData.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : (
                  <Button onClick={handleNext} size="lg" className="group">
                    {currentStepData.cta}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
                
                {currentStep < onboardingSteps.length && !currentStepData.actionUrl && (
                  <Button variant="outline" onClick={handleNext} size="lg">
                    Skip for Now
                  </Button>
                )}
              </div>
            </div>

            {/* Visual */}
            <div className="lg:order-first">
              <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-card via-card to-card/50">
                <div className="aspect-video bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center">
                  <div className={`p-8 bg-gradient-to-r ${currentStepData.color} rounded-full shadow-xl`}>
                    <currentStepData.icon className="h-16 w-16 text-white" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Previous
          </Button>

          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Skip Onboarding</Link>
            </Button>
            
            {currentStep < onboardingSteps.length ? (
              <Button onClick={handleNext} className="group">
                Next Step
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button asChild className="group">
                <Link href="/dashboard">
                  Complete Onboarding
                  <Rocket className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-16 pt-12 border-t">
          <h3 className="text-2xl font-bold text-center mb-8">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle className="text-lg">Quick Start Guide</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  3-minute setup tutorial to get your first workflow running
                </CardDescription>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/quick-start">
                    Start Tutorial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Rocket className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="text-lg">Getting Started</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Comprehensive guide with sample workflows and best practices
                </CardDescription>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/getting-started">
                    View Guide
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg">Get Help</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Access documentation, tutorials, and community support
                </CardDescription>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/help">
                    Get Support
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(OnboardingPage);