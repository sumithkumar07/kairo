
'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, ShieldCheck, CalendarDays, LogOut, Edit } from 'lucide-react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';

function ProfilePage() {
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
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/40">
        <Card className="w-full max-w-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out hover:scale-[1.01]">
          <CardHeader className="text-center border-b pb-4">
            <User className="h-16 w-16 text-primary mx-auto mb-3 p-2 bg-primary/10 rounded-full" />
            <CardTitle className="text-2xl">User Profile</CardTitle>
            <CardDescription>Manage your account details and subscription.</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-5 pt-6">
            <div className="p-4 border rounded-lg bg-muted/40 shadow-sm">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email Address</p>
                  <p className="font-medium text-foreground break-all">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/40 shadow-sm">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Subscription Tier</p>
                  <p className="font-medium text-foreground">{currentTier}</p>
                </div>
              </div>
            </div>

            {hasProFeatures && trialEndDate && currentTier === 'Gold Trial' && (
              <div className="p-4 border border-amber-500/30 rounded-lg bg-amber-500/10 shadow-sm">
                <div className="flex items-center space-x-3">
                  <CalendarDays className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs text-amber-700 dark:text-amber-300">Gold Trial Ends</p>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      {trialEndDate.toLocaleDateString()} ({daysRemainingInTrial !== null ? `${daysRemainingInTrial} day${daysRemainingInTrial !== 1 ? 's' : ''} remaining` : 'Calculating...'})
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t pt-6">
            <Button asChild className="w-full" variant="default">
              <Link href="/subscriptions">
                <Edit className="mr-2 h-4 w-4" /> Manage Subscription
              </Link>
            </Button>
             <Button onClick={logout} variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}


export default withAuth(ProfilePage);
