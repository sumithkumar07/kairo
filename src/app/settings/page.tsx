
'use client';

import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { User, ShieldCheck, Paintbrush, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { withAuth } from '@/components/auth/with-auth';

function SettingsPage() {
  const { user, currentTier } = useSubscription();

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col p-6 bg-muted/40">
        <section className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="max-w-2xl text-muted-foreground">Manage your account and application settings.</p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/>Account</CardTitle>
              <CardDescription>View your profile, subscription details, and log out.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Logged in as:</p>
                  <p className="font-semibold truncate">{user?.email || 'Guest'}</p>
                </div>
                 <div>
                  <p className="text-xs text-muted-foreground">Subscription:</p>
                  <p className="font-semibold">{currentTier}</p>
                </div>
              </div>
               <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/profile">Go to Profile <ArrowRight className="ml-2 h-4 w-4"/></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Paintbrush className="h-5 w-5 text-primary"/>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm font-medium">Theme</p>
              <ThemeToggle />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/>Subscription</CardTitle>
                <CardDescription>View plans and manage your current subscription.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm font-medium mb-3">You are currently on the <span className="font-bold text-primary">{currentTier}</span> plan.</p>
                 <Button asChild variant="outline" size="sm">
                    <Link href="/subscriptions">Manage Subscription <ArrowRight className="ml-2 h-4 w-4"/></Link>
                </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(SettingsPage);
