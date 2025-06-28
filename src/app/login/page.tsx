
'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Workflow, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const { login, isAuthLoading, isFirebaseConfigured } = useSubscription();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('user@kairo.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const redirectUrl = searchParams.get('redirect_url');
    await login(email, password, redirectUrl);
    setIsLoading(false);
  };

  const isFormDisabled = isLoading || isAuthLoading || !isFirebaseConfigured;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2 transition-opacity hover:opacity-80">
          <Workflow className="h-6 w-6" />
          Kairo
        </Link>
      </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isFirebaseConfigured && (
              <Alert variant="destructive" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300 [&>svg]:text-yellow-500 dark:[&>svg]:text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-semibold">Demo Mode Active</AlertTitle>
                <AlertDescription className="text-xs">
                  Firebase is not configured. Real authentication is disabled.
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
              Log In
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline text-primary hover:text-primary/80">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
