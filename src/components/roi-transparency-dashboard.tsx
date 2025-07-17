'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  DollarSign, 
  BarChart3, 
  PieChart,
  Activity,
  CheckCircle,
  AlertTriangle,
  Users,
  Zap,
  Calendar as CalendarIcon,
  Download,
  Share2,
  FileText,
  Mail,
  Settings,
  Info,
  Award,
  Timer,
  RefreshCw,
  Gauge,
  TrendingDown
} from 'lucide-react';

export interface ROIMetrics {
  timeSaved: {
    total: number; // hours
    weekly: number;
    monthly: number;
    vsManualBaseline: number;
  };
  costSavings: {
    total: number; // dollars
    weekly: number;
    monthly: number;
    laborCosts: number;
    operationalCosts: number;
  };
  errorReduction: {
    percentage: number;
    beforeAutomation: number;
    afterAutomation: number;
    impactValue: number;
  };
  efficiencyGains: {
    overall: number;
    topWorkflows: Array<{
      name: string;
      efficiency: number;
      timeSaved: number;
      errorReduction: number;
    }>;
  };
  productivityMetrics: {
    tasksCompleted: number;
    averageProcessingTime: number;
    throughputIncrease: number;
    qualityScore: number;
  };
}

export interface WorkflowPerformance {
  id: string;
  name: string;
  runs: number;
  successRate: number;
  avgExecutionTime: number;
  timeSaved: number;
  errorRate: number;
  costSavings: number;
  lastRun: string;
  trend: 'up' | 'down' | 'stable';
}

export interface ComplianceMetrics {
  auditTrails: number;
  complianceScore: number;
  violations: number;
  certifications: string[];
  lastAudit: string;
}

interface ROITransparencyDashboardProps {
  metrics: ROIMetrics;
  workflowPerformance: WorkflowPerformance[];
  complianceMetrics: ComplianceMetrics;
  onGenerateReport: (type: 'weekly' | 'monthly' | 'custom', dateRange?: [Date, Date]) => void;
  onExportData: (format: 'csv' | 'pdf' | 'excel') => void;
  onScheduleReport: (frequency: 'weekly' | 'monthly', recipients: string[]) => void;
}

