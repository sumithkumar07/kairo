'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bell, 
  BellRing, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Clock,
  Play,
  Zap,
  Users,
  Award,
  Activity,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  category: 'workflow' | 'system' | 'integration' | 'team' | 'achievement' | 'security';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: any;
}

interface NotificationSystemProps {
  className?: string;
}

export function RealTimeNotifications({ className }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize with some sample notifications
    const initialNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        category: 'workflow',
        title: 'Workflow Completed',
        message: 'Lead Nurturing Campaign executed successfully with 147 processed leads',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        read: false,
        actionUrl: '/analytics?tab=overview',
        actionText: 'View Details',
        metadata: { workflowId: 'wf_001', executions: 147 }
      },
      {
        id: '2',
        type: 'info',
        category: 'integration',
        title: 'New Integration Available',
        message: 'Microsoft Teams integration is now available in the marketplace',
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        read: false,
        actionUrl: '/integrations?tab=marketplace',
        actionText: 'Browse Marketplace',
        metadata: { integration: 'microsoft-teams' }
      },
      {
        id: '3',
        type: 'warning',
        category: 'system',
        title: 'High Memory Usage',
        message: 'System memory usage has exceeded 80% threshold',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        read: false,
        actionUrl: '/analytics?tab=monitoring',
        actionText: 'Check System Health',
        metadata: { usage: 87, threshold: 80 }
      },
      {
        id: '4',
        type: 'success',
        category: 'achievement',
        title: 'Certification Earned',
        message: 'Team member Emily Rodriguez completed AI Fundamentals certification',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        read: true,
        actionUrl: '/learn?tab=courses',
        actionText: 'View Learning Progress',
        metadata: { user: 'Emily Rodriguez', certification: 'AI Fundamentals', score: 94 }
      },
      {
        id: '5',
        type: 'info',
        category: 'team',
        title: 'New Team Member',
        message: 'Alex Thompson joined your team as Editor',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        read: true,
        actionUrl: '/account?tab=team',
        actionText: 'Manage Team',
        metadata: { user: 'Alex Thompson', role: 'Editor' }
      }
    ];

    setNotifications(initialNotifications);
    setUnreadCount(initialNotifications.filter(n => !n.read).length);

    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: ['success', 'info', 'warning'][Math.floor(Math.random() * 3)] as any,
        category: ['workflow', 'system', 'integration', 'team'][Math.floor(Math.random() * 4)] as any,
        title: 'New Activity',
        message: `System event at ${format(new Date(), 'HH:mm:ss')}`,
        timestamp: new Date(),
        read: false,
        actionUrl: '/analytics',
        actionText: 'View Details'
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
      setUnreadCount(prev => prev + 1);
    }, 30000); // New notification every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: string, category: string) => {
    if (type === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (type === 'error') return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (type === 'warning') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (type === 'info') return <Info className="h-4 w-4 text-blue-500" />;
    
    // Category-specific icons
    if (category === 'workflow') return <Play className="h-4 w-4 text-blue-500" />;
    if (category === 'integration') return <Zap className="h-4 w-4 text-purple-500" />;
    if (category === 'team') return <Users className="h-4 w-4 text-green-500" />;
    if (category === 'achievement') return <Award className="h-4 w-4 text-yellow-500" />;
    if (category === 'security') return <Settings className="h-4 w-4 text-red-500" />;
    
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50 dark:bg-green-900/10';
      case 'error': return 'border-red-200 bg-red-50 dark:bg-red-900/10';
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10';
      case 'info': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/10';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-sm"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`${getNotificationColor(notification.type)} ${
                    !notification.read ? 'ring-2 ring-primary/20' : ''
                  } transition-all duration-200`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate">
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNotification(notification.id)}
                              className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(notification.timestamp, 'PPp')}
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 text-xs"
                              >
                                Mark as read
                              </Button>
                            )}
                            {notification.actionUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => {
                                  window.open(notification.actionUrl, '_blank');
                                  markAsRead(notification.id);
                                }}
                              >
                                {notification.actionText || 'View'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}