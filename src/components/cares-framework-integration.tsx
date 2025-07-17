'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Brain, 
  Users, 
  Shield, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Target,
  Settings,
  Activity,
  Eye,
  TrendingUp,
  Timer,
  Gauge,
  Zap,
  MessageSquare,
  Lightbulb,
  Crosshair,
  Database,
  Award,
  Clock,
  FileText,
  Bell,
  Info
} from 'lucide-react';

// Import our CARES framework components
import ExplainabilityLayer, { AIDecision, ExplainabilityConfig } from './explainability-layer';
import HumanAICollaboration, { HumanReviewRequest, EscalationTrigger, CollaborationMetrics } from './human-ai-collaboration';
import SelfHealingData, { DataQualityIssue, DataValidationRule, DataHealthMetrics, CrossSystemLookup } from './self-healing-data';
import ROITransparencyDashboard, { ROIMetrics, WorkflowPerformance, ComplianceMetrics } from './roi-transparency-dashboard';

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  description?: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  lastExecutionStatus?: 'success' | 'error' | 'skipped' | 'pending' | 'running';
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourceHandle?: string;
  targetNodeId: string;
  targetHandle?: string;
}

export interface WorkflowExecutionResult {
  finalWorkflowData: Record<string, any>;
  serverLogs: Array<{
    timestamp: string;
    message: string;
    type: 'info' | 'error' | 'success';
  }>;
}

interface CARESFrameworkIntegrationProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  executionResult?: WorkflowExecutionResult;
  onNodeUpdate: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onRequestHumanReview: (nodeId: string, reason: string) => void;
  onAutoFixIssue: (issueId: string) => void;
  onExplainDecision: (decisionId: string) => void;
  userId?: string;
  isSimulationMode?: boolean;
}

