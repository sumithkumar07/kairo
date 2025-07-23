'use client';

import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { User, ShieldCheck, Paintbrush, ArrowRight, Mail, CalendarDays, LogOut, Edit } from 'lucide-react';
import Link from 'next/link';
import { withAuth } from '@/components/auth/with-auth';

function AccountPage() {
  const { 
    user, 
    logout,
    currentTier, 
    trialEndDate, 
    daysRemainingInTrial,
    hasProFeatures,
  } = useSubscription();

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col p-6 bg-muted/40">
        <section className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
          <p className="max-w-2xl text-muted-foreground">Manage your account, profile, and application settings.</p>
        </section>

        <div className="space-y-8">
          {/* Profile Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary"/>
                    Email Address
                  </CardTitle>
                  <CardDescription>Your primary email address for account access</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-lg break-all">{user?.email || 'Not available'}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary"/>
                    Subscription Status
                  </CardTitle>
                  <CardDescription>Your current plan and subscription details</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-lg">{currentTier}</p>
                  {hasProFeatures && trialEndDate && currentTier === 'Gold Trial' && (
                    <div className="mt-3 p-3 border border-amber-500/30 rounded-lg bg-amber-500/10">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-amber-600" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            Trial ends: {trialEndDate.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            ({daysRemainingInTrial !== null ? `${daysRemainingInTrial} day${daysRemainingInTrial !== 1 ? 's' : ''} remaining` : 'Calculating...'})
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/subscriptions">
                      <Edit className="mr-2 h-4 w-4" />
                      Manage Subscription
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Application Settings */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Application Settings</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Paintbrush className="h-5 w-5 text-primary"/>
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize the look and feel of the application</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-sm font-medium">Theme</p>
                  <ThemeToggle />
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary"/>
                    Security
                  </CardTitle>
                  <CardDescription>Manage security settings and access</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">Secure your account and manage permissions</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/security">
                      Security Settings <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary"/>
                    Account Actions
                  </CardTitle>
                  <CardDescription>Account management and logout options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/billing">
                      <Edit className="mr-2 h-4 w-4" />
                      Billing Settings
                    </Link>
                  </Button>
                  <Button 
                    onClick={logout} 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(AccountPage);
