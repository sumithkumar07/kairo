'use client';

import React from 'react';
import { EnhancedAppLayout } from '@/components/enhanced-app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { WorkflowCanvas } from '@/components/ui/workflow-canvas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Workflow,
  Plus,
  Brain,
  Sparkles,
  Grid3X3,
  Route,
  Code,
  Zap,
  ArrowRight
} from 'lucide-react';

function WorkflowPage() {
  return (
    <EnhancedAppLayout>
      <div className="h-screen flex flex-col">
        {/* Enhanced Header */}
        <div className="border-b bg-card/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Workflow className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Professional Workflow Editor</h1>
                <p className="text-muted-foreground">
                  Advanced canvas with visual grid, connection previews, and professional editing tools
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                <Grid3X3 className="h-3 w-3 mr-1" />
                Visual Grid Active
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Route className="h-3 w-3 mr-1" />
                Connection Previews
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Snap-to-Grid</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Professional alignment with visual grid system
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Connection Previews</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time validation and visual feedback
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Mini-map</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Navigate large workflows with ease
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Advanced Nodes</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  200+ professional node library
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Professional Workflow Canvas */}
        <div className="flex-1">
          <WorkflowCanvas />
        </div>

        {/* Feature Showcase Footer */}
        <div className="border-t bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Professional grid system active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Connection validation enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span>AI assistance ready</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Brain className="h-4 w-4 mr-2" />
                AI Assist
              </Button>
              <Button variant="outline" size="sm">
                <Code className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600">
                <Zap className="h-4 w-4 mr-2" />
                Deploy Workflow
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </EnhancedAppLayout>
  );
}

export default withAuth(WorkflowPage);