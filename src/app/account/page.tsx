'use client';

import { useState, useEffect } from 'react';
import { EnhancedAppLayout } from '@/components/enhanced-app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarContent, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User,
  Users,
  CreditCard,
  Shield,
  Settings,
  Bell,
  Key,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  Edit,
  Trash2,
  Download,
  Upload,
  Copy,
  ExternalLink,
  RefreshCw,
  Activity,
  BarChart3,
  Globe,
  Smartphone,
  Laptop,
  Monitor,
  Crown,
  Star,
  Award,
  Zap,
  FileText,
  Database,
  Cloud,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Info,
  AlertCircle,
  UserPlus,
  UserMinus,
  UserCheck,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Mock user data
const mockUser = {
  id: 'user_123',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@techcorp.com',
  avatar: 'SJ',
  role: 'Admin',
  department: 'Engineering',
  company: 'TechCorp Inc.',
  location: 'San Francisco, CA',
  phone: '+1 (555) 123-4567',
  timezone: 'Pacific Standard Time',
  joinDate: '2023-03-15',
  lastActive: '2024-01-15T14:30:00Z',
  subscription: 'Gold Plan',
  trialEnd: '2024-02-15',
  apiKeysCount: 3,
  workflowsCreated: 47,
  totalExecutions: 15420
};

const mockTeamMembers = [
  { id: '1', name: 'Michael Chen', email: 'michael@techcorp.com', role: 'Developer', status: 'active', avatar: 'MC', lastActive: '2024-01-15T13:45:00Z' },
  { id: '2', name: 'Emily Rodriguez', email: 'emily@techcorp.com', role: 'Designer', status: 'active', avatar: 'ER', lastActive: '2024-01-15T14:20:00Z' },
  { id: '3', name: 'David Kim', email: 'david@techcorp.com', role: 'Manager', status: 'inactive', avatar: 'DK', lastActive: '2024-01-14T16:30:00Z' },
  { id: '4', name: 'Lisa Wang', email: 'lisa@techcorp.com', role: 'Developer', status: 'pending', avatar: 'LW', lastActive: null }
];

const mockApiKeys = [
  { id: 'key_1', name: 'Production API', created: '2024-01-10', lastUsed: '2024-01-15T14:30:00Z', permissions: ['read', 'write'], status: 'active' },
  { id: 'key_2', name: 'Development API', created: '2024-01-05', lastUsed: '2024-01-14T10:15:00Z', permissions: ['read'], status: 'active' },
  { id: 'key_3', name: 'Analytics API', created: '2023-12-20', lastUsed: '2024-01-13T09:20:00Z', permissions: ['read'], status: 'inactive' }
];

const mockBillingData = {
  currentPlan: 'Gold Plan',
  monthlyPrice: 49,
  billingCycle: 'monthly',
  nextBilling: '2024-02-15',
  paymentMethod: '**** **** **** 4242',
  usageQuotas: {
    workflows: { current: 47, limit: 100 },
    executions: { current: 15420, limit: 50000 },
    storage: { current: 2.3, limit: 10 },
    teamMembers: { current: 4, limit: 10 }
  }
};

const mockSecurityLogs = [
  { id: '1', action: 'Login', timestamp: '2024-01-15T14:30:00Z', ip: '192.168.1.100', location: 'San Francisco, CA', device: 'Chrome on macOS' },
  { id: '2', action: 'API Key Created', timestamp: '2024-01-10T09:15:00Z', ip: '192.168.1.100', location: 'San Francisco, CA', device: 'Chrome on macOS' },
  { id: '3', action: 'Password Changed', timestamp: '2024-01-08T16:45:00Z', ip: '192.168.1.100', location: 'San Francisco, CA', device: 'Chrome on macOS' },
  { id: '4', action: 'Failed Login Attempt', timestamp: '2024-01-07T11:20:00Z', ip: '203.0.113.42', location: 'Unknown', device: 'Unknown' }
];

function AccountManagementHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'profile';
    }
    return 'profile';
  });

  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Profile Tab Component
  const ProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Profile Settings</h2>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2">
          <CheckCircle className="h-4 w-4 mr-2" />
          Verified Account
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-gradient-to-r from-primary to-purple-600 text-white">
                  {mockUser.avatar}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{mockUser.name}</CardTitle>
            <CardDescription>{mockUser.role} • {mockUser.company}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <Badge variant="outline" className="text-primary font-medium">
                {mockUser.subscription}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Member since {new Date(mockUser.joinDate).toLocaleDateString()}
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Workflows Created</span>
                <span className="font-semibold">{mockUser.workflowsCreated}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Executions</span>  
                <span className="font-semibold">{mockUser.totalExecutions.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API Keys</span>
                <span className="font-semibold">{mockUser.apiKeysCount}</span>
              </div>
            </div>

            <Separator />

            <Button className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile Picture
            </Button>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue={mockUser.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={mockUser.email} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue={mockUser.phone} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" defaultValue={mockUser.timezone} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" defaultValue={mockUser.location} />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-semibold">Company Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" defaultValue={mockUser.company} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" defaultValue={mockUser.department} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>Manage your API keys for integrations and external access</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockApiKeys.map((apiKey) => (
              <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <Key className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{apiKey.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created {apiKey.created}</span>
                      <span>•</span>
                      <span>Last used {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                      <span>•</span>
                      <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {apiKey.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                  >
                    {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Team Tab Component
  const TeamTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">Manage team members, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            {mockTeamMembers.length} / {mockBillingData.usageQuotas.teamMembers.limit} Members
          </Badge>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{mockTeamMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">{mockTeamMembers.filter(m => m.status === 'active').length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Invites</p>
                <p className="text-2xl font-bold">{mockTeamMembers.filter(m => m.status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Seats</p>
                <p className="text-2xl font-bold">{mockBillingData.usageQuotas.teamMembers.limit - mockTeamMembers.length}</p>
              </div>
              <Plus className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTeamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{member.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{member.email}</span>
                      <span>•</span>
                      <span>{member.role}</span>
                      {member.lastActive && (
                        <>
                          <span>•</span>
                          <span>Last active {new Date(member.lastActive).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={
                      member.status === 'active' ? 'default' : 
                      member.status === 'pending' ? 'secondary' : 'outline'
                    }
                    className="capitalize"
                  >
                    {member.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization Settings
          </CardTitle>
          <CardDescription>Configure organization-wide settings and policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Single Sign-On (SSO)</h4>
              <p className="text-sm text-muted-foreground">Enable SSO for streamlined team access</p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Two-Factor Authentication Required</h4>
              <p className="text-sm text-muted-foreground">Require 2FA for all team members</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Domain Restriction</h4>
              <p className="text-sm text-muted-foreground">Only allow team members with @techcorp.com emails</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Billing Tab Component
  const BillingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Billing & Subscription</h2>
          <p className="text-muted-foreground">Manage your subscription, billing, and usage</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2">
            <Crown className="h-4 w-4 mr-2" />
            {mockBillingData.currentPlan}
          </Badge>
          <Button>
            <TrendingUp className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Current Plan Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{mockBillingData.currentPlan}</CardTitle>
              <CardDescription className="text-base">
                ${mockBillingData.monthlyPrice}/month • Billed {mockBillingData.billingCycle}
              </CardDescription>
            </div>
            <Crown className="h-12 w-12 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockBillingData.usageQuotas.workflows.limit}</div>
              <div className="text-sm text-muted-foreground">Workflows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{(mockBillingData.usageQuotas.executions.limit / 1000).toFixed(0)}K</div>
              <div className="text-sm text-muted-foreground">Executions/month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockBillingData.usageQuotas.teamMembers.limit}</div>
              <div className="text-sm text-muted-foreground">Team Members</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t flex items-center justify-between">
            <div>
              <p className="font-semibold">Next billing date</p>
              <p className="text-sm text-muted-foreground">{new Date(mockBillingData.nextBilling).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Payment method</p>
              <p className="text-sm text-muted-foreground">{mockBillingData.paymentMethod}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage & Quotas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage & Quotas
          </CardTitle>
          <CardDescription>Monitor your current usage against plan limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(mockBillingData.usageQuotas).map(([key, data]) => {
            const percentage = (data.current / data.limit) * 100;
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="capitalize font-medium">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold">
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

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
              <CardDescription>Manage your payment information</CardDescription>
            </div>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Update
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Visa ending in 4242</h4>
              <p className="text-sm text-muted-foreground">Expires 12/2027</p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Recent invoices and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>No billing history available</p>
              <p className="text-sm">Your first invoice will appear here after billing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Security Tab Component
  const SecurityTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Security & Privacy</h2>
          <p className="text-muted-foreground">Manage your account security, permissions, and privacy settings</p>
        </div>
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2">
          <Shield className="h-4 w-4 mr-2" />
          Secure Account
        </Badge>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Password Strength</p>
                <p className="text-2xl font-bold text-green-600">Strong</p>
              </div>
              <Lock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">2FA Status</p>
                <p className="text-2xl font-bold text-blue-600">Enabled</p>
              </div>
              <Smartphone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold text-purple-600">3</p>
              </div>
              <Monitor className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Account Security
          </CardTitle>
          <CardDescription>Configure your account security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Enabled
              </Badge>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Password</h4>
              <p className="text-sm text-muted-foreground">Last changed on January 8, 2024</p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Login Notifications</h4>
              <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Session Timeout</h4>
              <p className="text-sm text-muted-foreground">Automatically log out after 30 minutes of inactivity</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>Manage devices and sessions with access to your account</CardDescription>
            </div>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/20 border-green-200">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Laptop className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Chrome on macOS</h4>
                  <div className="text-sm text-muted-foreground">
                    San Francisco, CA • Current session
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Current
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold">Mobile App - iOS</h4>
                  <div className="text-sm text-muted-foreground">
                    San Francisco, CA • Last active 2 hours ago
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Revoke
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                </div>  
                <div>
                  <h4 className="font-semibold">Firefox on Windows</h4>
                  <div className="text-sm text-muted-foreground">
                    New York, NY • Last active 1 day ago
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Revoke
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Security Activity Log
          </CardTitle>
          <CardDescription>Recent security events and login activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-4">
              {mockSecurityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className={cn(
                    "p-2 rounded-lg",
                    log.action.includes('Failed') ? 'bg-red-500/10' : 'bg-green-500/10'
                  )}>
                    {log.action.includes('Failed') ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{log.action}</h4>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()} • {log.ip} • {log.location}
                    </div>
                    <div className="text-xs text-muted-foreground">{log.device}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <EnhancedAppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Consolidated Account Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Team</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <ProfileTab />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <TeamTab />
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <BillingTab />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecurityTab />
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAppLayout>
  );
}

export default withAuth(AccountManagementHub);