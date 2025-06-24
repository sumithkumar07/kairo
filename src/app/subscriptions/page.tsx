
'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Workflow, ShieldCheck, Star, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FREE_TIER_FEATURES, PRO_TIER_FEATURES } from '@/types/subscription'; 

export default function SubscriptionsPage() {
  const { 
    currentTier, 
    upgradeToPro, 
    isLoggedIn, 
    daysRemainingInTrial,
    isProOrTrial
  } = useSubscription();

  const getTierDisplayName = (tier: typeof currentTier) => {
    if (tier === 'Pro Trial') return 'Pro Trial';
    if (tier === 'Pro') return 'Pro Tier';
    return 'Free Tier';
  };

  const isTrialActive = currentTier === 'Pro Trial' && daysRemainingInTrial !== null && daysRemainingInTrial > 0;
  const isTrialExpired = isLoggedIn && currentTier === 'Free' && isProOrTrial === false && daysRemainingInTrial === 0;

  const freeTierFeaturesList = [
    `AI Workflow Generations: ${FREE_TIER_FEATURES.aiWorkflowGenerationsPerDay} per day`,
    `AI Workflow Explanations: ${FREE_TIER_FEATURES.canExplainWorkflow ? 'Basic' : 'Unavailable'}`,
    `Advanced Nodes: ${FREE_TIER_FEATURES.accessToAdvancedNodes ? 'Limited' : 'Unavailable'}`,
    `Max Saved Workflows: ${FREE_TIER_FEATURES.maxWorkflows}`,
    'Community Support',
  ];

  const proTierFeaturesList = [
    `AI Workflow Generations: Unlimited`,
    `AI Workflow Explanations: Full AI Explanations & Suggestions`,
    `Advanced Nodes: Full Node Library Access`,
    `Max Saved Workflows: Unlimited`,
    'Priority Email Support',
  ];

  const renderProCtaButton = () => {
    if (currentTier === 'Pro') {
      return <Button className="w-full text-base py-6" disabled><ShieldCheck className="mr-2 h-4 w-4" />Your Current Plan</Button>;
    }
    if (isTrialActive) {
      return <Button onClick={upgradeToPro} className="w-full text-base py-6"><ShieldCheck className="mr-2 h-4 w-4" />Activate Full Pro Plan</Button>;
    }
    if (!isLoggedIn) {
      return <Button asChild className="w-full text-base py-6"><Link href="/signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up for 15-Day Trial</Link></Button>;
    }
    return <Button onClick={upgradeToPro} className="w-full text-base py-6"><Workflow className="mr-2 h-4 w-4" />Upgrade to Pro</Button>;
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-primary flex items-center">
            <Workflow className="h-8 w-8 mr-2" />
            Kairo
          </Link>
          <nav>
            <Button variant="ghost" asChild>
                <Link href="/workflow">
                  Workflow Editor
                </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Choose Your Kairo Plan
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            {isTrialActive ? `Your Pro Trial is active! You have ${daysRemainingInTrial} day${daysRemainingInTrial !== 1 ? 's' : ''} remaining.` :
             isTrialExpired ? `Your Pro Trial has expired. Please upgrade to continue using Pro features.` :
             `Unlock powerful AI automation features tailored to your needs.`
            }
          </p>
        </section>
        
        {!isLoggedIn && (
          <Card className="max-w-2xl mx-auto mb-10 p-6 text-center bg-primary/5 border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <CardTitle className="text-xl mb-2 text-primary">Get Started with Kairo</CardTitle>
            <CardDescription className="text-muted-foreground mb-4">
              Sign up to get a 15-day free trial of our Pro features, or log in if you already have an account.
            </CardDescription>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/signup"><UserPlus className="mr-2 h-4 w-4"/>Sign Up for Trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login"><LogIn className="mr-2 h-4 w-4"/>Log In</Link>
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier Card */}
          <Card className={cn(
            "flex flex-col shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]", 
            isLoggedIn && currentTier === 'Free' && "border-2 border-primary ring-4 ring-primary/20"
          )}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-semibold text-primary">Free Tier</CardTitle>
                {isLoggedIn && currentTier === 'Free' && <span className="px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary rounded-full shadow-sm">Current Plan</span>}
              </div>
              <CardDescription className="text-sm pt-1">Get started with basic workflow automation.</CardDescription>
              <p className="text-3xl font-bold text-foreground pt-2">$0/month</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2.5 text-sm">
                {freeTierFeaturesList.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2.5 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto pt-6">
              <Button className="w-full text-base py-6" variant="default" disabled={true}>Your Current Plan</Button>
            </CardFooter>
          </Card>

          {/* Pro Tier Card */}
          <Card className={cn(
            "flex flex-col shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]", 
            isProOrTrial && "border-2 border-primary ring-4 ring-primary/20"
          )}>
            <CardHeader className="pb-4 bg-gradient-to-tr from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-t-lg relative">
              <div className="absolute top-3 right-3">
                 <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-400/20 dark:bg-amber-400/10 rounded-full border border-amber-500/30">
                    <Star className="h-3.5 w-3.5" />
                    Best Value
                  </div>
              </div>
               <div className="flex justify-between items-center pt-2">
                <CardTitle className="text-2xl font-semibold text-primary">Pro Tier</CardTitle>
                {isLoggedIn && (currentTier === 'Pro' || currentTier === 'Pro Trial') && 
                  <span className="px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary rounded-full shadow-sm">
                    {getTierDisplayName(currentTier)}
                  </span>}
              </div>
              <CardDescription className="text-sm pt-1">Unlock the full power of Kairo.</CardDescription>
              <p className="text-3xl font-bold text-foreground pt-2">$29/month</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2.5 text-sm">
                {proTierFeaturesList.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <ShieldCheck className="h-4 w-4 text-primary mr-2.5 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto pt-6">
              {renderProCtaButton()}
            </CardFooter>
          </Card>
        </div>
         <section className="text-center mt-16">
            <p className="text-muted-foreground text-sm">
                Need a custom solution or enterprise features? <Link href="/contact" className="text-primary hover:underline font-medium">Contact Us</Link>.
            </p>
        </section>
      </main>

      <footer className="text-center py-10 border-t mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Kairo. Automate intelligently.
          <Link href="/contact" className="ml-2 text-primary hover:underline font-medium">Contact Us</Link>
        </p>
      </footer>
    </div>
  );
}
