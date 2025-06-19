
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
    features, 
    upgradeToPro, 
    isLoggedIn, 
    user, 
    signup,
    daysRemainingInTrial,
    trialEndDate
  } = useSubscription();
  
  const tierDisplayName = (tier: typeof currentTier) => {
    if (tier === 'Pro Trial') return 'Pro Trial';
    if (tier === 'Pro') return 'Pro Tier';
    return 'Free Tier';
  };

  const isTrialExpired = isLoggedIn && currentTier === 'Free' && trialEndDate && trialEndDate <= new Date();

  const tierDetails = {
    Free: {
      name: 'Free Tier',
      price: '$0/month',
      description: 'Get started with basic workflow automation and AI assistance.',
      features: [
        `AI Workflow Generations: ${FREE_TIER_FEATURES.aiWorkflowGenerationsPerDay} per day`,
        `Workflow Explanations: ${FREE_TIER_FEATURES.canExplainWorkflow ? 'Basic' : 'Limited'}`, 
        `Advanced Nodes Access: ${FREE_TIER_FEATURES.accessToAdvancedNodes ? 'Limited' : 'None'}`, 
        `Max Workflows: ${FREE_TIER_FEATURES.maxWorkflows}`,
        'Community Support',
      ],
      cta: {
        text: 'Your Current Plan',
        disabled: true,
      },
    },
    Pro: {
      name: 'Pro Tier',
      price: '$29/month (Example Price)',
      description: 'Unlock the full power of Kairo with unlimited features and priority support.',
      features: [
        `AI Workflow Generations: ${PRO_TIER_FEATURES.aiWorkflowGenerationsPerDay === 'unlimited' ? 'Unlimited' : PRO_TIER_FEATURES.aiWorkflowGenerationsPerDay}`,
        `Workflow Explanations: ${PRO_TIER_FEATURES.canExplainWorkflow ? 'Full AI Explanations & Advanced Suggestions' : 'Limited'}`,
        `Advanced Nodes Access: ${PRO_TIER_FEATURES.accessToAdvancedNodes ? 'Full Node Library Access' : 'Limited'}`,
        `Max Workflows: ${PRO_TIER_FEATURES.maxWorkflows === 'unlimited' ? 'Unlimited' : PRO_TIER_FEATURES.maxWorkflows}`,
        'Priority Email Support',
      ],
      cta: { 
        text: '', 
        disabled: false,
        action: undefined as (() => void) | undefined,
        href: undefined as string | undefined,
      },
    },
  };

  let proTierCtaText = 'Upgrade to Pro';
  let proTierCtaAction: (() => void) | undefined = upgradeToPro;
  let proTierCtaDisabled = false;
  let proTierCtaIcon = <Workflow className="mr-2 h-4 w-4" />;
  let proTierCtaHref: string | undefined = undefined;

  if (!isLoggedIn) {
    proTierCtaText = 'Sign Up for 15-Day Pro Trial';
    proTierCtaAction = undefined; 
    proTierCtaHref = "/signup";
    proTierCtaIcon = <UserPlus className="mr-2 h-4 w-4" />;
    proTierCtaDisabled = false;
  } else if (currentTier === 'Pro Trial') {
    proTierCtaText = 'Activate Full Pro Plan';
    proTierCtaAction = upgradeToPro;
    proTierCtaIcon = <ShieldCheck className="mr-2 h-4 w-4" />;
    proTierCtaDisabled = false; 
    proTierCtaHref = undefined;
  } else if (currentTier === 'Pro') {
    proTierCtaText = 'You are on the Pro Tier';
    proTierCtaAction = undefined;
    proTierCtaDisabled = true;
    proTierCtaIcon = <ShieldCheck className="mr-2 h-4 w-4" />;
    proTierCtaHref = undefined;
  } else if (isLoggedIn && currentTier === 'Free' && !isTrialExpired) {
     proTierCtaText = 'Start 15-Day Pro Trial';
     proTierCtaAction = () => signup(user!.email); 
     proTierCtaIcon = <Workflow className="mr-2 h-4 w-4" />;
     proTierCtaDisabled = false;
     proTierCtaHref = undefined;
  } else if (isTrialExpired) { 
    proTierCtaText = 'Upgrade to Pro';
    proTierCtaAction = upgradeToPro;
    proTierCtaIcon = <Workflow className="mr-2 h-4 w-4" />;
    proTierCtaDisabled = false;
    proTierCtaHref = undefined;
  }
  
  tierDetails.Pro.cta = {
    text: proTierCtaText,
    disabled: proTierCtaDisabled,
    action: proTierCtaAction,
    href: proTierCtaHref,
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
            <Link href="/workflow" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Workflow Editor
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Choose Your Kairo Plan
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            {isLoggedIn && currentTier === 'Pro Trial' && daysRemainingInTrial !== null && daysRemainingInTrial > 0 ? 
              `Your Pro Trial is active! You have ${daysRemainingInTrial} day${daysRemainingInTrial !== 1 ? 's' : ''} remaining.` :
              isTrialExpired ?
              `Your Pro Trial has expired. Please upgrade to continue using Pro features.` :
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
                <CardTitle className="text-2xl font-semibold text-primary">{tierDetails.Free.name}</CardTitle>
                {isLoggedIn && currentTier === 'Free' && <span className="px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary rounded-full shadow-sm">Current Plan</span>}
              </div>
              <CardDescription className="text-sm pt-1">{tierDetails.Free.description}</CardDescription>
              <p className="text-3xl font-bold text-foreground pt-2">{tierDetails.Free.price}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2.5 text-sm">
                {tierDetails.Free.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2.5 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto pt-6">
               {isLoggedIn && currentTier === 'Free' ? (
                  <Button
                    className="w-full text-base py-6 shadow-md"
                    variant="default" 
                    disabled={true}
                  >
                    {tierDetails.Free.cta.text}
                  </Button>
               ) : !isLoggedIn ? (
                  <Button
                    className="w-full text-base py-6 shadow-md"
                    variant="outline"
                    disabled={true}
                  >
                    Sign up to activate
                  </Button>
               ) : ( 
                  <Button
                    className="w-full text-base py-6 shadow-md"
                    variant="outline"
                    disabled={true}
                  >
                    Your plan is {tierDisplayName(currentTier)}
                  </Button>
               )}
            </CardFooter>
          </Card>

          {/* Pro Tier Card */}
          <Card className={cn(
            "flex flex-col shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]", 
            isLoggedIn && (currentTier === 'Pro' || currentTier === 'Pro Trial') && "border-2 border-primary ring-4 ring-primary/20"
          )}>
            <CardHeader className="pb-4 bg-gradient-to-tr from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-t-lg relative">
              <div className="absolute top-3 right-3">
                 <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-400/20 dark:bg-amber-400/10 rounded-full border border-amber-500/30">
                    <Star className="h-3.5 w-3.5" />
                    Best Value
                  </div>
              </div>
               <div className="flex justify-between items-center pt-2">
                <CardTitle className="text-2xl font-semibold text-primary">{tierDetails.Pro.name}</CardTitle>
                {isLoggedIn && (currentTier === 'Pro' || currentTier === 'Pro Trial') && 
                  <span className="px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary rounded-full shadow-sm">
                    {currentTier === 'Pro Trial' ? 'Active Trial' : 'Current Plan'}
                  </span>}
              </div>
              <CardDescription className="text-sm pt-1">{tierDetails.Pro.description}</CardDescription>
              <p className="text-3xl font-bold text-foreground pt-2">{tierDetails.Pro.price}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2.5 text-sm">
                {tierDetails.Pro.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <ShieldCheck className="h-4 w-4 text-primary mr-2.5 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto pt-6">
              {tierDetails.Pro.cta.href ? (
                <Button asChild className="w-full text-base py-6 shadow-md hover:shadow-primary/30">
                  <Link href={tierDetails.Pro.cta.href}>
                    {proTierCtaIcon}
                    {tierDetails.Pro.cta.text}
                  </Link>
                </Button>
              ) : (
                <Button
                  className="w-full text-base py-6 shadow-md hover:shadow-primary/30"
                  variant={(isLoggedIn && (currentTier === 'Pro' || currentTier === 'Pro Trial')) ? "default" : "secondary"}
                  onClick={tierDetails.Pro.cta.action}
                  disabled={tierDetails.Pro.cta.disabled}
                >
                  {proTierCtaIcon}
                  {tierDetails.Pro.cta.text}
                </Button>
              )}
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
