'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  Rewind,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown,
  Timer,
  Camera,
  RotateCcw,
  Sparkles,
  Database,
  Activity,
  TrendingUp,
  DollarSign,
  Bitcoin
} from 'lucide-react';
import type { TemporalSnapshot, TemporalRollback, RealityIntervention } from '@/types/trinity';

interface TemporalThroneProps {
  className?: string;
}

export function TemporalThroneInterface({ className }: TemporalThroneProps) {
  const [activeTab, setActiveTab] = useState('snapshots');
  const [snapshots, setSnapshots] = useState<TemporalSnapshot[]>([]);
  const [rollbacks, setRollbacks] = useState<TemporalRollback[]>([]);
  const [interventions, setInterventions] = useState<RealityIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');

  // Form states
  const [rollbackForm, setRollbackForm] = useState({
    snapshotId: '',
    reason: '',
    errorData: ''
  });

  const [interventionForm, setInterventionForm] = useState({
    interventionType: 'error_prevention' as const,
    workflowId: '',
    cost: '',
    probability: '',
    data: ''
  });

  useEffect(() => {
    fetchTemporalData();
  }, [activeTab, selectedWorkflow]);

  const fetchTemporalData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('action', activeTab);
      if (selectedWorkflow) {
        params.append('workflow_id', selectedWorkflow);
      }

      const response = await fetch(`/api/trinity/temporal-throne?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        switch (activeTab) {
          case 'snapshots':
            setSnapshots(data.snapshots || []);
            break;
          case 'rollbacks':
            setRollbacks(data.rollbacks || []);
            break;
          case 'interventions':
            setInterventions(data.interventions || []);
            break;
        }
      }
    } catch (error) {
      console.error('[TEMPORAL THRONE] Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSnapshot = async () => {
    if (!selectedWorkflow) {
      alert('Please select a workflow first');
      return;
    }

    try {
      const snapshotName = `Manual_${new Date().toISOString().split('T')[0]}_${Date.now()}`;
      
      const response = await fetch('/api/trinity/temporal-throne', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_snapshot',
          workflow_id: selectedWorkflow,
          snapshot_name: snapshotName,
          snapshot_data: { created_via: 'temporal_throne_interface' },
          execution_metrics: { snapshot_trigger: 'manual' }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`⚡ ${data.divine_message}\n\nQuantum Signature: ${data.quantum_entanglement.signature}`);
        fetchTemporalData();
      } else {
        alert(`❌ Snapshot creation failed: ${data.error}`);
      }
    } catch (error) {
      console.error('[TEMPORAL THRONE] Snapshot creation failed:', error);
    }
  };

  const initiateRollback = async () => {
    if (!rollbackForm.snapshotId || !rollbackForm.reason) {
      alert('Please select a snapshot and provide a rollback reason');
      return;
    }

    try {
      const response = await fetch('/api/trinity/temporal-throne', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rollback',
          workflow_id: selectedWorkflow,
          snapshot_id: rollbackForm.snapshotId,
          rollback_reason: rollbackForm.reason,
          error_data: rollbackForm.errorData ? JSON.parse(rollbackForm.errorData) : undefined
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`${data.divine_message}\n\nCost: $${data.cost_breakdown.total_cost.toLocaleString()}\nCausality Score: ${(data.temporal_restoration.causality_preserved ? '✅' : '⚠️')} ${data.rollback.quantum_causality_score}`);
        setRollbackForm({ snapshotId: '', reason: '', errorData: '' });
        fetchTemporalData();
      } else {
        alert(`❌ Rollback failed: ${data.error}`);
      }
    } catch (error) {
      console.error('[TEMPORAL THRONE] Rollback failed:', error);
    }
  };

  const requestRealityIntervention = async () => {
    if (!interventionForm.interventionType || !interventionForm.cost || !interventionForm.probability) {
      alert('Please fill in all required fields for reality intervention');
      return;
    }

    try {
      const response = await fetch('/api/trinity/temporal-throne', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reality_intervention',
          intervention_type: interventionForm.interventionType,
          target_workflow_id: interventionForm.workflowId || undefined,
          cost_usd: parseFloat(interventionForm.cost),
          success_probability: parseFloat(interventionForm.probability) / 100,
          intervention_data: interventionForm.data ? JSON.parse(interventionForm.data) : {}
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`🌟 ${data.divine_message}\n\nQuantum Receipt: ${data.quantum_receipt}\nApproval Timeline: ${data.approval_timeline || 'Immediate'}`);
        setInterventionForm({
          interventionType: 'error_prevention',
          workflowId: '',
          cost: '',
          probability: '',
          data: ''
        });
        fetchTemporalData();
      } else {
        alert(`❌ Reality intervention failed: ${data.error}`);
      }
    } catch (error) {
      console.error('[TEMPORAL THRONE] Reality intervention failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'executing': return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Temporal Throne Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Temporal Throne
            </h1>
            <p className="text-muted-foreground">Command Over Time and Causality</p>
          </div>
        </div>
        
        <Badge variant="secondary" className="mb-4 px-4 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          Temporal State: CAUSALITY_COHERENT
        </Badge>
      </div>

      {/* Workflow Selector */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Enter Workflow ID for temporal operations..."
                value={selectedWorkflow}
                onChange={(e) => setSelectedWorkflow(e.target.value)}
              />
            </div>
            <Button 
              onClick={createSnapshot}
              disabled={!selectedWorkflow}
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
            >
              <Camera className="h-4 w-4 mr-2" />
              Create Quantum Snapshot
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Temporal Interface Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="snapshots" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Temporal Anchors
          </TabsTrigger>
          <TabsTrigger value="rollbacks" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Quantum Rollbacks
          </TabsTrigger>
          <TabsTrigger value="interventions" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Reality Interventions
          </TabsTrigger>
        </TabsList>

        {/* Temporal Snapshots Tab */}
        <TabsContent value="snapshots" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : snapshots.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Temporal Anchors</h3>
                <p className="text-muted-foreground">
                  Create your first quantum snapshot to begin temporal manipulation.
                </p>
              </div>
            ) : (
              snapshots.map((snapshot) => (
                <Card 
                  key={snapshot.id}
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant={snapshot.auto_created ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {snapshot.auto_created ? 'Auto' : 'Manual'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Restored: {snapshot.restored_count}x
                      </span>
                    </div>
                    
                    <CardTitle className="text-sm font-semibold">
                      {snapshot.snapshot_name}
                    </CardTitle>
                    
                    <CardDescription className="text-xs">
                      Quantum Signature: {snapshot.quantum_signature.slice(0, 16)}...
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(snapshot.created_at).toLocaleString()}
                    </div>

                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setRollbackForm({ 
                        ...rollbackForm, 
                        snapshotId: snapshot.id 
                      })}
                    >
                      <Rewind className="h-3 w-3 mr-2" />
                      Select for Rollback
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Quantum Rollbacks Tab */}
        <TabsContent value="rollbacks" className="space-y-4">
          {/* Rollback Control Panel */}
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-red-500" />
                Initiate Quantum Rollback
              </CardTitle>
              <CardDescription>
                ⚠️ Warning: Quantum rollbacks alter the flow of causality. Use with divine caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Snapshot ID</label>
                  <Input
                    placeholder="Select from snapshots above"
                    value={rollbackForm.snapshotId}
                    onChange={(e) => setRollbackForm({ ...rollbackForm, snapshotId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Rollback Reason</label>
                  <Input
                    placeholder="Production error, data corruption, etc."
                    value={rollbackForm.reason}
                    onChange={(e) => setRollbackForm({ ...rollbackForm, reason: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Error Data (JSON)</label>
                <Textarea
                  placeholder='{"error": "description", "severity": "critical"}'
                  value={rollbackForm.errorData}
                  onChange={(e) => setRollbackForm({ ...rollbackForm, errorData: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              <Button 
                onClick={initiateRollback}
                disabled={!rollbackForm.snapshotId || !rollbackForm.reason}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500"
              >
                <Zap className="h-4 w-4 mr-2" />
                Execute Quantum Rollback ($500k/minute)
              </Button>
            </CardContent>
          </Card>

          {/* Rollback History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : rollbacks.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <RotateCcw className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Rollbacks Performed</h3>
                <p className="text-muted-foreground">
                  The timeline remains unaltered. Your causality is pristine.
                </p>
              </div>
            ) : (
              rollbacks.map((rollback) => (
                <Card 
                  key={rollback.id}
                  className={`hover:shadow-lg transition-all duration-300 ${
                    rollback.success ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      {getStatusIcon(rollback.success ? 'completed' : 'failed')}
                      <Badge variant={rollback.success ? 'default' : 'destructive'}>
                        {rollback.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-sm">
                      {rollback.rollback_reason}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Duration:</span>
                        <br />{rollback.rollback_duration_ms}ms
                      </div>
                      <div>
                        <span className="font-medium">Cost:</span>
                        <br />${rollback.cost_usd?.toLocaleString() || 'N/A'}
                      </div>
                    </div>

                    {rollback.quantum_causality_score && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Causality Score</span>
                          <span>{(rollback.quantum_causality_score * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={rollback.quantum_causality_score * 100} className="h-2" />
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      {new Date(rollback.initiated_at).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Reality Interventions Tab */}
        <TabsContent value="interventions" className="space-y-4">
          {/* Reality Intervention Control Panel */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Request Reality Intervention
              </CardTitle>
              <CardDescription>
                🌟 Deity-tier power to alter the fundamental laws of existence itself.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Intervention Type</label>
                  <select
                    value={interventionForm.interventionType}
                    onChange={(e) => setInterventionForm({ 
                      ...interventionForm, 
                      interventionType: e.target.value as any
                    })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="error_prevention">Error Prevention</option>
                    <option value="miracle_deployment">Miracle Deployment</option>
                    <option value="causality_correction">Causality Correction</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Target Workflow (Optional)</label>
                  <Input
                    placeholder="Workflow ID for targeted intervention"
                    value={interventionForm.workflowId}
                    onChange={(e) => setInterventionForm({ ...interventionForm, workflowId: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cost (USD)</label>
                  <Input
                    type="number"
                    placeholder="250000"
                    value={interventionForm.cost}
                    onChange={(e) => setInterventionForm({ ...interventionForm, cost: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Success Probability (%)</label>
                  <Input
                    type="number"
                    placeholder="95"
                    min="1"
                    max="100"
                    value={interventionForm.probability}
                    onChange={(e) => setInterventionForm({ ...interventionForm, probability: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Intervention Data (JSON)</label>
                <Textarea
                  placeholder='{"reality_alteration": "prevent_server_crash", "temporal_coordinates": "2024-12-31T23:59:59Z"}'
                  value={interventionForm.data}
                  onChange={(e) => setInterventionForm({ ...interventionForm, data: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              <Button 
                onClick={requestRealityIntervention}
                disabled={!interventionForm.interventionType || !interventionForm.cost || !interventionForm.probability}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Crown className="h-4 w-4 mr-2" />
                Submit to Divine Council
              </Button>
            </CardContent>
          </Card>

          {/* Reality Interventions History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : interventions.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Reality Interventions</h3>
                <p className="text-muted-foreground">
                  Reality remains unaltered. The gods have not yet been summoned.
                </p>
              </div>
            ) : (
              interventions.map((intervention) => (
                <Card 
                  key={intervention.id}
                  className="hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      {getStatusIcon(intervention.status)}
                      <Badge 
                        variant={intervention.divine_approval_required ? 'secondary' : 'default'}
                        className="capitalize text-xs"
                      >
                        {intervention.status}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-sm capitalize">
                      {intervention.intervention_type.replace('_', ' ')}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${intervention.cost_usd.toLocaleString()}
                      </div>
                      {intervention.cost_btc && (
                        <div className="flex items-center gap-1">
                          <Bitcoin className="h-3 w-3" />
                          {intervention.cost_btc} BTC
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Success Probability</span>
                        <span>{(intervention.success_probability * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={intervention.success_probability * 100} className="h-2" />
                    </div>

                    {intervention.divine_approval_required && (
                      <Badge variant="outline" className="text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Divine Approval Required
                      </Badge>
                    )}

                    <div className="text-xs text-muted-foreground">
                      {new Date(intervention.requested_at).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Temporal Analytics */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            Temporal Dominion Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {snapshots.length}
              </div>
              <div className="text-sm text-muted-foreground">Temporal Anchors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {rollbacks.filter(r => r.success).length}/{rollbacks.length}
              </div>
              <div className="text-sm text-muted-foreground">Successful Rollbacks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600">
                ${rollbacks.reduce((sum, r) => sum + (r.cost_usd || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Throne Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {interventions.filter(i => i.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Reality Alterations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Divine Footer */}
      <div className="text-center text-sm text-muted-foreground italic">
        "Time is a river, but we are its gods" - Temporal Codex 7:23
      </div>
    </div>
  );
}