export function CARESFrameworkIntegration({
  nodes,
  connections,
  executionResult,
  onNodeUpdate,
  onRequestHumanReview,
  onAutoFixIssue,
  onExplainDecision,
  userId,
  isSimulationMode = false
}: CARESFrameworkIntegrationProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDecision, setSelectedDecision] = useState<AIDecision | null>(null);
  const [showReasoningDialog, setShowReasoningDialog] = useState(false);
  const [caresMetrics, setCARESMetrics] = useState({
    explainabilityScore: 0,
    humanCollaborationScore: 0,
    dataHealthScore: 0,
    resilienceScore: 0,
    exceptionHandlingScore: 0,
    adoptionScore: 0,
    ethicsScore: 0,
    roiScore: 0
  });

  // Mock data for demonstration - in real app, this would come from the backend
  const [aiDecisions, setAIDecisions] = useState<AIDecision[]>([
    {
      id: '1',
      nodeId: 'node1',
      nodeName: 'Data Validation',
      action: 'Automatically corrected 5 invalid email formats',
      confidence: 92,
      reasoning: 'Applied regex pattern validation and standardized email formats based on RFC 5322 specifications',
      timestamp: new Date().toISOString(),
      outcome: 'success',
      riskLevel: 'low',
      alternatives: ['Flag for manual review', 'Reject invalid emails'],
      dataUsed: ['Email validation patterns', 'Historical correction data'],
      humanReviewRequired: false
    },
    {
      id: '2',
      nodeId: 'node2',
      nodeName: 'Sentiment Analysis',
      action: 'Escalated customer feedback to human review',
      confidence: 68,
      reasoning: 'Sentiment score of -0.4 falls below threshold of -0.3, indicating potentially negative feedback requiring human attention',
      timestamp: new Date().toISOString(),
      outcome: 'pending',
      riskLevel: 'medium',
      alternatives: ['Continue with automated response', 'Apply sentiment-specific templates'],
      dataUsed: ['Customer feedback text', 'Sentiment model predictions'],
      humanReviewRequired: true
    }
  ]);

  const [explainabilityConfig, setExplainabilityConfig] = useState<ExplainabilityConfig>({
    showConfidenceIndicators: true,
    showReasoningButtons: true,
    showDecisionLogs: true,
    showRiskAssessment: true,
    requireHumanReview: true,
    confidenceThreshold: 85
  });

  const [humanReviewRequests, setHumanReviewRequests] = useState<HumanReviewRequest[]>([
    {
      id: '1',
      nodeId: 'node2',
      nodeName: 'Sentiment Analysis',
      type: 'review',
      priority: 'high',
      status: 'pending',
      aiDecision: 'Escalate to human review',
      aiReasoning: 'Sentiment score below threshold',
      aiConfidence: 68,
      requestedAt: new Date().toISOString(),
      escalationTrigger: 'Sentiment score < -0.3',
      estimatedTimeToReview: 300
    }
  ]);

  const [escalationTriggers, setEscalationTriggers] = useState<EscalationTrigger[]>([
    {
      id: '1',
      type: 'sentiment',
      name: 'Negative Sentiment Detection',
      description: 'Escalate when sentiment score falls below threshold',
      threshold: -0.3,
      enabled: true,
      severity: 'high',
      autoEscalate: true
    },
    {
      id: '2',
      type: 'confidence',
      name: 'Low Confidence Threshold',
      description: 'Escalate when AI confidence is below 85%',
      threshold: 85,
      enabled: true,
      severity: 'medium',
      autoEscalate: true
    }
  ]);

  const [collaborationMetrics, setCollaborationMetrics] = useState<CollaborationMetrics>({
    totalRequests: 15,
    approvalRate: 92.3,
    averageResponseTime: 180,
    escalationRate: 8.7,
    aiAccuracy: 94.2,
    humanOverride: 5.8,
    satisfactionScore: 4.6
  });

  const [dataQualityIssues, setDataQualityIssues] = useState<DataQualityIssue[]>([
    {
      id: '1',
      type: 'duplicate',
      severity: 'medium',
      field: 'customer_email',
      value: 'john.doe@example.com',
      suggestion: 'Merge duplicate records based on email matching',
      autoFixAvailable: true,
      affectedRecords: 3,
      detectedAt: new Date().toISOString(),
      status: 'detected',
      confidence: 95
    },
    {
      id: '2',
      type: 'missing',
      severity: 'high',
      field: 'phone_number',
      value: null,
      suggestion: 'Lookup phone number from customer database',
      autoFixAvailable: true,
      affectedRecords: 12,
      detectedAt: new Date().toISOString(),
      status: 'detected',
      confidence: 88
    }
  ]);

  const [dataHealthMetrics, setDataHealthMetrics] = useState<DataHealthMetrics>({
    totalRecords: 1000,
    validRecords: 945,
    duplicateRecords: 3,
    missingFields: 52,
    invalidFormats: 8,
    overallHealth: 94.5,
    healingRate: 96.2,
    autoFixSuccessRate: 91.7
  });

  const [roiMetrics, setROIMetrics] = useState<ROIMetrics>({
    timeSaved: {
      total: 120,
      weekly: 30,
      monthly: 120,
      vsManualBaseline: 0.75
    },
    costSavings: {
      total: 25000,
      weekly: 6250,
      monthly: 25000,
      laborCosts: 18000,
      operationalCosts: 7000
    },
    errorReduction: {
      percentage: 87.5,
      beforeAutomation: 45,
      afterAutomation: 6,
      impactValue: 12000
    },
    efficiencyGains: {
      overall: 78,
      topWorkflows: [
        { name: 'Data Processing', efficiency: 85, timeSaved: 45, errorReduction: 92 },
        { name: 'Customer Onboarding', efficiency: 78, timeSaved: 35, errorReduction: 85 },
        { name: 'Invoice Processing', efficiency: 72, timeSaved: 40, errorReduction: 88 }
      ]
    },
    productivityMetrics: {
      tasksCompleted: 1250,
      averageProcessingTime: 0.5,
      throughputIncrease: 145,
      qualityScore: 4.7
    }
  });

  const [workflowPerformance, setWorkflowPerformance] = useState<WorkflowPerformance[]>([
    {
      id: '1',
      name: 'Customer Data Processing',
      runs: 156,
      successRate: 94.2,
      avgExecutionTime: 1800,
      timeSaved: 45,
      errorRate: 5.8,
      costSavings: 8500,
      lastRun: new Date().toISOString(),
      trend: 'up'
    },
    {
      id: '2',
      name: 'Invoice Validation',
      runs: 89,
      successRate: 97.8,
      avgExecutionTime: 1200,
      timeSaved: 32,
      errorRate: 2.2,
      costSavings: 6200,
      lastRun: new Date().toISOString(),
      trend: 'up'
    }
  ]);

  // Calculate CARES metrics based on current state
  useEffect(() => {
    const explainabilityScore = aiDecisions.reduce((sum, d) => sum + d.confidence, 0) / aiDecisions.length || 0;
    const humanCollaborationScore = collaborationMetrics.approvalRate;
    const dataHealthScore = dataHealthMetrics.overallHealth;
    const resilienceScore = workflowPerformance.reduce((sum, w) => sum + w.successRate, 0) / workflowPerformance.length || 0;
    const exceptionHandlingScore = 100 - (workflowPerformance.reduce((sum, w) => sum + w.errorRate, 0) / workflowPerformance.length || 0);
    const adoptionScore = collaborationMetrics.satisfactionScore * 20; // Convert 5-point scale to 100-point
    const ethicsScore = 85; // Would be calculated based on bias metrics, PII protection, etc.
    const roiScore = Math.min(100, (roiMetrics.efficiencyGains.overall + roiMetrics.errorReduction.percentage) / 2);

    setCARESMetrics({
      explainabilityScore,
      humanCollaborationScore,
      dataHealthScore,
      resilienceScore,
      exceptionHandlingScore,
      adoptionScore,
      ethicsScore,
      roiScore
    });
  }, [aiDecisions, collaborationMetrics, dataHealthMetrics, workflowPerformance, roiMetrics]);

  // Event handlers
  const handleRequestHumanReview = (decisionId: string) => {
    const decision = aiDecisions.find(d => d.id === decisionId);
    if (decision) {
      onRequestHumanReview(decision.nodeId, `AI decision "${decision.action}" needs human review`);
    }
  };

  const handleShowReasoning = (decisionId: string) => {
    const decision = aiDecisions.find(d => d.id === decisionId);
    if (decision) {
      setSelectedDecision(decision);
      setShowReasoningDialog(true);
    }
  };

  const handleApprove = (requestId: string, feedback?: string) => {
    setHumanReviewRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved', humanDecision: feedback || 'Approved', reviewedAt: new Date().toISOString() }
          : req
      )
    );
  };

  const handleReject = (requestId: string, reason: string) => {
    setHumanReviewRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected', humanDecision: reason, reviewedAt: new Date().toISOString() }
          : req
      )
    );
  };

  const handleEscalate = (requestId: string, reason: string) => {
    setHumanReviewRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'escalated', humanDecision: reason, reviewedAt: new Date().toISOString() }
          : req
      )
    );
  };

  const overallCARESScore = Object.values(caresMetrics).reduce((sum, score) => sum + score, 0) / Object.keys(caresMetrics).length;

  return (
    <div className="space-y-6">
      {/* CARES Framework Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            CARES Framework Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive view of your AI automation's trustworthiness and effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {overallCARESScore.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall CARES Score</div>
              <Progress value={overallCARESScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {caresMetrics.explainabilityScore.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Explainability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {caresMetrics.humanCollaborationScore.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Human Collaboration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {caresMetrics.dataHealthScore.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Data Health</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Resilience</span>
              </div>
              <Badge variant="secondary">{caresMetrics.resilienceScore.toFixed(1)}%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Exception Handling</span>
              </div>
              <Badge variant="secondary">{caresMetrics.exceptionHandlingScore.toFixed(1)}%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Adoption</span>
              </div>
              <Badge variant="secondary">{caresMetrics.adoptionScore.toFixed(1)}%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-sm">ROI</span>
              </div>
              <Badge variant="secondary">{caresMetrics.roiScore.toFixed(1)}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Notifications */}
      {humanReviewRequests.filter(r => r.status === 'pending').length > 0 && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">
              {humanReviewRequests.filter(r => r.status === 'pending').length} items need human review
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={() => setActiveTab('collaboration')}
            >
              Review Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main CARES Components */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="explainability" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Explainability
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Human-AI Collaboration
          </TabsTrigger>
          <TabsTrigger value="data-health" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Health
          </TabsTrigger>
          <TabsTrigger value="roi" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            ROI Transparency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explainability">
          <ExplainabilityLayer
            decisions={aiDecisions}
            config={explainabilityConfig}
            onRequestHumanReview={handleRequestHumanReview}
            onShowReasoning={handleShowReasoning}
            onConfigChange={setExplainabilityConfig}
          />
        </TabsContent>

        <TabsContent value="collaboration">
          <HumanAICollaboration
            reviewRequests={humanReviewRequests}
            triggers={escalationTriggers}
            metrics={collaborationMetrics}
            onApprove={handleApprove}
            onReject={handleReject}
            onEscalate={handleEscalate}
            onUpdateTrigger={(trigger) => {
              setEscalationTriggers(prev => 
                prev.map(t => t.id === trigger.id ? trigger : t)
              );
            }}
            onRequestManualReview={onRequestHumanReview}
            currentUserId={userId}
          />
        </TabsContent>

        <TabsContent value="data-health">
          <SelfHealingData
            issues={dataQualityIssues}
            validationRules={[]}
            metrics={dataHealthMetrics}
            crossSystemLookups={[]}
            onAutoFix={onAutoFixIssue}
            onIgnoreIssue={(issueId) => {
              setDataQualityIssues(prev => 
                prev.map(issue => 
                  issue.id === issueId ? { ...issue, status: 'ignored' } : issue
                )
              );
            }}
            onUpdateRule={() => {}}
            onRunValidation={() => {}}
            onCreateLookup={() => {}}
            onUpdateLookup={() => {}}
          />
        </TabsContent>

        <TabsContent value="roi">
          <ROITransparencyDashboard
            metrics={roiMetrics}
            workflowPerformance={workflowPerformance}
            complianceMetrics={{
              auditTrails: 1250,
              complianceScore: 96.2,
              violations: 2,
              certifications: ['SOC2', 'ISO27001', 'GDPR', 'HIPAA'],
              lastAudit: new Date().toISOString()
            }}
            onGenerateReport={() => {}}
            onExportData={() => {}}
            onScheduleReport={() => {}}
          />
        </TabsContent>
      </Tabs>

      {/* Reasoning Dialog */}
      {showReasoningDialog && selectedDecision && (
        <Dialog open={showReasoningDialog} onOpenChange={setShowReasoningDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Decision Reasoning
              </DialogTitle>
              <DialogDescription>
                Detailed explanation for: {selectedDecision.action}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Decision</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedDecision.action}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Reasoning</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedDecision.reasoning}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Confidence & Risk</h4>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    {selectedDecision.confidence}% confident
                  </Badge>
                  <Badge variant={selectedDecision.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                    {selectedDecision.riskLevel} risk
                  </Badge>
                </div>
              </div>
              
              {selectedDecision.alternatives && (
                <div>
                  <h4 className="font-medium mb-2">Alternatives Considered</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedDecision.alternatives.map((alt, idx) => (
                      <li key={idx}>• {alt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default CARESFrameworkIntegration;