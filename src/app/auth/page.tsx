'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Gift,
  Eye,
  EyeOff,
  AlertCircle,
  Copy,
  KeyRound,
  TestTube,
  Verified,
  HelpCircle,
  Info,
  Atom,
  Infinity,
  Database,
  Code2,
  MousePointer,
  TrendingUp,
  LineChart,
  PieChart,
  BarChart3,
  Monitor
} from 'lucide-react';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Kairo',
    description: 'Let\'s get you set up with everything you need',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Tell us a bit about yourself and your goals',
    icon: Users,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'workspace',
    title: 'Set Up Your Workspace', 
    description: 'Configure your team and project settings',
    icon: Globe,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'first-workflow',
    title: 'Create Your First Workflow',
    description: 'Build your first automation with AI assistance',
    icon: Workflow,
    color: 'from-orange-500 to-red-500'
  }
];

const trialBenefits = [
  { 
    icon: Crown, 
    title: 'Full Premium Access',
    description: 'Unlimited workflows and executions for 15 days',
    color: 'from-yellow-500 to-orange-500'
  },
  { 
    icon: Shield, 
    title: 'Enterprise Security',
    description: 'SOC 2 compliance and advanced encryption',
    color: 'from-blue-500 to-indigo-500'
  },
  { 
    icon: Brain, 
    title: 'AI-Powered Features',
    description: 'Advanced AI workflow generation and optimization',
    color: 'from-purple-500 to-pink-500'
  },
  { 
    icon: Users, 
    title: '24/7 Expert Support',
    description: 'Priority support from our automation experts',
    color: 'from-green-500 to-teal-500'
  }
];

const demoFeatures = [
  { icon: TestTube, label: 'Full Testing Access', description: 'Test all premium features' },
  { icon: Database, label: 'Sample Data Included', description: '3 notifications, 3 courses, 2 certifications' },
  { icon: Zap, label: 'God-Tier Features', description: 'Reality Fabricator, Quantum Simulation' },
  { icon: Award, label: 'Diamond Subscription', description: '365-day trial period' }
];

