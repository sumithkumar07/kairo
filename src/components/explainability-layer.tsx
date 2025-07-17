'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Target, 
  TrendingUp,
  Users,
  Shield,
  Eye,
  Lightbulb,
  AlertCircle,
  Info,
  ChevronRight,
  Gauge,
  BarChart3,
  MessageSquare,
  Settings,
  Zap
} from 'lucide-react';

export interface AIDecision {
  id: string;
  nodeId: string;
  nodeName: string;
  action: string;
  confidence: number;
  reasoning: string;
  timestamp: string;
  outcome: 'success' | 'error' | 'pending';
  riskLevel: 'low' | 'medium' | 'high';
  alternatives?: string[];
  dataUsed?: string[];
  humanReviewRequired?: boolean;
}

export interface ExplainabilityConfig {
  showConfidenceIndicators: boolean;
  showReasoningButtons: boolean;
  showDecisionLogs: boolean;
  showRiskAssessment: boolean;
  requireHumanReview: boolean;
  confidenceThreshold: number;
}

interface ExplainabilityLayerProps {
  decisions: AIDecision[];
  config: ExplainabilityConfig;
  onRequestHumanReview: (decisionId: string) => void;
  onShowReasoning: (decisionId: string) => void;
  onConfigChange: (config: ExplainabilityConfig) => void;
}

export function ExplainabilityLayer({
  decisions,
  config,
  onRequestHumanReview,
  onShowReasoning,
  onConfigChange
}: ExplainabilityLayerProps) {
  const [selectedDecision, setSelectedDecision] = useState<AIDecision | null>(null);
  const [expandedDecisions, setExpandedDecisions] = useState<Set<string>>(new Set());

  const averageConfidence = decisions.length > 0 
    ? decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length 
    : 0;

  const riskDistribution = decisions.reduce((acc, d) => {
    acc[d.riskLevel] = (acc[d.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lowConfidenceDecisions = decisions.filter(d => d.confidence < config.confidenceThreshold);
  const humanReviewRequired = decisions.filter(d => d.humanReviewRequired);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 90) return 'default';
    if (confidence >= 70) return 'secondary';
    return 'destructive';
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <HelpCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const toggleDecisionExpansion = (decisionId: string) => {
    const newExpanded = new Set(expandedDecisions);
    if (newExpanded.has(decisionId)) {
      newExpanded.delete(decisionId);
    } else {
      newExpanded.add(decisionId);
    }
    setExpandedDecisions(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Overview Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Decision Transparency
          </CardTitle>
          <CardDescription>
            Real-time insights into AI decision-making processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Confidence</span>
                <Badge variant={getConfidenceBadgeVariant(averageConfidence)}>
                  {averageConfidence.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={averageConfidence} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Decisions</span>
                <Badge variant="outline">{decisions.length}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {decisions.filter(d => d.outcome === 'success').length} successful
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Human Review</span>
                <Badge variant={humanReviewRequired.length > 0 ? "destructive" : "secondary"}>
                  {humanReviewRequired.length}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {lowConfidenceDecisions.length} low confidence
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Level</span>
                <div className="flex items-center gap-1">
                  {getRiskIcon(decisions.length > 0 ? decisions[decisions.length - 1].riskLevel : 'low')}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {riskDistribution.high || 0} high risk
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts for Human Review */}
      {humanReviewRequired.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">{humanReviewRequired.length} decisions require human review</span>
            <br />
            {humanReviewRequired.map(d => (
              <Button
                key={d.id}
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => onRequestHumanReview(d.id)}
              >
                {d.nodeName}: {d.action}
              </Button>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Decision Log */}
      <Card>
        <CardHeader>
          <CardTitle>AI Decision Log</CardTitle>
          <CardDescription>
            Detailed view of all AI-driven actions and their reasoning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {decisions.map((decision) => (
                <div
                  key={decision.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getRiskIcon(decision.riskLevel)}
                        <span className="font-medium">{decision.nodeName}</span>
                      </div>
                      <Badge variant="outline">{decision.action}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant={getConfidenceBadgeVariant(decision.confidence)}>
                              {decision.confidence}%
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Confidence Level: {decision.confidence}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-xs text-muted-foreground">
                        {new Date(decision.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {decision.reasoning}
                  </div>

                  {expandedDecisions.has(decision.id) && (
                    <div className="space-y-3 pt-3 border-t">
                      {decision.alternatives && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Alternative Actions Considered:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {decision.alternatives.map((alt, idx) => (
                              <li key={idx}>• {alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {decision.dataUsed && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Data Sources Used:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {decision.dataUsed.map((data, idx) => (
                              <li key={idx}>• {data}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDecisionExpansion(decision.id)}
                      >
                        <ChevronRight 
                          className={`h-4 w-4 transition-transform ${
                            expandedDecisions.has(decision.id) ? 'rotate-90' : ''
                          }`} 
                        />
                        {expandedDecisions.has(decision.id) ? 'Less' : 'More'} Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onShowReasoning(decision.id)}
                      >
                        <Lightbulb className="h-4 w-4 mr-1" />
                        Show Reasoning
                      </Button>
                    </div>
                    
                    {(decision.confidence < config.confidenceThreshold || decision.humanReviewRequired) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRequestHumanReview(decision.id)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Request Review
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Explainability Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Confidence Threshold</label>
                <p className="text-xs text-muted-foreground">
                  Decisions below this threshold require human review
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.confidenceThreshold}
                  onChange={(e) => onConfigChange({
                    ...config,
                    confidenceThreshold: parseInt(e.target.value)
                  })}
                  className="w-24"
                />
                <span className="text-sm font-mono">{config.confidenceThreshold}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.showConfidenceIndicators}
                  onChange={(e) => onConfigChange({
                    ...config,
                    showConfidenceIndicators: e.target.checked
                  })}
                />
                <label className="text-sm">Show confidence indicators</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.showReasoningButtons}
                  onChange={(e) => onConfigChange({
                    ...config,
                    showReasoningButtons: e.target.checked
                  })}
                />
                <label className="text-sm">Show reasoning buttons</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.showDecisionLogs}
                  onChange={(e) => onConfigChange({
                    ...config,
                    showDecisionLogs: e.target.checked
                  })}
                />
                <label className="text-sm">Show decision logs</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.requireHumanReview}
                  onChange={(e) => onConfigChange({
                    ...config,
                    requireHumanReview: e.target.checked
                  })}
                />
                <label className="text-sm">Require human review</label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExplainabilityLayer;