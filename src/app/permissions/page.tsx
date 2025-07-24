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
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Lock,
  Key,
  Users,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Settings,
  Crown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Save,
  Copy,
  Database,
  Globe,
  Activity,
  FileText,
  BarChart3,
  Zap,
  Monitor,
  Bell,
  Code,
  GitBranch,
  Cloud,
  Workflow,
  MessageSquare,
  Mail,
  Calendar,
  Target,
  Star,
  Award,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Info,
  HelpCircle
} from 'lucide-react';

// Permission categories and definitions
const permissionCategories = [
  {
    id: 'workflows',
    name: 'Workflows',
    description: 'Manage workflow creation, editing, and execution',
    icon: Workflow,
    color: 'text-blue-500 bg-blue-500/10',
    permissions: [
      { id: 'workflows.view', name: 'View Workflows', description: 'View existing workflows and their details' },
      { id: 'workflows.create', name: 'Create Workflows', description: 'Create new workflows' },
      { id: 'workflows.edit', name: 'Edit Workflows', description: 'Modify existing workflows' },
      { id: 'workflows.delete', name: 'Delete Workflows', description: 'Remove workflows permanently' },
      { id: 'workflows.execute', name: 'Execute Workflows', description: 'Trigger workflow execution' },
      { id: 'workflows.publish', name: 'Publish Workflows', description: 'Make workflows available to others' },
      { id: 'workflows.schedule', name: 'Schedule Workflows', description: 'Set up scheduled executions' }
    ]
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Manage third-party service integrations',
    icon: Globe,
    color: 'text-green-500 bg-green-500/10',
    permissions: [
      { id: 'integrations.view', name: 'View Integrations', description: 'View available integrations' },
      { id: 'integrations.connect', name: 'Connect Services', description: 'Connect new third-party services' },
      { id: 'integrations.configure', name: 'Configure Integrations', description: 'Modify integration settings' },
      { id: 'integrations.disconnect', name: 'Disconnect Services', description: 'Remove service connections' },
      { id: 'integrations.credentials', name: 'Manage Credentials', description: 'Handle API keys and tokens' }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Access analytics, reports, and monitoring data',
    icon: BarChart3,
    color: 'text-purple-500 bg-purple-500/10',
    permissions: [
      { id: 'analytics.view', name: 'View Analytics', description: 'Access basic analytics dashboard' },
      { id: 'analytics.reports', name: 'Generate Reports', description: 'Create and download reports' },
      { id: 'analytics.export', name: 'Export Data', description: 'Export analytics data' },
      { id: 'analytics.advanced', name: 'Advanced Analytics', description: 'Access detailed metrics and insights' }
    ]
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    description: 'System monitoring and performance tracking',
    icon: Monitor,
    color: 'text-orange-500 bg-orange-500/10',
    permissions: [
      { id: 'monitoring.view', name: 'View System Status', description: 'Monitor system health and status' },
      { id: 'monitoring.logs', name: 'Access Logs', description: 'View system and execution logs' },
      { id: 'monitoring.alerts', name: 'Manage Alerts', description: 'Configure monitoring alerts' },
      { id: 'monitoring.metrics', name: 'View Metrics', description: 'Access detailed performance metrics' }
    ]
  },
  {
    id: 'team',
    name: 'Team Management',
    description: 'Manage team members and their access',
    icon: Users,
    color: 'text-red-500 bg-red-500/10',
    permissions: [
      { id: 'team.view', name: 'View Team', description: 'View team member list' },
      { id: 'team.invite', name: 'Invite Members', description: 'Send team invitations' },
      { id: 'team.manage', name: 'Manage Members', description: 'Edit member roles and permissions' },
      { id: 'team.remove', name: 'Remove Members', description: 'Remove team members' }
    ]
  },
  {
    id: 'billing',
    name: 'Billing',
    description: 'Manage billing, subscriptions, and usage',
    icon: Crown,
    color: 'text-yellow-500 bg-yellow-500/10',
    permissions: [
      { id: 'billing.view', name: 'View Billing', description: 'View billing information and invoices' },
      { id: 'billing.manage', name: 'Manage Billing', description: 'Update payment methods and plans' },
      { id: 'billing.usage', name: 'View Usage', description: 'Monitor resource usage and limits' }
    ]
  },
  {
    id: 'admin',
    name: 'Administration',
    description: 'Full administrative access',
    icon: Shield,
    color: 'text-gray-900 bg-gray-900/10 dark:text-gray-100 dark:bg-gray-100/10',
    permissions: [
      { id: 'admin.full', name: 'Full Admin Access', description: 'Complete administrative privileges' },
      { id: 'admin.settings', name: 'Organization Settings', description: 'Modify organization settings' },
      { id: 'admin.security', name: 'Security Settings', description: 'Configure security policies' },
      { id: 'admin.api', name: 'API Management', description: 'Manage API keys and access' }
    ]
  }
];

// Role templates
const roleTemplates = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to all features and administrative functions',
    icon: Crown,
    color: 'text-yellow-500 bg-yellow-500/10',
    permissions: ['admin.full', 'admin.settings', 'admin.security', 'admin.api', 'billing.view', 'billing.manage', 'billing.usage', 'team.view', 'team.invite', 'team.manage', 'team.remove'],
    isSystem: true,
    memberCount: 1
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Manage workflows, integrations, and team members',
    icon: Shield,
    color: 'text-blue-500 bg-blue-500/10',
    permissions: ['workflows.view', 'workflows.create', 'workflows.edit', 'workflows.delete', 'workflows.execute', 'workflows.publish', 'workflows.schedule', 'integrations.view', 'integrations.connect', 'integrations.configure', 'integrations.disconnect', 'analytics.view', 'analytics.reports', 'analytics.export', 'analytics.advanced', 'monitoring.view', 'monitoring.logs', 'monitoring.alerts', 'monitoring.metrics', 'team.view', 'team.invite', 'team.manage'],
    isSystem: true,
    memberCount: 3
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Create and manage workflows with basic analytics access',
    icon: Edit3,
    color: 'text-green-500 bg-green-500/10',
    permissions: ['workflows.view', 'workflows.create', 'workflows.edit', 'workflows.execute', 'workflows.schedule', 'integrations.view', 'integrations.connect', 'integrations.configure', 'analytics.view', 'analytics.reports', 'monitoring.view'],
    isSystem: true,
    memberCount: 8
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'View-only access to workflows and basic analytics',
    icon: Eye,
    color: 'text-gray-500 bg-gray-500/10',
    permissions: ['workflows.view', 'workflows.execute', 'integrations.view', 'analytics.view', 'monitoring.view'],
    isSystem: true,
    memberCount: 5
  }
];

