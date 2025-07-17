'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  Users, 
  MessageSquare, 
  Eye, 
  Edit, 
  UserCheck, 
  UserX, 
  Crown, 
  Shield,
  Clock,
  Send,
  Plus,
  X,
  Zap,
  Lock,
  Globe
} from 'lucide-react';

// Types for collaboration features
interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  isOnline: boolean;
  cursor?: { x: number; y: number };
  lastSeen?: Date;
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  nodeId?: string;
  position?: { x: number; y: number };
  resolved?: boolean;
  replies?: Comment[];
}

interface Permission {
  canView: boolean;
  canEdit: boolean;
  canExecute: boolean;
  canShare: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
}

// Real-time Collaboration Panel
export function CollaborationPanel({ 
  users, 
  currentUser, 
  onInviteUser, 
  onRemoveUser, 
  onChangeUserRole 
}: {
  users: CollaborationUser[];
  currentUser: CollaborationUser;
  onInviteUser: (email: string, role: CollaborationUser['role']) => void;
  onRemoveUser: (userId: string) => void;
  onChangeUserRole: (userId: string, role: CollaborationUser['role']) => void;
}) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CollaborationUser['role']>('viewer');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const handleInvite = () => {
    if (inviteEmail) {
      onInviteUser(inviteEmail, inviteRole);
      setInviteEmail('');
      setShowInviteForm(false);
    }
  };

  const getRoleColor = (role: CollaborationUser['role']) => {
    switch (role) {
      case 'owner': return 'bg-yellow-500';
      case 'admin': return 'bg-red-500';
      case 'editor': return 'bg-blue-500';
      case 'viewer': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: CollaborationUser['role']) => {
    switch (role) {
      case 'owner': return Crown;
      case 'admin': return Shield;
      case 'editor': return Edit;
      case 'viewer': return Eye;
      default: return Eye;
    }
  };

  const onlineUsers = users.filter(user => user.isOnline);
  const offlineUsers = users.filter(user => !user.isOnline);

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration
          </div>
          <Badge variant="secondary">{users.length} users</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Online Users */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Online ({onlineUsers.length})</span>
          </div>
          {onlineUsers.map((user) => {
            const RoleIcon = getRoleIcon(user.role);
            return (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{user.name}</span>
                    <RoleIcon className={cn("h-3 w-3", getRoleColor(user.role))} />
                  </div>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
                {currentUser.role === 'owner' && user.id !== currentUser.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveUser(user.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Offline Users */}
        {offlineUsers.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-sm font-medium">Offline ({offlineUsers.length})</span>
              </div>
              {offlineUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 opacity-60">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-500 rounded-full border-2 border-background"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{user.name}</span>
                        <RoleIcon className={cn("h-3 w-3", getRoleColor(user.role))} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {user.lastSeen ? `Last seen ${user.lastSeen.toLocaleTimeString()}` : 'Never'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Invite User */}
        <Separator />
        <div className="space-y-3">
          {!showInviteForm ? (
            <Button
              variant="outline"
              onClick={() => setShowInviteForm(true)}
              className="w-full"
              disabled={currentUser.role !== 'owner' && currentUser.role !== 'admin'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="text-sm"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as CollaborationUser['role'])}
                className="w-full px-3 py-2 text-sm border rounded-md"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleInvite} className="flex-1">
                  Invite
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowInviteForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Comments System
export function CommentsPanel({ 
  comments, 
  onAddComment, 
  onReplyToComment, 
  onResolveComment, 
  currentUser 
}: {
  comments: Comment[];
  onAddComment: (content: string, nodeId?: string, position?: { x: number; y: number }) => void;
  onReplyToComment: (commentId: string, content: string) => void;
  onResolveComment: (commentId: string) => void;
  currentUser: CollaborationUser;
}) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const handleReply = (commentId: string) => {
    if (replyContent.trim()) {
      onReplyToComment(commentId, replyContent);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const unresolvedComments = comments.filter(comment => !comment.resolved);
  const resolvedComments = comments.filter(comment => comment.resolved);

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments
          </div>
          <Badge variant="secondary">{unresolvedComments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px] resize-none"
          />
          <Button onClick={handleAddComment} disabled={!newComment.trim()} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
        </div>

        <Separator />

        {/* Comments List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {/* Unresolved Comments */}
            {unresolvedComments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Active Comments</h4>
                {unresolvedComments.map((comment) => (
                  <div key={comment.id} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">User</span>
                          <span className="text-xs text-muted-foreground">
                            {comment.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">U</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">User</span>
                                <span className="text-xs text-muted-foreground">
                                  {reply.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-xs">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(comment.id)}
                        className="h-7 text-xs"
                      >
                        Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResolveComment(comment.id)}
                        className="h-7 text-xs"
                      >
                        Resolve
                      </Button>
                    </div>
                    
                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="ml-8 space-y-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[40px] resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyContent.trim()}
                            className="h-7 text-xs"
                          >
                            Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReplyingTo(null)}
                            className="h-7 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Resolved Comments */}
            {resolvedComments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Resolved Comments</h4>
                {resolvedComments.map((comment) => (
                  <div key={comment.id} className="space-y-2 p-3 border rounded-lg opacity-60">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">User</span>
                          <Badge variant="secondary" className="text-xs">Resolved</Badge>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Presence Indicators
export function PresenceIndicator({ user }: { user: CollaborationUser }) {
  const getRoleColor = (role: CollaborationUser['role']) => {
    switch (role) {
      case 'owner': return 'border-yellow-500';
      case 'admin': return 'border-red-500';
      case 'editor': return 'border-blue-500';
      case 'viewer': return 'border-gray-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "absolute z-50 flex items-center gap-2 bg-background/90 backdrop-blur-sm border rounded-lg px-2 py-1 shadow-md",
              getRoleColor(user.role)
            )}
            style={{
              left: user.cursor?.x || 0,
              top: user.cursor?.y || 0,
              transform: 'translate(-50%, -100%) translateY(-8px)'
            }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">{user.name}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{user.name} ({user.role})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Role-based Access Control
export function RolePermissions({ 
  userRole, 
  permissions, 
  onPermissionChange 
}: {
  userRole: CollaborationUser['role'];
  permissions: Permission;
  onPermissionChange: (permission: keyof Permission, value: boolean) => void;
}) {
  const permissionLabels = {
    canView: 'View workflow',
    canEdit: 'Edit workflow',
    canExecute: 'Execute workflow',
    canShare: 'Share workflow',
    canDelete: 'Delete workflow',
    canManageUsers: 'Manage users'
  };

  const isDisabled = (permission: keyof Permission) => {
    // Owner has all permissions and can't be changed
    if (userRole === 'owner') return true;
    
    // Some permissions are role-dependent
    if (permission === 'canManageUsers' && userRole !== 'admin') return true;
    
    return false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Permissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(permissionLabels).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{label}</span>
            </div>
            <input
              type="checkbox"
              checked={permissions[key as keyof Permission]}
              onChange={(e) => onPermissionChange(key as keyof Permission, e.target.checked)}
              disabled={isDisabled(key as keyof Permission)}
              className="h-4 w-4"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}