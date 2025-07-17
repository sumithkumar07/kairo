'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, LogIn, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

export default function LoginPage() {
  const { login, isAuthLoading, isLoggedIn } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      const redirectUrl = searchParams.get('redirect_url');
      router.push(redirectUrl || '/dashboard');
    }
  }, [isAuthLoading, isLoggedIn, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error("Login submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading && !isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <MarketingHeader />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <MarketingFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MarketingHeader />
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl bg-card/95 backdrop-blur-sm border-border/50">
            <form onSubmit={handleSubmit}>
              <CardHeader className="text-center space-y-4">
                <div className="p-4 bg-gradient-to-r from-primary to-purple-600 rounded-full inline-block mx-auto">
                  <LogIn className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                  <CardDescription className="text-base">
                    Enter your credentials to access your workflow automation dashboard.
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-background/50 border-border/50 focus:border-primary/50 h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-background/50 border-border/50 focus:border-primary/50 h-11"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-6">
                <Button 
                  className="w-full h-11 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium" 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">
                      Sign up for free
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Card>
          
          {/* Trust Indicators */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>24/7 Support</span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Trusted by thousands of companies worldwide
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}