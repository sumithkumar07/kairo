'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, UserPlus, Sparkles, CheckCircle, ArrowRight, Shield, Award, Clock } from 'lucide-react';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

export default function SignupPage() {
  const { signup, isAuthLoading, isLoggedIn } = useSubscription();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isAuthLoading, isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signup(email, password);
    } catch (error) {
      console.error("Signup submission failed", error);
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
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                  <CardDescription className="text-base">
                    Start your 15-day premium trial. No credit card required.
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
                    placeholder="Create a secure password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-background/50 border-border/50 focus:border-primary/50 h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-6">
                <Button 
                  className="w-full h-11 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium" 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Creating Account...' : 'Create Account & Start Trial'}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Card>
          
          {/* Trial Benefits */}
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-full px-4 py-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">15-Day Premium Trial</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <Award className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Full Premium Access</p>
                  <p className="text-xs text-muted-foreground">All features unlocked for 15 days</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <Shield className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Enterprise Security</p>
                  <p className="text-xs text-muted-foreground">Bank-grade encryption & compliance</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <Clock className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">24/7 Expert Support</p>
                  <p className="text-xs text-muted-foreground">Get help whenever you need it</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:text-primary/80">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}