export default function ConsolidatedAuthPage() {
  const { login, signup, isAuthLoading, isLoggedIn } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoInfo, setShowDemoInfo] = useState(false);
  
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

  // Simplified validation states
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    terms: ''
  });

  // Auth error states
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Demo account credentials
  const demoCredentials = {
    email: 'demo.user.2025@kairo.test',
    password: 'DemoAccess2025!'
  };

  // Copy demo credentials to form
  const useDemoCredentials = () => {
    setSigninForm(demoCredentials);
    setAuthError('');
    setActiveTab('signin');
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Simplified validation function
  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'name':
        newErrors.name = !value || value.trim().length < 2 ? 'Name must be at least 2 characters' : '';
        break;
      case 'email':
        newErrors.email = !value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Valid email required' : '';
        break;
      case 'password':
        newErrors.password = !value || value.length < 8 ? 'Password must be at least 8 characters' : '';
        break;
      case 'terms':
        newErrors.terms = !value ? 'You must agree to the terms' : '';
        break;
    }
    
    setErrors(newErrors);
  };

  // Simplified form validation with useMemo for performance
  const isFormValid = useMemo(() => {
    const hasValidName = signupForm.name.trim().length >= 2;
    const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email);
    const hasValidPassword = signupForm.password.length >= 8;
    const hasAgreedToTerms = signupForm.agreeToTerms;
    const hasNoErrors = !errors.name && !errors.email && !errors.password && !errors.terms;
    
    return hasValidName && hasValidEmail && hasValidPassword && hasAgreedToTerms && hasNoErrors;
  }, [signupForm.name, signupForm.email, signupForm.password, signupForm.agreeToTerms, errors]);

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
    setAuthError('');
    setAuthSuccess('');
    
    try {
      await login(signinForm.email, signinForm.password);
      setAuthSuccess('Successfully signed in! Redirecting...');
    } catch (error: any) {
      console.error("Sign in failed", error);
      setAuthError(error.message || 'Sign in failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    validateField('name', signupForm.name);
    validateField('email', signupForm.email);
    validateField('password', signupForm.password);
    validateField('terms', signupForm.agreeToTerms);
    
    // Check if form is valid after validation
    if (!isFormValid) {
      setAuthError('Please fill in all required fields correctly.');
      return;
    }

    setIsSubmitting(true);
    setAuthError('');
    setAuthSuccess('');
    
    try {
      await signup(signupForm.email, signupForm.password, signupForm.name);
      setAuthSuccess('Account created successfully! Setting up your workspace...');
      setShowOnboarding(true);
    } catch (error: any) {
      console.error("Sign up failed", error);
      const errorMessage = error.message || 'Account creation failed. Please try again.';
      
      // Handle specific error cases
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        setAuthError('An account with this email address already exists. Please sign in instead.');
      } else {
        setAuthError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (field === 'name') {
      setSignupForm(prev => ({ ...prev, name: value }));
      validateField('name', value);
    } else if (field === 'email') {
      setSignupForm(prev => ({ ...prev, email: value }));
      validateField('email', value);
    } else if (field === 'password') {
      setSignupForm(prev => ({ ...prev, password: value }));
      validateField('password', value);
    } else if (field === 'agreeToTerms') {
      setSignupForm(prev => ({ ...prev, agreeToTerms: value }));
      validateField('terms', value);
    }
    
    // Clear auth errors when user starts typing
    if (authError) setAuthError('');
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
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse" />
            </div>
            <p className="text-muted-foreground">Loading your workspace...</p>
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
            {/* Enhanced Progress Header */}
            <div className="mb-8 text-center">
              <div className="mb-4">
                <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${currentStep.color} bg-opacity-10 rounded-full border border-primary/20`}>
                  <currentStep.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Step {onboardingStep + 1} of {onboardingSteps.length}</span>
                </div>
              </div>
              <Progress value={progressPercent} className="w-full max-w-md mx-auto mb-4 h-2" />
              <h1 className="text-3xl font-bold mb-2">{currentStep.title}</h1>
              <p className="text-muted-foreground text-lg">{currentStep.description}</p>
            </div>

            <Card className="shadow-2xl bg-card/95 backdrop-blur-sm border-border/50 hover:shadow-3xl transition-shadow duration-300">
              <CardContent className="p-8">
                {onboardingStep === 0 && (
                  <div className="text-center space-y-6">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Welcome to the Future</span>
                      </div>
                      <h2 className="text-2xl font-bold">Welcome to the Future of Automation! 🚀</h2>
                      <p className="text-muted-foreground text-lg">
                        You're about to experience the world's most advanced AI-powered workflow platform.
                        Let's get you set up in just a few quick steps.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      {trialBenefits.map((benefit, index) => (
                        <div key={index} className="group hover:scale-105 transition-transform duration-300">
                          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <div className={`p-2 bg-gradient-to-r ${benefit.color} rounded-lg shadow-md`}>
                              <benefit.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold mb-1">{benefit.title}</h3>
                              <p className="text-sm text-muted-foreground">{benefit.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 text-base">
                        <Gift className="h-4 w-4 mr-2" />
                        15-Day Premium Trial - No Credit Card Required
                      </Badge>
                      
                      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>No commitment</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Cancel anytime</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Full access</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {onboardingStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold mb-2">Tell us about yourself</h3>
                      <p className="text-muted-foreground">This helps us personalize your experience</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          placeholder="Your company name"
                          value={onboardingForm.teamSize}
                          onChange={(e) => setOnboardingForm(prev => ({ ...prev, teamSize: e.target.value }))}
                          className="transition-all duration-300 focus:scale-105"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Your Role</Label>
                        <Input
                          id="role"
                          placeholder="e.g. CTO, Marketing Manager"
                          value={onboardingForm.industry}
                          onChange={(e) => setOnboardingForm(prev => ({ ...prev, industry: e.target.value }))}
                          className="transition-all duration-300 focus:scale-105"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
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
                          <div key={goal} className="flex items-center space-x-2 p-2 hover:bg-muted/30 rounded-lg transition-colors">
                            <Checkbox id={goal} />
                            <Label htmlFor={goal} className="text-sm cursor-pointer">{goal}</Label>
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
                    
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label>Team Size</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: 'Just me', icon: Users, users: '1' },
                            { label: '2-10', icon: Users, users: '2-10' },
                            { label: '11-50', icon: Users, users: '11-50' },
                            { label: '50+', icon: Users, users: '50+' }
                          ].map((size) => (
                            <Button
                              key={size.label}
                              variant="outline"
                              className="h-auto p-4 flex flex-col hover:scale-105 transition-transform duration-300"
                              onClick={() => setOnboardingForm(prev => ({ ...prev, teamSize: size.label }))}
                            >
                              <size.icon className="h-5 w-5 mb-2" />
                              <span className="text-sm">{size.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label>Industry</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { name: 'Technology', icon: Code2 },
                            { name: 'Marketing', icon: Target },
                            { name: 'Sales', icon: TrendingUp },
                            { name: 'E-commerce', icon: Database },
                            { name: 'Healthcare', icon: Shield },
                            { name: 'Finance', icon: LineChart }
                          ].map((industry) => (
                            <Button
                              key={industry.name}
                              variant="outline"
                              className="h-auto p-3 flex items-center gap-2 hover:scale-105 transition-transform duration-300"
                              onClick={() => setOnboardingForm(prev => ({ ...prev, industry: industry.name }))}
                            >
                              <industry.icon className="h-4 w-4" />
                              <span className="text-sm">{industry.name}</span>
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
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Setup Complete</span>
                      </div>
                      <h3 className="text-2xl font-bold">Ready to Create Magic? ✨</h3>
                      <p className="text-muted-foreground text-lg">
                        Your workspace is configured! Time to build your first AI-powered workflow.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { icon: Brain, title: 'AI Generation', description: 'Describe your automation in natural language', color: 'from-purple-500 to-pink-500' },
                        { icon: Workflow, title: 'Visual Builder', description: 'Drag and drop to create workflows', color: 'from-blue-500 to-cyan-500' },
                        { icon: Rocket, title: 'Templates', description: 'Start with pre-built workflows', color: 'from-orange-500 to-red-500' }
                      ].map((option, index) => (
                        <Card key={index} className="p-4 hover:shadow-lg transition-all cursor-pointer border-primary/20 group hover:scale-105">
                          <div className="text-center space-y-3">
                            <div className={`p-3 bg-gradient-to-r ${option.color} rounded-lg inline-block shadow-lg group-hover:scale-110 transition-transform`}>
                              <option.icon className="h-6 w-6 text-white" />
                            </div>
                            <h4 className="font-semibold">{option.title}</h4>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setOnboardingStep(Math.max(0, onboardingStep - 1))}
                    disabled={onboardingStep === 0}
                    className="hover:scale-105 transition-transform duration-300"
                  >
                    Previous
                  </Button>
                  
                  <Button 
                    onClick={handleOnboardingNext}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 hover:scale-105 transition-all duration-300"
                  >
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
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left side - Demo Account Info */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2">
                  <TestTube className="h-4 w-4 mr-2" />
                  Demo Account Ready
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Try Kairo AI with
                  <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Full Access Demo
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Experience all premium features with our pre-configured demo account. 
                  No signup required - just login and explore!
                </p>
              </div>

              {/* Demo Credentials Card */}
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <KeyRound className="h-5 w-5" />
                    Demo Account Credentials
                  </CardTitle>
                  <CardDescription>
                    Ready-to-use account with Diamond subscription and sample data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p className="font-mono text-sm">{demoCredentials.email}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(demoCredentials.email)}
                        className="hover:scale-105 transition-transform"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div>
                        <Label className="text-xs text-muted-foreground">Password</Label>
                        <p className="font-mono text-sm">{demoCredentials.password}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(demoCredentials.password)}
                        className="hover:scale-105 transition-transform"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={useDemoCredentials}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105 transition-all duration-300"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Use Demo Account
                  </Button>
                </CardContent>
              </Card>

              {/* Demo Features */}
              <div className="grid grid-cols-2 gap-3">
                {demoFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <feature.icon className="h-4 w-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{feature.label}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Auth Form */}
            <div className="w-full max-w-md mx-auto">
              <Card className="shadow-2xl bg-card/95 backdrop-blur-sm border-border/50 hover:shadow-3xl transition-shadow duration-300">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <CardHeader className="text-center space-y-4">
                    <div className="p-4 bg-gradient-to-r from-primary to-purple-600 rounded-full inline-block mx-auto shadow-lg">
                      {activeTab === 'signin' ? (
                        <LogIn className="h-8 w-8 text-white" />
                      ) : (
                        <UserPlus className="h-8 w-8 text-white" />
                      )}
                    </div>
                    
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin" className="hover:scale-105 transition-transform">Sign In</TabsTrigger>
                      <TabsTrigger value="signup" className="hover:scale-105 transition-transform">Sign Up</TabsTrigger>
                    </TabsList>
                  </CardHeader>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn}>
                      <CardContent className="space-y-6">
                        <div className="text-center mb-6">
                          <h2 className="text-2xl font-bold">Welcome Back</h2>
                          <p className="text-muted-foreground">
                            Enter your credentials to access your automation dashboard
                          </p>
                        </div>

                        {/* Enhanced Auth Messages */}
                        {authError && (
                          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 animate-in slide-in-from-top">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
                          </div>
                        )}
                        
                        {authSuccess && (
                          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3 animate-in slide-in-from-top">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-green-600 dark:text-green-400">{authSuccess}</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="signin-email">Email Address</Label>
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="Enter your email"
                            required
                            value={signinForm.email}
                            onChange={(e) => {
                              setSigninForm(prev => ({ ...prev, email: e.target.value }));
                              if (authError) setAuthError('');
                            }}
                            disabled={isSubmitting}
                            className="bg-background/50 border-border/50 focus:border-primary/50 h-11 transition-all duration-300 focus:scale-105"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signin-password">Password</Label>
                          <div className="relative">
                            <Input
                              id="signin-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              required
                              value={signinForm.password}
                              onChange={(e) => {
                                setSigninForm(prev => ({ ...prev, password: e.target.value }));
                                if (authError) setAuthError('');
                              }}
                              disabled={isSubmitting}
                              className="bg-background/50 border-border/50 focus:border-primary/50 h-11 pr-10 transition-all duration-300 focus:scale-105"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors hover:scale-110"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="remember" />
                            <Label htmlFor="remember" className="text-sm cursor-pointer">Remember me</Label>
                          </div>
                          <Button variant="link" className="p-0 h-auto text-sm hover:scale-105 transition-transform">
                            Forgot password?
                          </Button>
                        </div>
                      </CardContent>
                      
                      <CardContent className="pt-0">
                        <Button 
                          className="w-full h-11 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg" 
                          type="submit" 
                          disabled={isSubmitting || !signinForm.email || !signinForm.password}
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
                          <h2 className="text-2xl font-bold">Create Your Account</h2>
                          <p className="text-muted-foreground">
                            Start your 15-day premium trial - no credit card required
                          </p>
                        </div>

                        {/* Enhanced Auth Messages */}
                        {authError && (
                          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 animate-in slide-in-from-top">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
                          </div>
                        )}
                        
                        {authSuccess && (
                          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3 animate-in slide-in-from-top">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-green-600 dark:text-green-400">{authSuccess}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="signup-name">Full Name *</Label>
                            <Input
                              id="signup-name"
                              placeholder="Enter your full name"
                              required
                              value={signupForm.name}
                              onChange={(e) => handleFieldChange('name', e.target.value)}
                              disabled={isSubmitting}
                              className={`bg-background/50 border-border/50 focus:border-primary/50 h-11 transition-all duration-300 focus:scale-105 ${
                                errors.name ? 'border-red-500 focus:border-red-500' : ''
                              }`}
                            />
                            {errors.name && (
                              <p className="text-sm text-red-500 mt-1 flex items-center gap-1 animate-in slide-in-from-left">
                                <AlertCircle className="h-3 w-3" />
                                {errors.name}
                              </p>
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
                              className="bg-background/50 border-border/50 focus:border-primary/50 h-11 transition-all duration-300 focus:scale-105"
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
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            disabled={isSubmitting}
                            className={`bg-background/50 border-border/50 focus:border-primary/50 h-11 transition-all duration-300 focus:scale-105 ${
                              errors.email ? 'border-red-500 focus:border-red-500' : ''
                            }`}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1 animate-in slide-in-from-left">
                              <AlertCircle className="h-3 w-3" />
                              {errors.email}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password *</Label>
                          <div className="relative">
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              required
                              value={signupForm.password}
                              onChange={(e) => handleFieldChange('password', e.target.value)}
                              disabled={isSubmitting}
                              className={`bg-background/50 border-border/50 focus:border-primary/50 h-11 pr-10 transition-all duration-300 focus:scale-105 ${
                                errors.password ? 'border-red-500 focus:border-red-500' : ''
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors hover:scale-110"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {errors.password ? (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1 animate-in slide-in-from-left">
                              <AlertCircle className="h-3 w-3" />
                              {errors.password}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Password must be at least 8 characters
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <Checkbox 
                              id="terms" 
                              required
                              checked={signupForm.agreeToTerms}
                              onCheckedChange={(checked) => handleFieldChange('agreeToTerms', !!checked)}
                              className={`transition-all duration-200 hover:scale-110 ${
                                errors.terms ? 'border-red-500' : ''
                              }`}
                            />
                            <div className="space-y-1">
                              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                                I agree to the <Button variant="link" className="p-0 h-auto text-sm underline hover:scale-105 transition-transform">Terms of Service</Button> and <Button variant="link" className="p-0 h-auto text-sm underline hover:scale-105 transition-transform">Privacy Policy</Button>
                              </Label>
                              {errors.terms && (
                                <p className="text-sm text-red-500 flex items-center gap-1 animate-in slide-in-from-left">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.terms}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardContent className="pt-0">
                        <Button 
                          className={`w-full h-11 font-medium transition-all duration-300 transform ${
                            isFormValid && !isSubmitting
                              ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95' 
                              : 'bg-muted/50 text-muted-foreground cursor-not-allowed border border-border/50'
                          }`}
                          type="submit" 
                          disabled={!isFormValid || isSubmitting}
                        >
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isSubmitting ? 'Creating Account...' : 'Start Free Trial'}
                          {!isSubmitting && isFormValid && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                        
                        {/* Form validation summary */}
                        {!isFormValid && (errors.name || errors.email || errors.password || errors.terms) && (
                          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg animate-in slide-in-from-bottom">
                            <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Please complete all required fields correctly to continue.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </form>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}