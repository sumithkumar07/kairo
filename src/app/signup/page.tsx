
'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

export default function SignupPage() {
  const { signup, isAuthLoading, isSupabaseConfigured, isLoggedIn } = useSubscription();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isAuthLoading, isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const redirectUrl = searchParams.get('redirect_url');
    await signup(email, password, redirectUrl);
    setIsLoading(false);
  };

  const isFormDisabled = isLoading || isAuthLoading || !isSupabaseConfigured;

  if (isAuthLoading || isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <MarketingHeader />
        <main className="flex-1 flex items-center justify-center bg-muted/40 p-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <MarketingFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MarketingHeader />
      <main className="flex-1 flex items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>Start your 15-day Pro trial. No credit card required.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isSupabaseConfigured && (
                <Alert variant="destructive" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300 [&>svg]:text-yellow-500 dark:[&>svg]:text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-semibold">Demo Mode Active</AlertTitle>
                  <AlertDescription className="text-xs">
                    Supabase is not configured. User creation is disabled.
                    You can explore the app with full features.{' '}
                    <Link href="/workflow" className="font-bold underline hover:opacity-80">
                      Go to editor.
                    </Link>
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isFormDisabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isFormDisabled}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit" disabled={isFormDisabled}>
                {(isLoading || isAuthLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign Up
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="underline text-primary hover:text-primary/80">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
      <MarketingFooter />
    </div>
  );
}
