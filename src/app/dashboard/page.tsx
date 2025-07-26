'use client';

import { useState } from 'react';
import { EnhancedAppLayout } from '@/components/enhanced-app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedDashboardV3 } from '@/components/enhanced-dashboard-v3';
import { EnhancedAnalyticsDashboard } from '@/components/enhanced-analytics-dashboard';
import { AIIntelligenceDashboard } from '@/components/ai-intelligence-dashboard';
import { PerformanceMonitorDashboard } from '@/components/performance-monitor-dashboard';
import { InsightsDashboard } from '@/components/insights-dashboard';
import { 
  LayoutDashboard, 
  Brain, 
  BarChart3, 
  Activity, 
  Lightbulb,
  TrendingUp 
} from 'lucide-react';

function DashboardPage() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'overview';
    }
    return 'overview';
  });

  return (
    <EnhancedAppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Command Center
              </span>
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Unified dashboard with advanced analytics and AI intelligence
            </p>
          </div>
        </div>

        {/* Consolidated Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="ai-intelligence" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Intelligence</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <EnhancedDashboardV3 />
          </TabsContent>

          {/* AI Intelligence Tab - Advanced AI features */}
          <TabsContent value="ai-intelligence" className="space-y-6">
            <AIIntelligenceDashboard />
          </TabsContent>

          {/* Analytics Tab - Advanced analytics moved from /analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <EnhancedAnalyticsDashboard />
          </TabsContent>

          {/* Performance Tab - System monitoring */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceMonitorDashboard />
          </TabsContent>

          {/* Insights Tab - AI-powered insights */}
          <TabsContent value="insights" className="space-y-6">
            <InsightsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAppLayout>
  );
}

export default withAuth(DashboardPage);