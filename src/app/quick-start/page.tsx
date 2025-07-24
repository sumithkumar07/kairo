'use client';

import React, { useState, useEffect } from 'react';
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
  Play,
  Clock,
  Timer,
  Rocket,
  Workflow, 
  Cpu, 
  Zap,
  Globe,
  Crown,
  Sparkles,
  Settings,
  Database,
  Mail,
  MessageSquare,
  Target,
  Eye,
  ThumbsUp,
  Trophy,
  Star,
  Lightbulb,
  Code,
  TestTube,
  Activity,
  BarChart3
} from 'lucide-react';

const quickStartSteps = [
  {
    id: 1,
    title: 'Choose Your First Automation',
    subtitle: 'Pick a simple workflow to get started',
    description: 'Select from our most popular starter workflows. These are designed to be simple, effective, and demonstrate key Kairo capabilities.',
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    duration: '30 seconds',
    options: [
      {
        name: 'Welcome Email Automation',
        description: 'Send personalized welcome emails to new subscribers',
        difficulty: 'Beginner',
        icon: Mail
      },
      {
        name: 'Slack Notification Bot',
        description: 'Get notified in Slack when important events happen',
        difficulty: 'Beginner',
        icon: MessageSquare
      },
      {
        name: 'Data Sync Workflow',
        description: 'Keep your CRM and email marketing tool in sync',
        difficulty: 'Intermediate',
        icon: Database
      }
    ]
  },
  {
    id: 2,
    title: 'Configure Your Workflow',
    subtitle: 'Set up the basic configuration',
    description: 'Configure the trigger and actions for your workflow. Don\'t worry about perfection - you can always modify later.',
    icon: Settings,
    color: 'from-green-500 to-emerald-500',
    duration: '1 minute',
    configSteps: [
      'Set your trigger (form submission, schedule, webhook)',
      'Choose your action (send email, update database, post to Slack)',
      'Map your data fields',
      'Set basic conditions if needed'
    ]
  },
  {
    id: 3,
    title: 'Test Your Workflow',
    subtitle: 'Make sure everything works correctly',
    description: 'Test your workflow with sample data to ensure it behaves as expected. This helps catch any issues before going live.',
    icon: TestTube,
    color: 'from-purple-500 to-pink-500',
    duration: '1 minute',
    testSteps: [
      'Use our built-in test data generator',
      'Watch the workflow execute in real-time',
      'Check that outputs match expectations',
      'Review logs for any warnings'
    ]
  },
  {
    id: 4,
    title: 'Deploy & Monitor',
    subtitle: 'Go live and track performance',
    description: 'Deploy your workflow to production and set up monitoring to track its performance and catch any issues.',
    icon: Rocket,
    color: 'from-orange-500 to-red-500',
    duration: '30 seconds',
    deploySteps: [
      'Click "Deploy to Production"',
      'Set up basic monitoring alerts',
      'View real-time performance metrics',
      'Access execution logs and analytics'
    ]
  }
];

const achievements = [
  {
    title: 'First Workflow Created',
    description: 'You\'ve built your first automation!',
    icon: Trophy,
    earned: false
  },
  {
    title: 'Testing Expert',
    description: 'Successfully tested a workflow',
    icon: TestTube,
    earned: false
  },
  {
    title: 'Deployment Master',
    description: 'Deployed your first workflow to production',
    icon: Rocket,
    earned: false
  },
  {
    title: 'Quick Start Champion',
    description: 'Completed the 3-minute quick start',
    icon: Star,
    earned: false
  }
];

function QuickStartPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [userAchievements, setUserAchievements] = useState(achievements);

  // Timer effect
  useEffect(() => {
    if (!startTime) {
      setStartTime(new Date());
    }

    const timer = setInterval(() => {
      if (startTime) {
        const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        setTimeSpent(elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const handleNext = () => {
    if (currentStep < quickStartSteps.length) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
      
      // Award achievements
      if (currentStep === 1) {
        updateAchievement('First Workflow Created');
      } else if (currentStep === 3) {
        updateAchievement('Testing Expert');
      } else if (currentStep === 4) {
        updateAchievement('Deployment Master');
        updateAchievement('Quick Start Champion');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAchievement = (title: string) => {
    setUserAchievements(prev => 
      prev.map(achievement => 
        achievement.title === title 
          ? { ...achievement, earned: true }
          : achievement
      )
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStepData = quickStartSteps.find(step => step.id === currentStep);
  const progress = ((currentStep - 1) / (quickStartSteps.length - 1)) * 100;
  const isCompleted = completedSteps.length === quickStartSteps.length;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <Timer className="w-4 h-4 mr-2" />
            3-Minute Quick Start
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Build Your First <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Workflow</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create, test, and deploy your first automation in under 3 minutes
          </p>
        </div>

        {/* Timer and Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {quickStartSteps.length}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeSpent)}</span>
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-3 mb-6" />
          
          {/* Step Indicators */}
          <div className="flex justify-center space-x-4 mb-8">
            {quickStartSteps.map((step) => (
              <div
                key={step.id}
                className={`relative flex flex-col items-center ${
                  step.id <= currentStep ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    step.id === currentStep
                      ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-110'
                      : completedSteps.includes(step.id)
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-muted bg-background text-muted-foreground'
                  }`}
                >
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <span className="text-xs text-center mt-2 max-w-16">
                  {step.title.split(' ').slice(0, 2).join(' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        {currentStepData && !isCompleted && (
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Timer className="h-4 w-4" />
                    {currentStepData.duration}
                  </div>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {currentStepData.description}
              </p>

              {/* Step-specific content */}
              {currentStep === 1 && currentStepData.options && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Choose a workflow template:</h3>
                  <div className="space-y-3">
                    {currentStepData.options.map((option, index) => (
                      <Card 
                        key={index} 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedOption === option.name ? 'ring-2 ring-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedOption(option.name)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <option.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{option.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {option.difficulty}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                            {selectedOption === option.name && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && currentStepData.configSteps && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Configuration steps:</h3>
                  <div className="space-y-3">
                    {currentStepData.configSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <span className="text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && currentStepData.testSteps && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Testing process:</h3>
                  <div className="space-y-3">
                    {currentStepData.testSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-green-600">{index + 1}</span>
                        </div>
                        <span className="text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && currentStepData.deploySteps && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Deployment steps:</h3>
                  <div className="space-y-3">
                    {currentStepData.deploySteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-orange-500/10 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                        </div>
                        <span className="text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-6">
                {currentStep === 1 ? (
                  <Button 
                    onClick={handleNext} 
                    size="lg" 
                    className="group"
                    disabled={!selectedOption}
                  >
                    {selectedOption ? 'Configure Workflow' : 'Select a Template'}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : currentStep === 4 ? (
                  <Button asChild size="lg" className="group">
                    <Link href="/workflow">
                      Open Workflow Builder
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : (
                  <Button onClick={handleNext} size="lg" className="group">
                    Complete Step
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
                
                <Button variant="outline" onClick={handleNext} size="lg">
                  Skip Step
                </Button>
              </div>
            </div>

            {/* Visual */}
            <div className="space-y-6">
              <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-card to-card/50">
                <div className="aspect-video bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center">
                  <div className={`p-8 bg-gradient-to-r ${currentStepData.color} rounded-full shadow-xl animate-pulse`}>
                    <currentStepData.icon className="h-16 w-16 text-white" />
                  </div>
                </div>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userAchievements.map((achievement, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                          achievement.earned 
                            ? 'bg-green-500/10 border border-green-500/20' 
                            : 'bg-muted/20'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          achievement.earned 
                            ? 'bg-green-500/20 text-green-600' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <achievement.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${
                            achievement.earned ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-xs ${
                            achievement.earned ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'
                          }`}>
                            {achievement.description}
                          </p>
                        </div>
                        {achievement.earned && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Completion Screen */}
        {isCompleted && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-2xl animate-bounce">
                  <Trophy className="h-16 w-16 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-foreground">
                Congratulations! 🎉
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                You've completed the 3-minute quick start in {formatTime(timeSpent)}! 
                Your first workflow is ready to go.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                    <Workflow className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Build More Workflows</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create advanced automations with our visual builder
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/workflow">Open Builder</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="p-4 bg-green-500/10 rounded-full inline-block mb-4">
                    <BarChart3 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="font-semibold mb-2">View Analytics</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Monitor your workflow performance and metrics
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/analytics">View Analytics</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="p-4 bg-purple-500/10 rounded-full inline-block mb-4">
                    <Globe className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Add Integrations</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect with your favorite tools and services
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/integrations">Browse Integrations</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="pt-8">
              <Button asChild size="lg" className="group">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {!isCompleted && (
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
                <Link href="/getting-started">Full Guide</Link>
              </Button>
              
              {currentStep < quickStartSteps.length && (
                <Button onClick={handleNext} className="group">
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default withAuth(QuickStartPage);