// Custom roles
const customRoles = [
  {
    id: 'marketing_manager',
    name: 'Marketing Manager',
    description: 'Specialized role for marketing automation workflows',
    icon: Target,
    color: 'text-pink-500 bg-pink-500/10',
    permissions: ['workflows.view', 'workflows.create', 'workflows.edit', 'workflows.execute', 'workflows.schedule', 'integrations.view', 'integrations.connect', 'analytics.view', 'analytics.reports'],
    isSystem: false,
    memberCount: 2,
    createdBy: 'Sarah Johnson',
    createdDate: '2024-03-01'
  },
  {
    id: 'data_analyst',
    name: 'Data Analyst',
    description: 'Focus on analytics, reporting, and data workflows',
    icon: BarChart3,
    color: 'text-indigo-500 bg-indigo-500/10',
    permissions: ['workflows.view', 'workflows.execute', 'analytics.view', 'analytics.reports', 'analytics.export', 'analytics.advanced', 'monitoring.view', 'monitoring.logs', 'monitoring.metrics'],
    isSystem: false,
    memberCount: 1,
    createdBy: 'Michael Chen',
    createdDate: '2024-03-05'
  }
];

function PermissionsPage() {
  const [activeTab, setActiveTab] = useState('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const allRoles = [...roleTemplates, ...customRoles];

  const togglePermission = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getPermissionName = (permissionId: string) => {
    for (const category of permissionCategories) {
      const permission = category.permissions.find(p => p.id === permissionId);
      if (permission) return permission.name;
    }
    return permissionId;
  };

  const getRolePermissionCount = (permissions: string[]) => {
    return permissions.length;
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Roles & <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Permissions</span>
            </h1>
            <p className="text-muted-foreground">
              Manage access control with role-based permissions
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Export Roles
            </Button>
            <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Custom Role</DialogTitle>
                  <DialogDescription>
                    Define a new role with specific permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="roleName">Role Name</Label>
                      <Input
                        id="roleName"
                        placeholder="e.g., Marketing Manager"
                        value={newRole.name}
                        onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="roleDescription">Description</Label>
                      <Input
                        id="roleDescription"
                        placeholder="Brief description of this role"
                        value={newRole.description}
                        onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">Permissions</Label>
                    <div className="space-y-4 mt-3">
                      {permissionCategories.map((category) => (
                        <Card key={category.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${category.color}`}>
                                <category.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{category.name}</CardTitle>
                                <CardDescription className="text-sm">{category.description}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 gap-3">
                              {category.permissions.map((permission) => (
                                <div key={permission.id} className="flex items-start gap-3">
                                  <Checkbox
                                    id={permission.id}
                                    checked={newRole.permissions.includes(permission.id)}
                                    onCheckedChange={() => togglePermission(permission.id)}
                                  />
                                  <div className="flex-1">
                                    <Label htmlFor={permission.id} className="text-sm font-medium">
                                      {permission.name}
                                    </Label>
                                    <div className="text-xs text-muted-foreground">
                                      {permission.description}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setIsCreateRoleOpen(false)} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Create Role
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* System Roles */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Roles
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {roleTemplates.map((role) => {
                  const RoleIcon = role.icon;
                  return (
                    <Card key={role.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg ${role.color}`}>
                              <RoleIcon className="h-6 w-6" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">{role.name}</CardTitle>
                              <CardDescription>{role.description}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            System
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Members:</span>
                            <span className="font-medium">{role.memberCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Permissions:</span>
                            <span className="font-medium">{getRolePermissionCount(role.permissions)}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Copy className="h-4 w-4 mr-1" />
                              Clone
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Custom Roles */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Custom Roles
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {customRoles.map((role) => {
                  const RoleIcon = role.icon;
                  return (
                    <Card key={role.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg ${role.color}`}>
                              <RoleIcon className="h-6 w-6" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">{role.name}</CardTitle>
                              <CardDescription>{role.description}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            Custom
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Members:</span>
                            <span className="font-medium">{role.memberCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Permissions:</span>
                            <span className="font-medium">{getRolePermissionCount(role.permissions)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created by {role.createdBy} on {role.createdDate}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4 mr-1" />
                              Clone
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <div className="space-y-6">
              {permissionCategories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <category.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{category.name}</CardTitle>
                        <CardDescription className="text-base">{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {category.permissions.map((permission) => (
                        <div key={permission.id} className="p-4 rounded-lg border bg-card/50">
                          <div className="font-semibold mb-2">{permission.name}</div>
                          <div className="text-sm text-muted-foreground">{permission.description}</div>
                          <div className="text-xs text-muted-foreground mt-2 font-mono">
                            {permission.id}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Permission Matrix Tab */}
          <TabsContent value="matrix" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Permission Matrix</CardTitle>
                <CardDescription>
                  Overview of permissions assigned to each role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold min-w-[200px]">Permission</th>
                        {allRoles.map((role) => (
                          <th key={role.id} className="text-center p-3 font-semibold min-w-[120px]">
                            <div className="flex flex-col items-center gap-1">
                              <div className={`p-1.5 rounded-lg ${role.color}`}>
                                <role.icon className="h-4 w-4" />
                              </div>
                              <span className="text-xs">{role.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {permissionCategories.map((category) => (
                        <React.Fragment key={category.id}>
                          <tr className="bg-muted/30">
                            <td colSpan={allRoles.length + 1} className="p-3 font-semibold">
                              <div className="flex items-center gap-2">
                                <category.icon className="h-4 w-4" />
                                {category.name}
                              </div>
                            </td>
                          </tr>
                          {category.permissions.map((permission) => (
                            <tr key={permission.id} className="border-b hover:bg-muted/20">
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{permission.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {permission.description}
                                  </div>
                                </div>
                              </td>
                              {allRoles.map((role) => (
                                <td key={role.id} className="p-3 text-center">
                                  {role.permissions.includes(permission.id) ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(PermissionsPage);