'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';
import { 
  Loader2, 
  LogIn, 
  UserPlus, 
  ArrowRight, 
  CheckCircle, 
  Sparkles,
  Shield,
  Clock,
  Star,
  Zap,
  Brain,
  Workflow,
  Play,
  ChevronRight,
  Award,
  Target,
  Rocket,
  Users,
  Globe,
  Crown,
  Gift
} from 'lucide-react';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Kairo',
    description: 'Let\'s get you set up with everything you need',
    icon: Sparkles
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Tell us a bit about yourself and your goals',
    icon: Users
  },
  {
    id: 'workspace',
    title: 'Set Up Your Workspace', 
    description: 'Configure your team and project settings',
    icon: Globe
  },
  {
    id: 'first-workflow',
    title: 'Create Your First Workflow',
    description: 'Build your first automation with AI assistance',
    icon: Workflow
  }
];

const trialBenefits = [
  { 
    icon: Crown, 
    title: 'Full Premium Access',
    description: 'Unlimited workflows and executions for 15 days'
  },
  { 
    icon: Shield, 
    title: 'Enterprise Security',
    description: 'SOC 2 compliance and advanced encryption'
  },
  { 
    icon: Zap, 
    title: 'AI-Powered Features',
    description: 'Advanced AI workflow generation and optimization'
  },
  { 
    icon: Users, 
    title: '24/7 Expert Support',
    description: 'Priority support from our automation experts'
  }
];

