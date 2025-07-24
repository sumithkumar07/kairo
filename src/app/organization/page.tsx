'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, 
  CreditCard,
  Settings,
  Shield,
  Bell,
  Globe,
  Users,
  Zap,
  Crown,
  Calendar,
  Download,
  Upload,
  Edit3,
  Save,
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Activity,
  BarChart3,
  DollarSign,
  TrendingUp,
  FileText,
  Lock,
  Key,
  Database,
  Cloud,
  Monitor,
  Smartphone,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Server,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Trash2,
  Plus,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

// Sample organization data
const organizationData = {
  id: 'org_2024_kairo_enterprises',
  name: 'Kairo Enterprises',
  slug: 'kairo-enterprises',
  description: 'Leading automation solutions company leveraging AI for business process optimization',
  industry: 'Technology',
  size: 'Enterprise (500+ employees)',
  website: 'https://kairo-enterprises.com',
  email: 'admin@kairo-enterprises.com',
  phone: '+1 (555) 123-4567',
  address: {
    street: '123 Innovation Drive',
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    zipCode: '94105'
  },
  timezone: 'America/Los_Angeles',
  currency: 'USD',
  language: 'English',
  createdDate: '2024-01-15',
  plan: 'Enterprise',
  status: 'active',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=KE',
  settings: {
    allowMemberInvites: true,
    requireTwoFactor: true,
    sessionTimeout: 480, // minutes
    dataRetention: 365, // days
    auditLogging: true,
    ssoEnabled: true,
    domainVerification: true
  }
};

const billingData = {
  currentPlan: 'Enterprise',
  planPrice: 199,
  billingCycle: 'monthly',
  nextBillingDate: '2024-04-15',
  paymentMethod: {
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2027
  },
  usage: {
    workflows: { current: 147, limit: 500 },
    executions: { current: 45247, limit: 100000 },
    storage: { current: 2.3, limit: 10 }, // GB
    teamMembers: { current: 12, limit: 50 },
    integrations: { current: 23, limit: 100 }
  },
  invoices: [
    { id: 'inv_001', date: '2024-03-15', amount: 199, status: 'paid', downloadUrl: '#' },
    { id: 'inv_002', date: '2024-02-15', amount: 199, status: 'paid', downloadUrl: '#' },
    { id: 'inv_003', date: '2024-01-15', amount: 199, status: 'paid', downloadUrl: '#' }
  ]
};

const apiKeys = [
  {
    id: 'key_1',
    name: 'Production API Key',
    key: 'ka_prod_abc123...xyz789',
    permissions: ['read', 'write', 'admin'],
    created: '2024-01-15',
    lastUsed: '2 hours ago',
    status: 'active'
  },
  {
    id: 'key_2',
    name: 'Development API Key',
    key: 'ka_dev_def456...uvw012',
    permissions: ['read', 'write'],
    created: '2024-02-01',
    lastUsed: '1 day ago',
    status: 'active'
  },
  {
    id: 'key_3',
    name: 'Integration Testing',
    key: 'ka_test_ghi789...rst345',
    permissions: ['read'],
    created: '2024-02-20',
    lastUsed: 'Never',
    status: 'inactive'
  }
];

function OrganizationPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(organizationData);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  const plans = [
    {
      name: 'Starter',
      price: 29,
      features: ['10 workflows', '1,000 executions/month', '1GB storage', '5 team members']
    },
    {
      name: 'Professional',
      price: 99,
      features: ['100 workflows', '25,000 executions/month', '5GB storage', '15 team members']
    },
    {
      name: 'Enterprise',
      price: 199,
      features: ['500 workflows', '100,000 executions/month', '10GB storage', '50 team members']
    }
  ];

  const handleSave = () => {
    // API call to save organization data
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Organization <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Settings</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your organization profile, billing, and security settings
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Crown className="h-3 w-3" />
              {billingData.currentPlan} Plan
            </Badge>
            {isEditing ? (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} size="sm" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Profile</CardTitle>
                <CardDescription>Basic information about your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                      id="orgName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="orgSlug">Organization Slug</Label>
                    <Input
                      id="orgSlug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={formData.industry} disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="size">Company Size</Label>
                    <Select value={formData.size} disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Startup (1-10)">Startup (1-10)</SelectItem>
                        <SelectItem value="Small (11-50)">Small (11-50)</SelectItem>
                        <SelectItem value="Medium (51-200)">Medium (51-200)</SelectItem>
                        <SelectItem value="Large (201-500)">Large (201-500)</SelectItem>
                        <SelectItem value="Enterprise (500+)">Enterprise (500+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Primary Email</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Organization contact details and address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={formData.timezone} disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.address.city} disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input id="state" value={formData.address.state} disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input id="zipCode" value={formData.address.zipCode} disabled={!isEditing} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing" className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>Manage your subscription and billing</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-100">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {formatCurrency(billingData.planPrice)}
                      <span className="text-lg font-normal text-muted-foreground">/{billingData.billingCycle}</span>
                    </div>
                    <div className="text-lg font-semibold mb-4">{billingData.currentPlan} Plan</div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>Next billing date: {billingData.nextBillingDate}</div>
                      <div>Payment method: {billingData.paymentMethod.brand} •••• {billingData.paymentMethod.last4}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button variant="outline" className="justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Update Payment Method
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Change Billing Cycle
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>Upgrade or downgrade your subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <Card key={plan.name} className={`relative ${plan.name === billingData.currentPlan ? 'ring-2 ring-primary' : ''}`}>
                      {plan.name === billingData.currentPlan && (
                        <Badge className="absolute -top-2 left-4 bg-primary">Current Plan</Badge>
                      )}
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <div className="text-3xl font-bold">
                          {formatCurrency(plan.price)}
                          <span className="text-sm font-normal text-muted-foreground">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className="w-full mt-4" 
                          variant={plan.name === billingData.currentPlan ? "outline" : "default"}
                          disabled={plan.name === billingData.currentPlan}
                        >
                          {plan.name === billingData.currentPlan ? 'Current Plan' : 'Upgrade'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Previous invoices and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingData.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div>
                        <div className="font-semibold">Invoice #{invoice.id}</div>
                        <div className="text-sm text-muted-foreground">{invoice.date}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(invoice.amount)}</div>
                          <Badge variant="outline" className="text-green-600">
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(billingData.usage).map(([key, usage]) => {
                const percentage = getUsagePercentage(usage.current, usage.limit);
                return (
                  <Card key={key}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground mb-2">
                        {typeof usage.current === 'number' && usage.current > 1000 
                          ? usage.current.toLocaleString() 
                          : usage.current}
                        {key === 'storage' && ' GB'}
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        of {typeof usage.limit === 'number' && usage.limit > 1000 
                          ? usage.limit.toLocaleString() 
                          : usage.limit}
                        {key === 'storage' && ' GB'} used
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(percentage)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}% of limit used
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usage Recommendations</CardTitle>
                <CardDescription>Optimize your plan based on current usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-semibold text-green-700 dark:text-green-400">
                        Current plan suits your usage
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-500">
                        Your usage is well within limits. No action needed.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                    <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-semibold text-blue-700 dark:text-blue-400">
                        Growth opportunity detected
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-500">
                        Consider upgrading if your workflow count continues to grow.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure organization-wide security policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">
                      Require 2FA for all team members
                    </div>
                  </div>
                  <Switch checked={formData.settings.requireTwoFactor} disabled={!isEditing} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Single Sign-On (SSO)</div>
                    <div className="text-sm text-muted-foreground">
                      Enable SAML/OIDC authentication
                    </div>
                  </div>
                  <Switch checked={formData.settings.ssoEnabled} disabled={!isEditing} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Domain Verification</div>
                    <div className="text-sm text-muted-foreground">
                      Verify organization domain ownership
                    </div>
                  </div>
                  <Switch checked={formData.settings.domainVerification} disabled={!isEditing} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Audit Logging</div>
                    <div className="text-sm text-muted-foreground">
                      Log all organization activities
                    </div>
                  </div>
                  <Switch checked={formData.settings.auditLogging} disabled={!isEditing} />
                </div>

                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={formData.settings.sessionTimeout}
                    disabled={!isEditing}
                    className="max-w-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="dataRetention">Data Retention (days)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    value={formData.settings.dataRetention}
                    disabled={!isEditing}
                    className="max-w-xs"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage API keys for programmatic access</CardDescription>
                  </div>
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Generate New Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-semibold">{apiKey.name}</div>
                          <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                            {apiKey.status}
                          </Badge>
                        </div>
                        <div className="font-mono text-sm text-muted-foreground mb-2">
                          {showApiKey === apiKey.id ? apiKey.key : apiKey.key.substring(0, 20) + '...'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {apiKey.created} • Last used: {apiKey.lastUsed}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                        >
                          {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>Learn how to integrate with Kairo's APIs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                  <div>
                    <div className="font-semibold">Complete API Reference</div>
                    <div className="text-sm text-muted-foreground">
                      Comprehensive documentation with examples and SDKs
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/docs" className="flex items-center gap-2">
                      View Docs
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(OrganizationPage);