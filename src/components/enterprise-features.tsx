'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Users,
  Globe,
  Lock,
  Eye,
  Activity,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Crown,
  Zap,
  Database,
  Cpu,
  Network,
  Key,
  Mail,
  Bell,
  BarChart3,
  TrendingUp,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityMetric {
  name: string;
  value: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
}

interface ComplianceFramework {
  name: string;
  status: 'compliant' | 'partial' | 'pending';
  progress: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function EnterpriseFeatures() {
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [auditLogsEnabled, setAuditLogsEnabled] = useState(true);
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState(false);

  const securityMetrics: SecurityMetric[] = [
    {
      name: 'Encryption Strength',
      value: 98,
      status: 'excellent',
      description: 'AES-256-GCM encryption for data at rest and in transit'
    },
    {
      name: 'Access Control',
      value: 94,
      status: 'excellent',
      description: 'Multi-factor authentication and role-based permissions'
    },
    {
      name: 'Vulnerability Score',
      value: 87,
      status: 'good',
      description: 'Regular security audits and penetration testing'
    },
    {
      name: 'Compliance Rating',
      value: 91,
      status: 'excellent',
      description: 'SOC 2 Type II, GDPR, and HIPAA compliant'
    }
  ];

  const complianceFrameworks: ComplianceFramework[] = [
    {
      name: 'SOC 2 Type II',
      status: 'compliant',
      progress: 100,
      description: 'Annual security audits with clean reports',
      icon: Shield
    },
    {
      name: 'GDPR Compliance',
      status: 'compliant',
      progress: 100,
      description: 'Full EU data protection regulation compliance',
      icon: Globe
    },
    {
      name: 'HIPAA Ready',
      status: 'compliant',
      progress: 100,
      description: 'Healthcare data protection standards met',
      icon: FileText
    },
    {
      name: 'FedRAMP Authorization',
      status: 'partial',
      progress: 78,
      description: 'In progress for government cloud deployment',
      icon: Building2
    },
    {
      name: 'ISO 27001',
      status: 'pending',
      progress: 45,
      description: 'Information security management certification',
      icon: Lock
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'compliant':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'good':
      case 'partial':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'warning':
      case 'pending':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'compliant':
        return CheckCircle;
      case 'good':
      case 'partial':
        return Clock;
      case 'warning':
      case 'pending':
        return AlertTriangle;
      case 'critical':
        return AlertTriangle;
      default:
        return Eye;
    }
  };

  return (
    <div className="space-y-8">
      {/* Enterprise Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl" />
        <div className="relative p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Enterprise Control Center
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Advanced security, compliance, and team management features
              </p>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                <span>Enterprise Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
          <TabsTrigger value="branding">White Label</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Metrics
                </CardTitle>
                <CardDescription>
                  Real-time security posture assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityMetrics.map((metric) => {
                  const StatusIcon = getStatusIcon(metric.status);
                  return (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <span className="font-medium">{metric.name}</span>
                        </div>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.value}%
                        </Badge>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {metric.description}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure enterprise security features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sso">Single Sign-On (SSO)</Label>
                    <p className="text-sm text-muted-foreground">
                      SAML 2.0 and OAuth 2.0 support
                    </p>
                  </div>
                  <Switch
                    id="sso"
                    checked={ssoEnabled}
                    onCheckedChange={setSsoEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="audit">Advanced Audit Logs</Label>
                    <p className="text-sm text-muted-foreground">
                      Detailed activity tracking and compliance
                    </p>
                  </div>
                  <Switch
                    id="audit"
                    checked={auditLogsEnabled}
                    onCheckedChange={setAuditLogsEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label>IP Allowlist</Label>
                  <Input placeholder="192.168.1.0/24, 10.0.0.0/8" />
                  <p className="text-xs text-muted-foreground">
                    Restrict access to specific IP ranges
                  </p>
                </div>

                <Button className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Configure SSO Provider
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {complianceFrameworks.map((framework) => {
              const StatusIcon = framework.icon;
              return (
                <Card key={framework.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-5 w-5" />
                        <CardTitle className="text-lg">{framework.name}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(framework.status)}>
                        {framework.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {framework.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{framework.progress}%</span>
                      </div>
                      <Progress value={framework.progress} className="h-2" />
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      View Documentation
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Team Management Tab */}
        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">24</div>
                    <div className="text-sm text-muted-foreground">Team Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">8</div>
                    <div className="text-sm text-muted-foreground">Workspaces</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">156</div>
                    <div className="text-sm text-muted-foreground">Active Workflows</div>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Team Members
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Role-Based Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['Admin', 'Editor', 'Viewer', 'Auditor'].map((role) => (
                    <div key={role} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{role}</span>
                      <Badge variant="outline">
                        {role === 'Admin' ? '3 users' : role === 'Editor' ? '12 users' : role === 'Viewer' ? '8 users' : '1 user'}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Permissions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* White Label Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Brand Customization
              </CardTitle>
              <CardDescription>
                Customize the platform with your brand identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="whitelabel">Enable White Label</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove Kairo branding and use your own
                  </p>
                </div>
                <Switch
                  id="whitelabel"
                  checked={whiteLabelEnabled}
                  onCheckedChange={setWhiteLabelEnabled}
                />
              </div>

              {whiteLabelEnabled && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input placeholder="Your Company" />
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input type="color" defaultValue="#3b82f6" className="w-16" />
                        <Input placeholder="#3b82f6" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Logo Upload</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <div className="text-muted-foreground">
                        Drag & drop your logo here, or click to browse
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    Save Brand Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1.2M</div>
                <p className="text-sm text-muted-foreground">Workflow Executions</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +12% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">99.9%</div>
                <p className="text-sm text-muted-foreground">Uptime SLA</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  All systems operational
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  API Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">45K</div>
                <p className="text-sm text-muted-foreground">API Calls Today</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-blue-600">
                  <Zap className="h-4 w-4" />
                  Average 2.3s response
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}