export default function ConsolidatedAuthPage() {
  const { login, signup, isAuthLoading, isLoggedIn } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Form states
  const [signinForm, setSigninForm] = useState({
    email: '',
    password: ''
  });
  
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    role: '',
    agreeToTerms: false
  });

  // Form validation states
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    terms: ''
  });

  // Validate form in real-time
  const validateForm = () => {
    const errors = {
      name: '',
      email: '',
      password: '',
      terms: ''
    };

    if (!signupForm.name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!signupForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!signupForm.password) {
      errors.password = 'Password is required';
    } else if (signupForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!signupForm.agreeToTerms) {
      errors.terms = 'You must agree to the Terms of Service';
    }

    setFormErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  // Check if form is valid for button state
  const isFormValid = signupForm.name.trim() && 
                     signupForm.email.trim() && 
                     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email) &&
                     signupForm.password.length >= 8 && 
                     signupForm.agreeToTerms;

  const [onboardingForm, setOnboardingForm] = useState({
    goals: [],
    teamSize: '',
    industry: '',
    useCase: ''
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['signin', 'signup'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      const redirectUrl = searchParams.get('redirect_url');
      router.push(redirectUrl || '/dashboard');
    }
  }, [isAuthLoading, isLoggedIn, router, searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(signinForm.email, signinForm.password);
    } catch (error) {
      console.error("Sign in failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(signupForm.email, signupForm.password, signupForm.name);
      setShowOnboarding(true);
    } catch (error) {
      console.error("Sign up failed", error);
      // Clear form errors and show API error
      setFormErrors({
        name: '',
        email: '',
        password: '',
        terms: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      // Complete onboarding
      router.push('/dashboard');
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

  if (showOnboarding) {
    const currentStep = onboardingSteps[onboardingStep];
    const progressPercent = ((onboardingStep + 1) / onboardingSteps.length) * 100;

    return (
      <div className="flex flex-col min-h-screen bg-background">
        <MarketingHeader />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
          <div className="w-full max-w-2xl">
            {/* Progress Header */}
            <div className="mb-8 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <currentStep.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Step {onboardingStep + 1} of {onboardingSteps.length}</span>
                </div>
              </div>
              <Progress value={progressPercent} className="w-full max-w-md mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">{currentStep.title}</h1>
              <p className="text-muted-foreground text-lg">{currentStep.description}</p>
            </div>

            <Card className="shadow-2xl bg-card/95 backdrop-blur-sm border-border/50">
              <CardContent className="p-8">
                {onboardingStep === 0 && (
                  <div className="text-center space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold">Welcome to the Future of Automation! 🚀</h2>
                      <p className="text-muted-foreground text-lg">
                        You're about to experience the world's most advanced AI-powered workflow platform.
                        Let's get you set up in just a few quick steps.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      {trialBenefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <benefit.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{benefit.title}</h3>
                            <p className="text-sm text-muted-foreground">{benefit.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-2 text-base">
                      <Gift className="h-4 w-4 mr-2" />
                      15-Day Premium Trial - No Credit Card Required
                    </Badge>
                  </div>
                )}

                {onboardingStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          placeholder="Your company name"
                          value={onboardingForm.teamSize}
                          onChange={(e) => setOnboardingForm(prev => ({ ...prev, teamSize: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Your Role</Label>
                        <Input
                          id="role"
                          placeholder="e.g. CTO, Marketing Manager"
                          value={onboardingForm.industry}
                          onChange={(e) => setOnboardingForm(prev => ({ ...prev, industry: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>What's your primary goal with automation?</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          'Save time on repetitive tasks',
                          'Improve team productivity',
                          'Reduce manual errors',
                          'Scale business operations',
                          'Integrate existing tools',
                          'Generate more leads'
                        ].map((goal) => (
                          <div key={goal} className="flex items-center space-x-2">
                            <Checkbox id={goal} />
                            <Label htmlFor={goal} className="text-sm">{goal}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {onboardingStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold mb-2">Set Up Your Workspace</h3>
                      <p className="text-muted-foreground">Configure your team settings and preferences</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Team Size</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {['Just me', '2-10', '11-50', '50+'].map((size) => (
                            <Button
                              key={size}
                              variant="outline"
                              className="h-auto p-4 flex flex-col"
                              onClick={() => setOnboardingForm(prev => ({ ...prev, teamSize: size }))}
                            >
                              <Users className="h-5 w-5 mb-2" />
                              <span>{size}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Industry</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {['Technology', 'Marketing', 'Sales', 'E-commerce', 'Healthcare', 'Finance'].map((industry) => (
                            <Button
                              key={industry}
                              variant="outline"
                              className="h-auto p-3"
                              onClick={() => setOnboardingForm(prev => ({ ...prev, industry }))}
                            >
                              {industry}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {onboardingStep === 3 && (
                  <div className="text-center space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">Ready to Create Magic? ✨</h3>
                      <p className="text-muted-foreground text-lg">
                        Your workspace is configured! Time to build your first AI-powered workflow.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-primary/20">
                        <div className="text-center space-y-2">
                          <div className="p-2 bg-primary/10 rounded-lg inline-block">
                            <Brain className="h-6 w-6 text-primary" />
                          </div>
                          <h4 className="font-semibold">AI Generation</h4>
                          <p className="text-sm text-muted-foreground">Describe your automation in natural language</p>
                        </div>
                      </Card>
                      
                      <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-primary/20">
                        <div className="text-center space-y-2">
                          <div className="p-2 bg-primary/10 rounded-lg inline-block">
                            <Workflow className="h-6 w-6 text-primary" />
                          </div>
                          <h4 className="font-semibold">Visual Builder</h4>
                          <p className="text-sm text-muted-foreground">Drag and drop to create workflows</p>
                        </div>
                      </Card>
                      
                      <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-primary/20">
                        <div className="text-center space-y-2">
                          <div className="p-2 bg-primary/10 rounded-lg inline-block">
                            <Rocket className="h-6 w-6 text-primary" />
                          </div>
                          <h4 className="font-semibold">Templates</h4>
                          <p className="text-sm text-muted-foreground">Start with pre-built workflows</p>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setOnboardingStep(Math.max(0, onboardingStep - 1))}
                    disabled={onboardingStep === 0}
                  >
                    Previous
                  </Button>
                  
                  <Button onClick={handleOnboardingNext}>
                    {onboardingStep === onboardingSteps.length - 1 ? 'Get Started' : 'Continue'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="text-center space-y-4">
                <div className="p-4 bg-gradient-to-r from-primary to-purple-600 rounded-full inline-block mx-auto">
                  {activeTab === 'signin' ? (
                    <LogIn className="h-8 w-8 text-white" />
                  ) : (
                    <UserPlus className="h-8 w-8 text-white" />
                  )}
                </div>
                
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-6">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold">Welcome Back</h1>
                      <p className="text-muted-foreground">
                        Enter your credentials to access your automation dashboard
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email Address</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        value={signinForm.email}
                        onChange={(e) => setSigninForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={isSubmitting}
                        className="bg-background/50 border-border/50 focus:border-primary/50 h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        value={signinForm.password}
                        onChange={(e) => setSigninForm(prev => ({ ...prev, password: e.target.value }))}
                        disabled={isSubmitting}
                        className="bg-background/50 border-border/50 focus:border-primary/50 h-11"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <Label htmlFor="remember" className="text-sm">Remember me</Label>
                      </div>
                      <Button variant="link" className="p-0 h-auto text-sm">
                        Forgot password?
                      </Button>
                    </div>
                  </CardContent>
                  
                  <CardContent className="pt-0">
                    <Button 
                      className="w-full h-11 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium" 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? 'Signing In...' : 'Sign In'}
                      {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </CardContent>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-6">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold">Create Your Account</h1>
                      <p className="text-muted-foreground">
                        Start your 15-day premium trial - no credit card required
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name *</Label>
                        <Input
                          id="signup-name"
                          placeholder="Enter your full name"
                          required
                          value={signupForm.name}
                          onChange={(e) => {
                            setSignupForm(prev => ({ ...prev, name: e.target.value }));
                            if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                          }}
                          disabled={isSubmitting}
                          className={`bg-background/50 border-border/50 focus:border-primary/50 h-11 ${
                            formErrors.name ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />
                        {formErrors.name && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-company">Company</Label>
                        <Input
                          id="signup-company"
                          placeholder="Your company name"
                          value={signupForm.company}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, company: e.target.value }))}
                          disabled={isSubmitting}
                          className="bg-background/50 border-border/50 focus:border-primary/50 h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address *</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        value={signupForm.email}
                        onChange={(e) => {
                          setSignupForm(prev => ({ ...prev, email: e.target.value }));
                          if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                        }}
                        disabled={isSubmitting}
                        className={`bg-background/50 border-border/50 focus:border-primary/50 h-11 ${
                          formErrors.email ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password *</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a strong password"
                        required
                        value={signupForm.password}
                        onChange={(e) => {
                          setSignupForm(prev => ({ ...prev, password: e.target.value }));
                          if (formErrors.password) setFormErrors(prev => ({ ...prev, password: '' }));
                        }}
                        disabled={isSubmitting}
                        className={`bg-background/50 border-border/50 focus:border-primary/50 h-11 ${
                          formErrors.password ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      {formErrors.password ? (
                        <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Password must be at least 8 characters long
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="terms" 
                          required
                          checked={signupForm.agreeToTerms}
                          onCheckedChange={(checked) => {
                            setSignupForm(prev => ({ ...prev, agreeToTerms: !!checked }));
                            if (formErrors.terms) setFormErrors(prev => ({ ...prev, terms: '' }));
                          }}
                          className={formErrors.terms ? 'border-red-500' : ''}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="terms" className="text-sm leading-relaxed">
                            I agree to the <Button variant="link" className="p-0 h-auto text-sm underline">Terms of Service</Button> and <Button variant="link" className="p-0 h-auto text-sm underline">Privacy Policy</Button>
                          </Label>
                          {formErrors.terms && (
                            <p className="text-sm text-red-500">{formErrors.terms}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardContent className="pt-0">
                    <Button 
                      className={`w-full h-11 font-medium transition-all duration-200 ${
                        isFormValid && !isSubmitting
                          ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl' 
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                      type="submit" 
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? 'Creating Account...' : 'Start Free Trial'}
                      {!isSubmitting && isFormValid && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </CardContent>
                </form>
              </TabsContent>
            </Tabs>
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