'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Sparkles, 
  Target, 
  Zap, 
  Crown, 
  CheckCircle, 
  ArrowRight, 
  Play,
  Workflow,
  Bot,
  Settings,
  Trophy,
  Gift,
  Star,
  Users,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  reward: string;
  action: () => void;
}

interface EnhancedOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function EnhancedOnboarding({ open, onOpenChange, onComplete }: EnhancedOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Kairo AI',
      description: 'Your journey to workflow automation mastery begins here',
      icon: Sparkles,
      completed: false,
      reward: '+50 XP',
      action: () => completeStep('welcome', 50)
    },
    {
      id: 'explore-marketplace',
      title: 'Explore the Marketplace',
      description: 'Discover 1,200+ ready-to-use workflow templates',
      icon: Target,
      completed: false,
      reward: '+75 XP',
      action: () => completeStep('explore-marketplace', 75)
    },
    {
      id: 'create-workflow',
      title: 'Create Your First Workflow',
      description: 'Build a simple automation in the visual editor',
      icon: Workflow,
      completed: false,
      reward: '+100 XP',
      action: () => completeStep('create-workflow', 100)
    },
    {
      id: 'try-ai-studio',
      title: 'Try AI Studio',
      description: 'Experience the power of AI-generated workflows',
      icon: Bot,
      completed: false,
      reward: '+125 XP',
      action: () => completeStep('try-ai-studio', 125)
    },
    {
      id: 'setup-integration',
      title: 'Connect Your First App',
      description: 'Integrate with your favorite productivity tools',
      icon: Settings,
      completed: false,
      reward: '+150 XP',
      action: () => completeStep('setup-integration', 150)
    },
    {
      id: 'unlock-god-tier',
      title: 'Unlock God-Tier Features',
      description: 'Access quantum computing and divine powers',
      icon: Crown,
      completed: false,
      reward: '+200 XP + Special Badge',
      action: () => completeStep('unlock-god-tier', 200)
    }
  ];

  const completeStep = (stepId: string, points: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
      setTotalPoints(prev => prev + points);
      
      // Move to next step after a short delay
      setTimeout(() => {
        if (currentStep < onboardingSteps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          // All steps completed
          onComplete?.();
        }
      }, 1500);
    }
  };

  const progressPercentage = (completedSteps.length / onboardingSteps.length) * 100;

  const getCurrentBadge = () => {
    if (totalPoints >= 700) return { name: 'Automation Master', color: 'from-purple-500 to-pink-500', icon: Crown };
    if (totalPoints >= 500) return { name: 'Workflow Wizard', color: 'from-blue-500 to-cyan-500', icon: Star };
    if (totalPoints >= 300) return { name: 'Integration Expert', color: 'from-green-500 to-emerald-500', icon: Award };
    if (totalPoints >= 150) return { name: 'Automation Apprentice', color: 'from-orange-500 to-red-500', icon: Trophy };
    return { name: 'Beginner', color: 'from-gray-500 to-gray-600', icon: Users };
  };

  const currentBadge = getCurrentBadge();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            Interactive Onboarding Journey
          </DialogTitle>
          <DialogDescription>
            Complete your onboarding to unlock the full power of Kairo AI
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Progress Overview */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <currentBadge.icon className="h-5 w-5" />
                    Your Progress
                  </CardTitle>
                  <CardDescription>
                    {completedSteps.length} of {onboardingSteps.length} steps completed
                  </CardDescription>
                </div>
                <Badge className={cn('bg-gradient-to-r text-white', currentBadge.color)}>
                  <Trophy className="h-3 w-3 mr-1" />
                  {currentBadge.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{totalPoints} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-purple-500" />
                  <span>{6 - completedSteps.length} rewards remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {onboardingSteps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = index === currentStep && !isCompleted;
              const isLocked = index > currentStep && !isCompleted;

              return (
                <Card 
                  key={step.id} 
                  className={cn(
                    'transition-all duration-300 hover:shadow-lg',
                    isCompleted && 'border-green-500/50 bg-green-500/5',
                    isCurrent && 'border-primary/50 bg-primary/5 ring-2 ring-primary/20',
                    isLocked && 'opacity-50'
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-2 rounded-lg transition-colors',
                          isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground',
                          isCurrent && 'bg-primary text-primary-foreground'
                        )}>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <step.icon className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{step.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {step.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={isCompleted ? "default" : "secondary"}
                        className={cn(
                          isCompleted && 'bg-green-500 hover:bg-green-600',
                          isCurrent && 'bg-primary hover:bg-primary/90'
                        )}
                      >
                        {step.reward}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Button 
                      onClick={step.action}
                      disabled={isLocked || isCompleted}
                      className={cn(
                        'w-full transition-all',
                        isCompleted && 'bg-green-500 hover:bg-green-600',
                        isCurrent && 'bg-primary hover:bg-primary/90'
                      )}
                      variant={isCompleted ? "default" : isCurrent ? "default" : "outline"}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : isCurrent ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Step
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Locked
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Achievement Showcase */}
          {completedSteps.length >= 3 && (
            <Card className="border-2 border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <Trophy className="h-5 w-5" />
                  Achievement Unlocked!
                </CardTitle>
                <CardDescription>
                  You're making excellent progress! Keep going to unlock more rewards.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Quick Learner Badge</h4>
                    <p className="text-sm text-muted-foreground">
                      Completed 50% of onboarding steps in record time!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}