
'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionsPage() {
  const { currentTier, features, upgradeToPro, isProTier } = useSubscription();

  const tierDetails = {
    Free: {
      name: 'Free Tier',
      price: '$0/month',
      description: 'Get started with basic workflow automation and AI assistance.',
      features: [
        `AI Workflow Generations: ${features.aiWorkflowGenerationsPerDay} per day`,
        'Basic Node Library Access',
        'Limited Workflow Execution',
        'Community Support',
      ],
      cta: {
        text: 'You are on the Free Tier',
        disabled: true,
      },
    },
    Pro: {
      name: 'Pro Tier',
      price: '$29/month (Example Price)',
      description: 'Unlock the full power of FlowAI Studio with unlimited features and priority support.',
      features: [
        `AI Workflow Generations: Unlimited`,
        'AI Workflow Explanations & Advanced Suggestions',
        'Full Node Library Access (including advanced nodes)',
        'Unlimited Workflow Executions',
        'Priority Email Support',
      ],
      cta: {
        text: isProTier ? 'Currently on Pro Tier' : 'Upgrade to Pro',
        disabled: isProTier,
        action: !isProTier ? upgradeToPro : undefined,
      },
    },
  };

  const currentTierInfo = tierDetails[currentTier];
  const proTierInfo = tierDetails.Pro;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-primary flex items-center">
            <Zap className="h-8 w-8 mr-2" />
            FlowAI Studio
          </Link>
          <nav>
            <Link href="/workflow" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Workflow Editor
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Choose Your FlowAI Plan
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Unlock powerful AI automation features tailored to your needs.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier Card */}
          <Card className={cn("flex flex-col shadow-lg", !isProTier && "border-2 border-primary ring-4 ring-primary/20")}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-semibold text-primary">{tierDetails.Free.name}</CardTitle>
                {!isProTier && <span className="px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary rounded-full">Current Plan</span>}
              </div>
              <CardDescription className="text-sm">{tierDetails.Free.description}</CardDescription>
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
            <CardFooter className="mt-auto">
              <Button
                className="w-full text-base py-6"
                variant={!isProTier ? "default" : "outline"}
                disabled={tierDetails.Free.cta.disabled}
              >
                {tierDetails.Free.cta.text}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Tier Card */}
          <Card className={cn("flex flex-col shadow-lg", isProTier && "border-2 border-primary ring-4 ring-primary/20")}>
            <CardHeader className="pb-4 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-t-lg">
               <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 text-amber-400" />
                    <CardTitle className="text-2xl font-semibold text-primary">{proTierInfo.name}</CardTitle>
                </div>
                {isProTier && <span className="px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary rounded-full">Current Plan</span>}
              </div>
              <CardDescription className="text-sm">{proTierInfo.description}</CardDescription>
              <p className="text-3xl font-bold text-foreground pt-2">{proTierInfo.price}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2.5 text-sm">
                {proTierInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <ShieldCheck className="h-4 w-4 text-primary mr-2.5 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                className="w-full text-base py-6"
                variant={isProTier ? "default" : "secondary"}
                onClick={proTierInfo.cta.action}
                disabled={proTierInfo.cta.disabled}
              >
                {proTierInfo.cta.text}
              </Button>
            </CardFooter>
          </Card>
        </div>
         <section className="text-center mt-16">
            <p className="text-muted-foreground text-sm">
                Need a custom solution or enterprise features? <Link href="/contact" className="text-primary hover:underline">Contact Us</Link>.
            </p>
        </section>
      </main>

      <footer className="text-center py-10 border-t mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} FlowAI Studio. Automate intelligently.
        </p>
      </footer>
    </div>
  );
}
