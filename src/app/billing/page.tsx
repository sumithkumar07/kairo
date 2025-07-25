'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withAuth } from '@/components/auth/with-auth';
import { AppLayout } from '@/components/app-layout';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  ArrowUpCircle,
  CheckCircle,
  AlertTriangle,
  Zap,
  Crown,
  Shield,
  Users,
  Clock,
  FileText
} from 'lucide-react';

// Mock data - in real app this would come from API
const currentPlan = {
  name: 'Gold',
  price: '$9',
  period: 'month',
  status: 'active',
  nextBilling: '2024-02-15',
  trialEnds: null
};

const usage = {
  workflows: { current: 12, limit: 20 },
  monthlyRuns: { current: 847, limit: 2000 },
  aiGenerations: { current: 23, limit: 100 },
  storage: { current: 2.1, limit: 10 }, // GB
  teamMembers: { current: 1, limit: 3 }
};

const invoices = [
  {
    id: 'inv_001',
    date: '2024-01-15',
    amount: '$9.00',
    status: 'paid',
    period: 'Jan 15 - Feb 14, 2024'
  },
  {
    id: 'inv_002', 
    date: '2023-12-15',
    amount: '$9.00',
    status: 'paid',
    period: 'Dec 15, 2023 - Jan 14, 2024'
  },
  {
    id: 'inv_003',
    date: '2023-11-15', 
    amount: '$9.00',
    status: 'paid',
    period: 'Nov 15 - Dec 14, 2023'
  }
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: [
      '3 workflows',
      '100 monthly runs',
      '10 AI generations',
      '1GB storage',
      'Basic integrations'
    ],
    current: false
  },
  {
    name: 'Gold', 
    price: '$9',
    period: '/month',
    features: [
      '20 workflows',
      '2,000 monthly runs', 
      '100 AI generations',
      '10GB storage',
      'All integrations',
      'API access',
      '3 team members'
    ],
    current: true
  },
  {
    name: 'Diamond',
    price: '$19', 
    period: '/month',
    features: [
      'Unlimited workflows',
      '10,000 monthly runs',
      '500 AI generations', 
      '100GB storage',
      'All integrations',
      'API access',
      '10 team members',
      'God-tier features'
    ],
    current: false
  }
];

function BillingPage() {
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing & Usage</h1>
            <p className="text-muted-foreground">Manage your subscription and monitor usage</p>
          </div>
          <Button asChild>
            <a href="/pricing">View Plans</a>
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="plans">Change Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Current Plan: {currentPlan.name}
                    </CardTitle>
                    <CardDescription>
                      {currentPlan.price}/{currentPlan.period} • Next billing: {new Date(currentPlan.nextBilling).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={currentPlan.status === 'active' ? 'default' : 'secondary'}>
                    {currentPlan.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Usage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage.workflows.current}</div>
                  <div className="text-xs text-muted-foreground">
                    of {usage.workflows.limit} workflows
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.workflows.current, usage.workflows.limit)} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Monthly Runs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage.monthlyRuns.current.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    of {usage.monthlyRuns.limit.toLocaleString()} runs
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.monthlyRuns.current, usage.monthlyRuns.limit)} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage.aiGenerations.current}</div>
                  <div className="text-xs text-muted-foreground">
                    of {usage.aiGenerations.limit} generations
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.aiGenerations.current, usage.aiGenerations.limit)} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Storage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage.storage.current}GB</div>
                  <div className="text-xs text-muted-foreground">
                    of {usage.storage.limit}GB storage
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.storage.current, usage.storage.limit)} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Usage</CardTitle>
                <CardDescription>Current month usage across all resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(usage).map(([key, data]) => {
                  const percentage = getUsagePercentage(data.current, data.limit);
                  const colorClass = getUsageColor(percentage);
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm">
                          <span className={colorClass}>
                            {typeof data.current === 'number' && data.current % 1 !== 0 
                              ? data.current.toFixed(1) 
                              : data.current.toLocaleString()}
                          </span>
                          {' '} / {data.limit.toLocaleString()}
                          {key === 'storage' ? ' GB' : ''}
                        </div>
                      </div>
                      <Progress value={percentage} />
                      {percentage >= 90 && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          Approaching limit - consider upgrading your plan
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>Manage your current subscription and billing preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Current Plan</div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Gold Plan - $9/month
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Next Billing Date</div>
                      <div className="text-sm">Feb 15, 2024</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Your subscription will auto-renew
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Payment Method</div>
                      <Button variant="outline" size="sm">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Update
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      •••• •••• •••• 4242
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Pause Subscription
                    </Button>
                    <Button variant="outline">
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Usage Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>Download and view your past invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Invoice #{invoice.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.period}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{invoice.amount}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(invoice.date).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                          {invoice.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.name} className={`relative ${plan.current ? 'border-primary' : ''}`}>
                  {plan.current && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge>Current Plan</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {plan.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={plan.current ? "outline" : "default"}
                      disabled={plan.current || isChangingPlan}
                      onClick={() => setIsChangingPlan(true)}
                    >
                      {plan.current ? 'Current Plan' : `Switch to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(BillingPage);