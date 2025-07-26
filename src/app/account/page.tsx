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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  User,
  Users, 
  UserPlus,
  Mail,
  Settings,
  Crown,
  Shield,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Activity,
  Globe,
  Phone,
  MapPin,
  Briefcase,
  Star,
  Award,
  Target,
  TrendingUp,
  Database,
  Code,
  Palette,
  MessageSquare,
  FileText,
  Zap,
  ArrowRight,
  Key,
  Lock,
  Unlock,
  Plus,
  Copy,
  RotateCcw,
  Bell,
  Smartphone,
  CreditCard,
  DollarSign
} from 'lucide-react';

// Account Management Hub - Consolidated from /profile, /team, /security, /billing
// This combines all account-related functionality in one unified interface

// Mock data from various pages
const currentUser = {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@company.com',
  avatar: 'SJ',
  role: 'Owner',
  department: 'Executive',
  location: 'New York, US',
  phone: '+1 (555) 123-4567',
  joinedDate: '2024-01-15',
  lastActive: '2 minutes ago'
};

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

const teamMembers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Owner',
    department: 'Executive',
    avatar: 'SJ',
    status: 'active',
    lastActive: '2 minutes ago',
    joinedDate: '2024-01-15',
    permissions: ['admin', 'billing', 'workflows', 'integrations', 'analytics'],
    workflows: 23,
    executions: 12847
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    role: 'Admin',
    department: 'Engineering',
    avatar: 'MC',
    status: 'active',
    lastActive: '5 minutes ago',
    joinedDate: '2024-02-03',
    permissions: ['workflows', 'integrations', 'analytics', 'monitoring'],
    workflows: 18,
    executions: 9634
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    role: 'Editor',
    department: 'Marketing',
    avatar: 'ER',
    status: 'active',
    lastActive: '1 hour ago',
    joinedDate: '2024-02-20',
    permissions: ['workflows', 'analytics'],
    workflows: 12,
    executions: 5476
  }
];

const securitySettings = {
  twoFactor: true,
  sessionTimeout: 30,
  ipRestrictions: false,
  auditLogging: true,
  encryptionAtRest: true,
  sso: false
};

const apiKeys = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'ka_prod_•••••••••••••••••••••••••••••••••••••••••••••••••••8f2a',
    created: '2024-12-15',
    lastUsed: '2 hours ago',
    permissions: ['read', 'write', 'admin'],
    active: true
  },
  {
    id: '2',
    name: 'Development API Key',
    key: 'ka_dev_••••••••••••••••••••••••••••••••••••••••••••••••••••9c1b',
    created: '2024-12-20',
    lastUsed: '1 day ago',
    permissions: ['read', 'write'],
    active: true
  }
];

