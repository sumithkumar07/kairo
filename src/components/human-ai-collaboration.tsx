'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Bot,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Shield,
  Target,
  TrendingUp,
  Gauge,
  AlertCircle,
  Info,
  Settings,
  Bell,
  Eye,
  UserCheck,
  HandMetal,
  Zap,
  Brain,
  Activity
} from 'lucide-react';

export interface EscalationTrigger {
  id: string;
  type: 'sentiment' | 'confidence' | 'keyword' | 'manual' | 'error_rate' | 'custom';
  name: string;
  description: string;
  threshold: number | string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoEscalate: boolean;
}

export interface HumanReviewRequest {
  id: string;
  nodeId: string;
  nodeName: string;
  type: 'approval' | 'review' | 'decision' | 'error_resolution';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  aiDecision: string;
  aiReasoning: string;
  aiConfidence: number;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  humanDecision?: string;
  humanReasoning?: string;
  escalationTrigger?: string;
  data?: any;
  estimatedTimeToReview?: number;
}

export interface CollaborationMetrics {
  totalRequests: number;
  approvalRate: number;
  averageResponseTime: number;
  escalationRate: number;
  aiAccuracy: number;
  humanOverride: number;
  satisfactionScore: number;
}

interface HumanAICollaborationProps {
  reviewRequests: HumanReviewRequest[];
  triggers: EscalationTrigger[];
  metrics: CollaborationMetrics;
  onApprove: (requestId: string, feedback?: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onEscalate: (requestId: string, reason: string) => void;
  onUpdateTrigger: (trigger: EscalationTrigger) => void;
  onRequestManualReview: (nodeId: string, reason: string) => void;
  currentUserId?: string;
  userRole?: 'operator' | 'manager' | 'admin';
}

export function HumanAICollaboration({
  reviewRequests,
  triggers,
  metrics,
  onApprove,
  onReject,
  onEscalate,
  onUpdateTrigger,
  onRequestManualReview,
  currentUserId,
  userRole = 'operator'
}: HumanAICollaborationProps) {
  const [selectedRequest, setSelectedRequest] = useState<HumanReviewRequest | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [manualReviewReason, setManualReviewReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const pendingRequests = reviewRequests.filter(r => r.status === 'pending');
  const urgentRequests = reviewRequests.filter(r => r.priority === 'urgent' && r.status === 'pending');
  const overdueRequests = reviewRequests.filter(r => {
    if (r.status !== 'pending' || !r.estimatedTimeToReview) return false;
    const elapsed = Date.now() - new Date(r.requestedAt).getTime();
    return elapsed > r.estimatedTimeToReview * 1000;
  });

  const filteredRequests = reviewRequests.filter(request => {
    if (filterStatus !== 'all' && request.status !== filterStatus) return false;
    if (filterPriority !== 'all' && request.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'escalated': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleApprove = (requestId: string) => {
    onApprove(requestId, feedbackText);
    setFeedbackText('');
    setSelectedRequest(null);
  };

  const handleReject = (requestId: string) => {
    if (!feedbackText.trim()) return;
    onReject(requestId, feedbackText);
    setFeedbackText('');
    setSelectedRequest(null);
  };

  const handleEscalate = (requestId: string) => {
    if (!feedbackText.trim()) return;
    onEscalate(requestId, feedbackText);
    setFeedbackText('');
    setSelectedRequest(null);
  };

  const handleManualReview = (nodeId: string) => {
    if (!manualReviewReason.trim()) return;
    onRequestManualReview(nodeId, manualReviewReason);
    setManualReviewReason('');
  };

  return (
    <div className="space-y-6">
      {/* Alert Bar */}
      {(urgentRequests.length > 0 || overdueRequests.length > 0) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Action Required:</span>
                {urgentRequests.length > 0 && (
                  <span className="ml-2">{urgentRequests.length} urgent requests</span>
                )}
                {overdueRequests.length > 0 && (
                  <span className="ml-2">{overdueRequests.length} overdue requests</span>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setFilterStatus('pending')}>
                Review Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold">{metrics.approvalRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{Math.round(metrics.averageResponseTime / 60)}m</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Accuracy</p>
                <p className="text-2xl font-bold">{metrics.aiAccuracy.toFixed(1)}%</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews">Review Requests</TabsTrigger>
          <TabsTrigger value="triggers">Escalation Triggers</TabsTrigger>
          <TabsTrigger value="manual">Manual Review</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter">Status:</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="priority-filter">Priority:</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Review Requests */}
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className="font-medium">{request.nodeName}</span>
                        </div>
                        <Badge variant="outline" className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge variant="secondary">
                          {request.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {request.aiConfidence}% confident
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(request.requestedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">AI Decision:</h4>
                      <p className="text-sm text-muted-foreground">{request.aiDecision}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">AI Reasoning:</h4>
                      <p className="text-sm text-muted-foreground">{request.aiReasoning}</p>
                    </div>

                    {request.escalationTrigger && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Escalation Trigger:</h4>
                        <p className="text-sm text-orange-600">{request.escalationTrigger}</p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(request.id)}
                          className="flex items-center gap-1"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        {userRole === 'admin' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Escalate
                          </Button>
                        )}
                      </div>
                    )}

                    {request.humanDecision && (
                      <div className="pt-2 border-t">
                        <h4 className="text-sm font-medium mb-1">Human Decision:</h4>
                        <p className="text-sm text-muted-foreground">{request.humanDecision}</p>
                        {request.reviewedBy && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reviewed by {request.reviewedBy} on {new Date(request.reviewedAt!).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Escalation Triggers</CardTitle>
              <CardDescription>
                Configure when workflows should automatically request human review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {triggers.map((trigger) => (
                  <div key={trigger.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={trigger.enabled}
                        onChange={(e) => onUpdateTrigger({
                          ...trigger,
                          enabled: e.target.checked
                        })}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{trigger.name}</span>
                          <Badge variant={trigger.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {trigger.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{trigger.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={trigger.threshold}
                        onChange={(e) => onUpdateTrigger({
                          ...trigger,
                          threshold: e.target.value
                        })}
                        className="w-20"
                      />
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Manual Review</CardTitle>
              <CardDescription>
                Manually request human review for specific workflow nodes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="node-select">Select Node</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a node to review" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="node1">Data Processing Node</SelectItem>
                      <SelectItem value="node2">AI Decision Node</SelectItem>
                      <SelectItem value="node3">Integration Node</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="review-reason">Reason for Review</Label>
                  <Textarea
                    id="review-reason"
                    placeholder="Explain why this node needs human review..."
                    value={manualReviewReason}
                    onChange={(e) => setManualReviewReason(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={() => handleManualReview('selected-node')}
                  disabled={!manualReviewReason.trim()}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Request Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Review Request</CardTitle>
              <CardDescription>
                {selectedRequest.nodeName} - {selectedRequest.type}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>AI Decision</Label>
                <p className="text-sm text-muted-foreground">{selectedRequest.aiDecision}</p>
              </div>
              
              <div>
                <Label>Your Feedback</Label>
                <Textarea
                  placeholder="Provide your reasoning..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Approve
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleReject(selectedRequest.id)}
                  disabled={!feedbackText.trim()}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                {userRole === 'admin' && (
                  <Button 
                    variant="outline"
                    onClick={() => handleEscalate(selectedRequest.id)}
                    disabled={!feedbackText.trim()}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Escalate
                  </Button>
                )}
                <Button 
                  variant="ghost"
                  onClick={() => {
                    setSelectedRequest(null);
                    setFeedbackText('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default HumanAICollaboration;