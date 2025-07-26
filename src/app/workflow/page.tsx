'use client';

import React from 'react';
import { EnhancedAppLayout } from '@/components/enhanced-app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { WorkflowCanvas } from '@/components/ui/enhanced-workflow-canvas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InteractiveButton } from '@/components/ui/enhanced-interactive-elements';
import { StatusIndicator } from '@/components/ui/enhanced-status-indicators';
import { 
  Workflow,
  Plus,
  Brain,
  Sparkles,
  Grid3X3,
  Route,
  Code,
  Zap,
  ArrowRight,
  Target,
  Activity,
  Settings,
  Eye,
  Play,
  Share,
  Download,
  Upload,
  Copy,
  Layers,
  Monitor,
  BarChart3
} from 'lucide-react';

function WorkflowPage() {
  return (
    <EnhancedAppLayout>
      <div className="h-screen flex flex-col">
        {/* Enhanced Header */}
        <div className="border-b bg-gradient-to-r from-card/50 via-card to-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Workflow className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Professional Workflow Editor
                </h1>
                <p className="text-muted-foreground text-lg">
                  Advanced canvas with AI assistance, visual grid system, and professional editing tools
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <StatusIndicator status="healthy" label="Grid System Active" size="sm" />
              <StatusIndicator status="healthy" label="Connection Previews" size="sm" />
              <StatusIndicator status="healthy" label="AI-Powered" size="sm" />
            </div>
          </div>

          {/* Professional Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 hover:shadow-md transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Grid3X3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold">Snap-to-Grid</span>
                    <p className="text-xs text-muted-foreground">
                      Professional alignment system
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 hover:shadow-md transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Route className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold">Connection Previews</span>
                    <p className="text-xs text-muted-foreground">
                      Real-time validation & feedback
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 hover:shadow-md transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold">Mini-map Navigation</span>
                    <p className="text-xs text-muted-foreground">
                      Navigate large workflows
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 hover:shadow-md transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Code className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold">Advanced Nodes</span>
                    <p className="text-xs text-muted-foreground">
                      200+ professional node library
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Workflow Canvas */}
        <div className="flex-1 relative">
          <WorkflowCanvas />
        </div>

        {/* Professional Status Footer */}
        <div className="border-t bg-gradient-to-r from-muted/30 via-background to-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-sm">
                <StatusIndicator status="active" size="sm" showIcon={false} />
                <span className="text-muted-foreground">Professional grid system active</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <StatusIndicator status="healthy" size="sm" showIcon={false} />
                <span className="text-muted-foreground">Connection validation enabled</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <StatusIndicator status="success" size="sm" showIcon={false} />
                <span className="text-muted-foreground">AI assistance ready</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <InteractiveButton variant="outline" size="sm" icon={Brain}>
                AI Assist
              </InteractiveButton>
              <InteractiveButton variant="outline" size="sm" icon={Code}>
                Templates
              </InteractiveButton>
              <InteractiveButton variant="outline" size="sm" icon={Monitor}>
                Analytics
              </InteractiveButton>
              <InteractiveButton 
                size="sm" 
                gradient="from-primary to-purple-600"
                glow
                icon={Zap}
              >
                Deploy Workflow
                <ArrowRight className="h-4 w-4 ml-2" />
              </InteractiveButton>
            </div>
          </div>
        </div>
      </div>
    </EnhancedAppLayout>
  );
}

export default withAuth(WorkflowPage);