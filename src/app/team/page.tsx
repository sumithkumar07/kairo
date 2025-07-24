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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus,
  Mail,
  Settings,
  Crown,
  Shield,
  Eye,
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
  ArrowRight
} from 'lucide-react';

// Sample team data
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
    executions: 12847,
    location: 'New York, US',
    phone: '+1 (555) 123-4567'
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
    executions: 9634,
    location: 'San Francisco, US',
    phone: '+1 (555) 234-5678'
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
    executions: 5476,
    location: 'Austin, US',
    phone: '+1 (555) 345-6789'
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david.kim@company.com',
    role: 'Viewer',
    department: 'Sales',
    avatar: 'DK',
    status: 'invited',
    lastActive: 'Never',
    joinedDate: '2024-03-01',
    permissions: ['workflows'],
    workflows: 0,
    executions: 0,
    location: 'Los Angeles, US',
    phone: '+1 (555) 456-7890'
  },
  {
    id: 5,
    name: 'Lisa Wang',
    email: 'lisa.wang@company.com',
    role: 'Editor',
    department: 'Operations',
    avatar: 'LW',
    status: 'inactive',
    lastActive: '2 days ago',
    joinedDate: '2024-01-28',
    permissions: ['workflows', 'monitoring'],
    workflows: 8,
    executions: 3245,
    location: 'Seattle, US',
    phone: '+1 (555) 567-8901'
  }
];

const pendingInvitations = [
  {
    id: 1,
    email: 'john.doe@company.com',
    role: 'Editor',
    department: 'Marketing',
    sentDate: '2024-03-10',
    sentBy: 'Sarah Johnson',
    status: 'pending'
  },
  {
    id: 2,
    email: 'jane.smith@company.com',
    role: 'Viewer',
    department: 'Sales',
    sentDate: '2024-03-12',
    sentBy: 'Michael Chen',
    status: 'pending'
  }
];

const roleDefinitions = [
  {
    name: 'Owner',
    description: 'Full access to all features including billing and team management',
    permissions: ['admin', 'billing', 'workflows', 'integrations', 'analytics', 'monitoring', 'team'],
    icon: Crown,
    color: 'text-yellow-500 bg-yellow-500/10',
    limit: 1
  },
  {
    name: 'Admin',
    description: 'Manage workflows, integrations, and view analytics',
    permissions: ['workflows', 'integrations', 'analytics', 'monitoring'],
    icon: Shield,
    color: 'text-blue-500 bg-blue-500/10',
    limit: 5
  },
  {
    name: 'Editor',
    description: 'Create and edit workflows, view basic analytics',
    permissions: ['workflows', 'analytics'],
    icon: Edit3,
    color: 'text-green-500 bg-green-500/10',
    limit: 20
  },
  {
    name: 'Viewer',
    description: 'View workflows and basic analytics only',
    permissions: ['workflows'],
    icon: Eye,
    color: 'text-gray-500 bg-gray-500/10',
    limit: 50
  }
];

function TeamPage() {
  const [activeTab, setActiveTab] = useState('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'inactive': return 'text-gray-500 bg-gray-500/10';
      case 'invited': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getRoleIcon = (role: string) => {
    const roleConfig = roleDefinitions.find(r => r.name === role);
    return roleConfig ? roleConfig.icon : Users;
  };

  const getRoleColor = (role: string) => {
    const roleConfig = roleDefinitions.find(r => r.name === role);
    return roleConfig ? roleConfig.color : 'text-gray-500 bg-gray-500/10';
  };

  const filteredMembers = teamMembers.filter(member => {
    if (searchTerm && !member.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !member.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (roleFilter !== 'all' && member.role !== roleFilter) return false;
    return true;
  });

  const teamStats = {
    totalMembers: teamMembers.length,
    activeMembers: teamMembers.filter(m => m.status === 'active').length,
    pendingInvites: pendingInvitations.length,
    totalWorkflows: teamMembers.reduce((sum, m) => sum + m.workflows, 0),
    totalExecutions: teamMembers.reduce((sum, m) => sum + m.executions, 0)
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Team <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Management</span>
            </h1>
            <p className="text-muted-foreground">
              Manage team members, roles, and permissions
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" placeholder="colleague@company.com" />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select defaultValue="viewer">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" placeholder="Marketing" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setIsInviteDialogOpen(false)} className="flex-1">
                      <Send className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                    <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{teamStats.totalMembers}</div>
                  <div className="text-sm text-muted-foreground">Total Members</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{teamStats.activeMembers}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{teamStats.pendingInvites}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{teamStats.totalWorkflows}</div>
                  <div className="text-sm text-muted-foreground">Workflows</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Activity className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{teamStats.totalExecutions.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Executions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="members" className="space-y-6">
            {/* Filters */}
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

            {/* Members List */}
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
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {member.location}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span>Role: <strong>{member.role}</strong></span>
                                <span>Last active: {member.lastActive}</span>
                                <span>Joined: {member.joinedDate}</span>
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
                            <Button variant="outline" size="sm" onClick={() => setSelectedMember(member)}>
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

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>Manage outstanding team invitations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div>
                        <div className="font-semibold">{invitation.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {invitation.role} • {invitation.department} • Sent by {invitation.sentBy} on {invitation.sentDate}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Resend
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles & Permissions Tab */}
          <TabsContent value="roles" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {roleDefinitions.map((role, index) => {
                const RoleIcon = role.icon;
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${role.color}`}>
                          <RoleIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{role.name}</CardTitle>
                          <CardDescription>{role.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-2">Permissions:</div>
                          <div className="flex flex-wrap gap-2">
                            {role.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Limit: {role.limit} member{role.limit !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Team member actions and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
                    <div className="p-2 bg-green-500/10 rounded-full">
                      <UserPlus className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">New member invited</div>
                      <div className="text-sm text-muted-foreground">
                        Sarah Johnson invited john.doe@company.com to join as Editor
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                      <Settings className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Permissions updated</div>
                      <div className="text-sm text-muted-foreground">
                        Michael Chen's role changed from Editor to Admin
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">1 day ago</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
                    <div className="p-2 bg-purple-500/10 rounded-full">
                      <CheckCircle className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Invitation accepted</div>
                      <div className="text-sm text-muted-foreground">
                        Emily Rodriguez accepted invitation and joined the team
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">3 days ago</div>
                    </div>
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

export default withAuth(TeamPage);