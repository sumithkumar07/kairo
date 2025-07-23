'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  WifiOff, 
  RefreshCcw, 
  Workflow, 
  Eye, 
  Settings,
  CheckCircle,
  Clock,
  AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  const cachedFeatures = [
    {
      title: 'View Workflows',
      description: 'Access your recently viewed workflows',
      icon: Workflow,
      available: true,
      href: '/workflow'
    },
    {
      title: 'Account Settings',
      description: 'Manage your profile and preferences',
      icon: Settings,
      available: true,
      href: '/account'
    },
    {
      title: 'Help & Documentation',
      description: 'Browse cached help articles',
      icon: Eye,
      available: true,
      href: '/help'
    }
  ];

  const limitedFeatures = [
    'Live collaboration',
    'Real-time data sync',
    'Cloud integrations',
    'AI-powered features',
    'Marketplace updates'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Offline Status Card */}
        <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-orange-100 dark:bg-orange-900/50 rounded-full w-fit mb-4">
              <WifiOff className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl text-orange-800 dark:text-orange-200">
              You're Offline
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              Don't worry! You can still access some features while offline.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleRetry} className="bg-orange-600 hover:bg-orange-700">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>

        {/* Available Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              Available Offline
            </CardTitle>
            <CardDescription>
              These features work without an internet connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {cachedFeatures.map((feature) => (
                <div key={feature.title} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded">
                      <feature.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30">
                    <Link href={feature.href}>
                      Access
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Limited Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Clock className="h-5 w-5" />
              Limited While Offline
            </CardTitle>
            <CardDescription>
              These features require an internet connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {limitedFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3 p-2 border rounded border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-amber-800 dark:text-amber-200 text-sm">
                    {feature}
                  </span>
                  <Badge variant="outline" className="ml-auto border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
                    Offline
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              💡 Offline Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300 text-sm space-y-2">
            <p>• Your work is automatically saved locally and will sync when you're back online</p>
            <p>• Recently viewed workflows are cached for offline access</p>
            <p>• Changes made offline will be synchronized once connection is restored</p>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <div className="text-center text-muted-foreground text-sm">
          <p>Kairo AI • Progressive Web App</p>
          <p>Connection will be restored automatically when available</p>
        </div>
      </div>
    </div>
  );
}