function AccountManagementHub() {
  const [activeTab, setActiveTab] = useState('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showApiKey, setShowApiKey] = useState({});

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Owner': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'Admin': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'Editor': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'Viewer': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Owner': return Crown;
      case 'Admin': return Shield;
      case 'Editor': return Edit3;
      case 'Viewer': return Eye;
      default: return User;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'invited': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const filteredMembers = teamMembers.filter(member => {
    if (roleFilter !== 'all' && member.role !== roleFilter) return false;
    if (searchTerm && !member.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !member.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Account <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Management</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your profile, team, security settings, and billing all in one place
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Badge variant="outline" className="flex items-center gap-2">
              <Crown className="h-3 w-3" />
              {currentPlan.name} Plan
            </Badge>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{currentUser.role}</div>
                  <div className="text-sm text-muted-foreground">Account Role</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
                  <div className="text-sm text-muted-foreground">Team Members</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Key className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{apiKeys.length}</div>
                  <div className="text-sm text-muted-foreground">API Keys</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <CreditCard className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{currentPlan.price}</div>
                  <div className="text-sm text-muted-foreground">Monthly Cost</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Profile Tab - Personal settings & preferences */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={`/avatars/${currentUser.avatar.toLowerCase()}.png`} />
                      <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white text-lg">
                        {currentUser.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">
                        Upload Photo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG or GIF. Max size 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="Sarah" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Johnson" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={currentUser.email} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue={currentUser.phone} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" defaultValue={currentUser.location} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select defaultValue={currentUser.department}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Executive">Executive</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Configure your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive workflow notifications via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">Receive product updates and tips</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="America/New_York">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (UTC-6)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                        <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button variant="outline" className="w-full">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Tab - Organization & member management */}
          <TabsContent value="team" className="space-y-6">
            {/* Team Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Team Management</h2>
                <p className="text-muted-foreground">Manage your team members and their permissions</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your team
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="inviteEmail">Email Address</Label>
                      <Input id="inviteEmail" type="email" placeholder="Enter email address" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inviteRole">Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Editor">Editor</SelectItem>
                          <SelectItem value="Viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">
                      Send Invitation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Team Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Team Members List */}
            <div className="space-y-4">
              {filteredMembers.map((member) => {
                const RoleIcon = getRoleIcon(member.role);
                return (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`/avatars/${member.avatar.toLowerCase()}.png`} />
                            <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-lg">{member.name}</h3>
                              <Badge className={`text-xs ${getStatusColor(member.status)}`}>
                                {member.status}
                              </Badge>
                              <div className={`p-1.5 rounded-lg ${getRoleColor(member.role)}`}>
                                <RoleIcon className="h-4 w-4" />
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {member.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {member.department}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span>Role: <strong>{member.role}</strong></span>
                                <span>Last active: {member.lastActive}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-lg font-semibold">{member.workflows}</div>
                            <div className="text-xs text-muted-foreground">Workflows</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold">{member.executions.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Executions</div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Security Tab - Permissions & access control */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Authentication Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Authentication
                  </CardTitle>
                  <CardDescription>
                    Configure authentication and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch checked={securitySettings.twoFactor} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Single Sign-On (SSO)</p>
                      <p className="text-sm text-muted-foreground">SAML/OAuth integration</p>
                    </div>
                    <Switch checked={securitySettings.sso} />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium">Session Timeout</p>
                    <Input 
                      type="number" 
                      value={securitySettings.sessionTimeout} 
                      className="w-20"
                      readOnly
                    />
                    <p className="text-sm text-muted-foreground">Minutes of inactivity</p>
                  </div>
                </CardContent>
              </Card>

              {/* Data Protection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Protection
                  </CardTitle>
                  <CardDescription>
                    Configure data security and encryption
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Encryption at Rest</p>
                      <p className="text-sm text-muted-foreground">AES-256 encryption for stored data</p>
                    </div>
                    <Switch checked={securitySettings.encryptionAtRest} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">IP Restrictions</p>
                      <p className="text-sm text-muted-foreground">Limit access by IP address</p>
                    </div>
                    <Switch checked={securitySettings.ipRestrictions} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Audit Logging</p>
                      <p className="text-sm text-muted-foreground">Log all user activities</p>
                    </div>
                    <Switch checked={securitySettings.auditLogging} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* API Keys Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                      Manage API keys for integrations and external access
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate New Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Key className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{apiKey.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(apiKey.created).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={apiKey.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {apiKey.active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input 
                            value={showApiKey[apiKey.id] ? apiKey.key.replace('•', 'x') : apiKey.key}
                            readOnly 
                            className="font-mono text-sm"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleApiKeyVisibility(apiKey.id)}
                          >
                            {showApiKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span>Last used: {apiKey.lastUsed}</span>
                            <div className="flex gap-1">
                              {apiKey.permissions.map((perm, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab - Subscription & payment info */}
          <TabsContent value="billing" className="space-y-6">
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
                  <Button>
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Overview</CardTitle>
                <CardDescription>Current month usage across all resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(usage).map(([key, data]) => {
                  const percentage = getUsagePercentage(data.current, data.limit);
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm">
                          <span className={percentage >= 90 ? 'text-red-500' : 'text-foreground'}>
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
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(AccountManagementHub);