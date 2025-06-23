
'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, ShieldCheck, CalendarDays, LogOut, Workflow } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { 
    user, 
    isLoggedIn, 
    logout, 
    currentTier, 
    trialEndDate, 
    daysRemainingInTrial,
    isProOrTrial,
  } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Loading Profile...</CardTitle>
            <CardDescription>Please wait or log in.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
             <User className="h-12 w-12 text-primary mx-auto animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-primary flex items-center">
            <Workflow className="h-8 w-8 mr-2" />
            Kairo
          </Link>
          <nav className="space-x-4">
             <Button variant="ghost" asChild>
                <Link href="/workflow">
                    Workflow Editor
                </Link>
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
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
                  <p className="font-medium text-foreground break-all">{user.email}</p>
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

            {isProOrTrial && trialEndDate && currentTier === 'Pro Trial' && (
              <div className="p-4 border border-accent/40 rounded-lg bg-accent/10 shadow-sm">
                <div className="flex items-center space-x-3">
                  <CalendarDays className="h-5 w-5 text-accent-foreground/80 shrink-0" />
                  <div>
                    <p className="text-xs text-accent-foreground/70">Pro Trial Ends</p>
                    <p className="font-medium text-accent-foreground/90">
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
                <ShieldCheck className="mr-2 h-4 w-4" /> Manage Subscription
              </Link>
            </Button>
             <Button onClick={logout} variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardFooter>
        </Card>
      </main>

      <footer className="text-center py-10 border-t mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Kairo. Automate intelligently.
        </p>
      </footer>
    </div>
  );
}