export function ROITransparencyDashboard({
  metrics,
  workflowPerformance,
  complianceMetrics,
  onGenerateReport,
  onExportData,
  onScheduleReport
}: ROITransparencyDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('monthly');
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date()
  ]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${Math.round(hours * 10) / 10}h`;
  };

  const getPerformanceTrend = (workflow: WorkflowPerformance) => {
    switch (workflow.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Activity className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalROI = metrics.costSavings.total + metrics.timeSaved.total * 50; // Assuming $50/hour
  const roiPercentage = ((totalROI / 100000) * 100); // Assuming $100k investment

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Time Saved</p>
                <p className="text-2xl font-bold">{formatTime(metrics.timeSaved.total)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+{Math.round(metrics.timeSaved.vsManualBaseline * 100)}%</span>
              <span className="text-muted-foreground ml-1">vs manual</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost Savings</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.costSavings.total)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">Monthly: </span>
              <span className="font-medium ml-1">{formatCurrency(metrics.costSavings.monthly)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Reduction</p>
                <p className="text-2xl font-bold">{metrics.errorReduction.percentage.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">Impact: </span>
              <span className="font-medium ml-1">{formatCurrency(metrics.errorReduction.impactValue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ROI</p>
                <p className="text-2xl font-bold">{roiPercentage.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">Total Value: </span>
              <span className="font-medium ml-1">{formatCurrency(totalROI)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Time Range:</label>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Workflow:</label>
            <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workflows</SelectItem>
                {workflowPerformance.map(workflow => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => onGenerateReport('weekly')}
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => onExportData('csv')}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button 
            variant="outline"
            className="flex items-center gap-1"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Savings Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Time Savings Breakdown</CardTitle>
                <CardDescription>Hours saved across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Manual Tasks</span>
                    <div className="flex items-center gap-2">
                      <Progress value={75} className="w-24" />
                      <span className="text-sm">{formatTime(metrics.timeSaved.total * 0.75)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Processing</span>
                    <div className="flex items-center gap-2">
                      <Progress value={60} className="w-24" />
                      <span className="text-sm">{formatTime(metrics.timeSaved.total * 0.6)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Assurance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-24" />
                      <span className="text-sm">{formatTime(metrics.timeSaved.total * 0.45)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reporting</span>
                    <div className="flex items-center gap-2">
                      <Progress value={30} className="w-24" />
                      <span className="text-sm">{formatTime(metrics.timeSaved.total * 0.3)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Savings Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Savings Analysis</CardTitle>
                <CardDescription>Financial impact of automation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Labor Costs</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-24" />
                      <span className="text-sm">{formatCurrency(metrics.costSavings.laborCosts)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Operational Costs</span>
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-24" />
                      <span className="text-sm">{formatCurrency(metrics.costSavings.operationalCosts)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Error Costs</span>
                    <div className="flex items-center gap-2">
                      <Progress value={40} className="w-24" />
                      <span className="text-sm">{formatCurrency(metrics.errorReduction.impactValue)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Opportunity Costs</span>
                    <div className="flex items-center gap-2">
                      <Progress value={55} className="w-24" />
                      <span className="text-sm">{formatCurrency(metrics.costSavings.total * 0.15)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Efficiency Gains */}
          <Card>
            <CardHeader>
              <CardTitle>Top Efficiency Gains</CardTitle>
              <CardDescription>Workflows delivering the highest impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.efficiencyGains.topWorkflows.map((workflow, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <span className="font-medium">{workflow.name}</span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{workflow.efficiency}% efficiency</span>
                          <span>{formatTime(workflow.timeSaved)} saved</span>
                          <span>{workflow.errorReduction}% error reduction</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {workflow.efficiency}% gain
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Performance</CardTitle>
              <CardDescription>Detailed performance metrics for each workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflowPerformance.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getPerformanceTrend(workflow)}
                        <span className="font-medium">{workflow.name}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          <span>{workflow.runs} runs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          <span className={getSuccessRateColor(workflow.successRate)}>
                            {workflow.successRate}% success
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          <span>{formatTime(workflow.avgExecutionTime / 3600)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          {formatTime(workflow.timeSaved)} saved
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(workflow.costSavings)}
                        </div>
                      </div>
                      <Badge variant={workflow.errorRate < 5 ? "default" : "destructive"}>
                        {workflow.errorRate.toFixed(1)}% errors
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Productivity Metrics</CardTitle>
                <CardDescription>Overall team productivity improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tasks Completed</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{metrics.productivityMetrics.tasksCompleted}</span>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Processing Time</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{formatTime(metrics.productivityMetrics.averageProcessingTime)}</span>
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Throughput Increase</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{metrics.productivityMetrics.throughputIncrease}%</span>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{metrics.productivityMetrics.qualityScore.toFixed(1)}</span>
                      <Badge variant="default">Excellent</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Trends</CardTitle>
                <CardDescription>Performance trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {metrics.efficiencyGains.overall}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Overall Efficiency Gain
                    </div>
                  </div>
                  
                  <Progress value={metrics.efficiencyGains.overall} className="h-3" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-semibold">95%</div>
                      <div className="text-muted-foreground">Automation Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">4.8/5</div>
                      <div className="text-muted-foreground">User Satisfaction</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                    <p className="text-2xl font-bold">{complianceMetrics.complianceScore}%</p>
                  </div>
                  <Badge variant={complianceMetrics.complianceScore >= 90 ? "default" : "destructive"}>
                    {complianceMetrics.complianceScore >= 90 ? "Compliant" : "Issues"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Audit Trails</p>
                    <p className="text-2xl font-bold">{complianceMetrics.auditTrails.toLocaleString()}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Violations</p>
                    <p className="text-2xl font-bold">{complianceMetrics.violations}</p>
                  </div>
                  <AlertTriangle className={`h-8 w-8 ${complianceMetrics.violations > 0 ? 'text-red-600' : 'text-green-600'}`} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Certifications & Standards</CardTitle>
              <CardDescription>Compliance with industry standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {complianceMetrics.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{cert}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Reports</CardTitle>
              <CardDescription>Schedule and manage automated ROI reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <span className="font-medium">Weekly Performance Report</span>
                    <p className="text-sm text-muted-foreground">
                      Every Monday at 9:00 AM
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <span className="font-medium">Monthly Executive Summary</span>
                    <p className="text-sm text-muted-foreground">
                      First day of each month
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <span className="font-medium">Quarterly ROI Analysis</span>
                    <p className="text-sm text-muted-foreground">
                      End of each quarter
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Paused</Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Report Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ROITransparencyDashboard;