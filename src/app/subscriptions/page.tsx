
'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Workflow, ShieldCheck, Star, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FREE_TIER_FEATURES, GOLD_TIER_FEATURES, DIAMOND_TIER_FEATURES } from '@/types/subscription'; 
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';
import { upgradeToGoldAction, upgradeToDiamondAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function SubscriptionsPage() {
  const { 
    currentTier, 
    isLoggedIn, 
    daysRemainingInTrial,
    hasProFeatures,
  } = useSubscription();

  const { toast } = useToast();
  const router = useRouter();

  const handleUpgrade = async (tier: 'Gold' | 'Diamond') => {
    try {
      if (tier === 'Gold') {
        await upgradeToGoldAction();
      } else {
        await upgradeToDiamondAction();
      }
      toast({ title: 'Upgrade Successful!', description: `You now have access to ${tier} features.` });
      // Force a reload of the subscription context - a page refresh is the simplest way
      router.refresh(); 
      window.location.reload();
    } catch (e: any) {
      toast({ title: 'Upgrade Failed', description: e.message, variant: 'destructive' });
    }
  };


  const getTierDisplayName = (tier: typeof currentTier) => {
    if (tier === 'Gold Trial') return 'Gold Trial';
    if (tier === 'Diamond') return 'Diamond';
    if (tier === 'Gold') return 'Gold';
    return 'Free';
  };

  const isTrialActive = currentTier === 'Gold Trial' && daysRemainingInTrial !== null && daysRemainingInTrial > 0;
  const isTrialExpired = isLoggedIn && currentTier === 'Free' && hasProFeatures === false && daysRemainingInTrial === 0;

  const freeTierFeaturesList = [
    `Monthly Workflow Runs: ${FREE_TIER_FEATURES.maxRunsPerMonth}`,
    `AI Workflow Generations: ${FREE_TIER_FEATURES.aiWorkflowGenerationsPerMonth} per month`,
    `Max Saved Workflows: ${FREE_TIER_FEATURES.maxWorkflows}`,
    `Advanced Nodes: ${FREE_TIER_FEATURES.accessToAdvancedNodes ? 'Limited' : 'Unavailable'}`,
    `AI Workflow Explanations: ${FREE_TIER_FEATURES.canExplainWorkflow ? 'Basic' : 'Unavailable'}`,
    'Community Support',
  ];

  const goldTierFeaturesList = [
    `Monthly Workflow Runs: ${GOLD_TIER_FEATURES.maxRunsPerMonth}`,
    `AI Workflow Generations: ${GOLD_TIER_FEATURES.aiWorkflowGenerationsPerMonth} per month`,
    `Max Saved Workflows: ${GOLD_TIER_FEATURES.maxWorkflows}`,
    `Advanced Nodes: Full Node Library Access`,
    `AI Workflow Explanations: ${GOLD_TIER_FEATURES.canExplainWorkflow ? 'Enabled' : 'Unavailable'}`,
    'Email Support',
  ];

  const diamondTierFeaturesList = [
    `Monthly Workflow Runs: ${DIAMOND_TIER_FEATURES.maxRunsPerMonth}`,
    `AI Workflow Generations: ${DIAMOND_TIER_FEATURES.aiWorkflowGenerationsPerMonth} per month`,
    `Max Saved Workflows: ${DIAMOND_TIER_FEATURES.maxWorkflows}`,
    `Advanced Nodes: Full Node Library Access`,
    `AI Workflow Explanations: Full AI Explanations & Suggestions`,
    'Priority Email Support',
  ];

  const renderCtaButton = (plan: 'Gold' | 'Diamond') => {
    if (currentTier === plan) {
      return <Button className="w-full text-base py-6" disabled><ShieldCheck className="mr-2 h-4 w-4" />Your Current Plan</Button>;
    }
    if (currentTier === 'Gold Trial' && plan === 'Gold') {
        return <Button onClick={() => handleUpgrade('Gold')} className="w-full text-base py-6"><Workflow className="mr-2 h-4 w-4" />Activate Full Gold Plan</Button>;
    }
    if (currentTier === 'Gold Trial' && plan === 'Diamond') {
        return <Button onClick={() => handleUpgrade('Diamond')} className="w-full text-base py-6"><ShieldCheck className="mr-2 h-4 w-4" />Upgrade to Diamond</Button>;
    }
    if (!isLoggedIn) {
      return <Button asChild className="w-full text-base py-6"><Link href="/signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up for 15-Day Trial</Link></Button>;
    }
    if (plan === 'Gold') {
       return <Button onClick={() => handleUpgrade('Gold')} className="w-full text-base py-6"><Workflow className="mr-2 h-4 w-4" />{currentTier === 'Free' ? 'Upgrade to Gold' : 'Switch to Gold'}</Button>;
    }
    if (plan === 'Diamond') {
       return <Button onClick={() => handleUpgrade('Diamond')} className="w-full text-base py-6"><ShieldCheck className="mr-2 h-4 w-4" />Upgrade to Diamond</Button>;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MarketingHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-muted/40">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Choose Your Kairo Plan
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            {isTrialActive ? `Your Gold Trial is active! You have ${daysRemainingInTrial} day${daysRemainingInTrial !== 1 ? 's' : ''} remaining.` :
             isTrialExpired ? `Your trial has expired. Please upgrade to continue using Pro features.` :
             `Unlock powerful AI automation features tailored to your needs.`
            }
          </p>
        </section>
        
        {!isLoggedIn && (
          <Card className="max-w-2xl mx-auto mb-10 p-6 text-center bg-primary/5 border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <CardTitle className="text-xl mb-2 text-primary">Get Started with Kairo</CardTitle>
            <CardDescription className="text-muted-foreground mb-4">
              Sign up to get a 15-day free trial of our Gold features, or log in if you already have an account.
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
              <Button className="w-full text-base py-6" variant="secondary" disabled={true}>Your Current Plan</Button>
            </CardFooter>
          </Card>

          {/* Gold Tier Card */}
          <Card className={cn(
            "flex flex-col shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]", 
            isLoggedIn && (currentTier === 'Gold' || currentTier === 'Gold Trial') && "border-2 border-amber-500 ring-4 ring-amber-500/20"
          )}>
            <CardHeader className="pb-4">
               <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-semibold text-amber-500">Gold Tier</CardTitle>
                {isLoggedIn && (currentTier === 'Gold' || currentTier === 'Gold Trial') && 
                  <span className="px-3 py-1 text-xs font-semibold text-amber-900 bg-amber-400 rounded-full shadow-sm">
                    {getTierDisplayName(currentTier)}
                  </span>}
              </div>
              <CardDescription className="text-sm pt-1">For more serious hobbyists and small projects.</CardDescription>
              <p className="text-3xl font-bold text-foreground pt-2">$9/month</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2.5 text-sm">
                {goldTierFeaturesList.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2.5 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto pt-6">
              {renderCtaButton('Gold')}
            </CardFooter>
          </Card>

          {/* Diamond Tier Card */}
          <Card className={cn(
            "flex flex-col shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]", 
            isLoggedIn && currentTier === 'Diamond' && "border-2 border-primary ring-4 ring-primary/20"
          )}>
            <CardHeader className="pb-4 bg-gradient-to-tr from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-t-lg relative">
              <div className="absolute top-3 right-3">
                 <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-primary/90 dark:text-primary-foreground/80 bg-primary/20 dark:bg-primary/20 rounded-full border border-primary/30">
                    <Star className="h-3.5 w-3.5" />
                    Best Value
                  </div>
              </div>
               <div className="flex justify-between items-center pt-2">
                <CardTitle className="text-2xl font-semibold text-primary">Diamond Tier</CardTitle>
                {isLoggedIn && currentTier === 'Diamond' && 
                  <span className="px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary rounded-full shadow-sm">
                    {getTierDisplayName(currentTier)}
                  </span>}
              </div>
              <CardDescription className="text-sm pt-1">Unlock the full power of Kairo for professionals.</CardDescription>
              <p className="text-3xl font-bold text-foreground pt-2">$19/month</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2.5 text-sm">
                {diamondTierFeaturesList.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <ShieldCheck className="h-4 w-4 text-primary mr-2.5 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto pt-6">
              {renderCtaButton('Diamond')}
            </CardFooter>
          </Card>
        </div>
         <section className="text-center mt-16">
            <p className="text-muted-foreground text-sm">
                Need a custom solution or enterprise features? <Link href="/contact" className="ml-4 text-primary hover:underline font-medium">Contact Us</Link>.
            </p>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
