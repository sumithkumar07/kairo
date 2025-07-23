'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Shield,
  Key,
  Users,
  FileText,
  Smartphone,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  RotateCcw,
  Plus,
  Trash2,
  Globe,
  Clock,
  Download,
  Activity,
  Settings,
  UserCheck,
  Crown,
  Zap,
  Database,
  Cloud,
  Terminal,
  Code,
  Webhook
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  },
  {
    id: '3',
    name: 'Webhook Integration',
    key: 'ka_webhook_••••••••••••••••••••••••••••••••••••••••••••••••7e3d',
    created: '2024-12-22',
    lastUsed: '3 hours ago',
    permissions: ['webhook'],
    active: false
  }
];

const auditLogs = [
  {
    id: '1',
    action: 'Workflow Created',
    user: 'john@company.com',
    timestamp: '2025-01-23 14:30:15',
    ip: '192.168.1.100',
    resource: 'Lead Nurturing Workflow',
    risk: 'low'
  },
  {
    id: '2',
    action: 'API Key Accessed',
    user: 'system',
    timestamp: '2025-01-23 14:25:43',
    ip: '10.0.1.50',
    resource: 'Production API Key',
    risk: 'medium'
  },
  {
    id: '3',
    action: 'User Login',
    user: 'admin@company.com',
    timestamp: '2025-01-23 14:20:12',
    ip: '203.0.113.45',
    resource: 'Dashboard',
    risk: 'low'
  },
  {
    id: '4',
    action: 'Divine Power Activated',
    user: 'admin@company.com',
    timestamp: '2025-01-23 14:15:08',
    ip: '203.0.113.45',
    resource: 'Quantum Simulation Engine',
    risk: 'high'
  }
];

const teamMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    role: 'Admin',
    lastActive: '2 hours ago',
    status: 'active',
    permissions: ['full_access']
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@company.com',
    role: 'Editor',
    lastActive: '1 day ago',
    status: 'active',
    permissions: ['workflow_edit', 'template_access']
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@company.com',
    role: 'Viewer',
    lastActive: '3 days ago',
    status: 'inactive',
    permissions: ['workflow_view']
  }
];

const complianceReports = [
  {
    id: '1',
    name: 'SOC 2 Type II Compliance Report',
    date: '2025-01-15',
    status: 'compliant',
    score: 98.5,
    nextReview: '2025-07-15'
  },
  {
    id: '2',
    name: 'GDPR Data Protection Assessment',
    date: '2025-01-10',
    status: 'compliant',
    score: 96.2,
    nextReview: '2025-04-10'
  },
  {
    id: '3',
    name: 'HIPAA Security Audit',
    date: '2025-01-05',
    status: 'review_needed',
    score: 89.3,
    nextReview: '2025-02-05'
  }
];

function SecurityPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showApiKey, setShowApiKey] = useState({});
  const [newApiKeyName, setNewApiKeyName] = useState('');

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'review_needed': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'non_compliant': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-yellow-500/5 rounded-2xl" />
          <div className="relative p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      Security Center
                    </h1>
                    <p className="text-muted-foreground text-lg">
                      Enterprise security, compliance, and access management
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Security Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">98.5%</p>
                  <p className="text-sm text-muted-foreground">Security Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Key className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{apiKeys.length}</p>
                  <p className="text-sm text-muted-foreground">Active API Keys</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teamMembers.length}</p>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Activity className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2.4K</p>
                  <p className="text-sm text-muted-foreground">Audit Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Access
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Compliance
            </TabsTrigger>
          </TabsList>

          {/* Security Settings */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="api-keys" className="space-y-6 mt-6">
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

          {/* Team Access */}
          <TabsContent value="team" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage team access and permissions
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <p className="text-xs text-muted-foreground">Last active: {member.lastActive}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{member.role}</Badge>
                        <Badge className={member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {member.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs */}
          <TabsContent value="audit" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>
                  Complete log of all security and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{log.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.user} • {log.resource}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.timestamp} • IP: {log.ip}
                          </p>
                        </div>
                      </div>
                      <Badge className={getRiskColor(log.risk)}>
                        {log.risk} risk
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance */}
          <TabsContent value="compliance" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {complianceReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status.replace('_', ' ')}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">{report.score}%</p>
                      <p className="text-sm text-muted-foreground">Compliance Score</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Report Date:</span>
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Review:</span>
                        <span>{new Date(report.nextReview).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
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

export default withAuth(SecurityPage);