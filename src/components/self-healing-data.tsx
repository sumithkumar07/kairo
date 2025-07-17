'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Database,
  Search,
  Filter,
  Wand2,
  AlertCircle,
  Info,
  Settings,
  Target,
  TrendingUp,
  Activity,
  GitMerge,
  Zap,
  Eye,
  Clock,
  BarChart3,
  FileText,
  Link,
  Trash2,
  Plus
} from 'lucide-react';

export interface DataQualityIssue {
  id: string;
  type: 'duplicate' | 'missing' | 'invalid' | 'format' | 'range' | 'consistency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  field: string;
  value: any;
  suggestion: string;
  autoFixAvailable: boolean;
  affectedRecords: number;
  detectedAt: string;
  status: 'detected' | 'fixing' | 'fixed' | 'ignored';
  confidence: number;
}

export interface DataValidationRule {
  id: string;
  name: string;
  type: 'required' | 'format' | 'range' | 'pattern' | 'unique' | 'reference';
  field: string;
  condition: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  autoFix: boolean;
  fixAction?: string;
}

export interface DataHealthMetrics {
  totalRecords: number;
  validRecords: number;
  duplicateRecords: number;
  missingFields: number;
  invalidFormats: number;
  overallHealth: number;
  healingRate: number;
  autoFixSuccessRate: number;
}

export interface CrossSystemLookup {
  id: string;
  name: string;
  sourceSystem: string;
  targetField: string;
  lookupField: string;
  matchConfidence: number;
  lastSync: string;
  status: 'active' | 'inactive' | 'error';
  recordsMatched: number;
}

interface SelfHealingDataProps {
  issues: DataQualityIssue[];
  validationRules: DataValidationRule[];
  metrics: DataHealthMetrics;
  crossSystemLookups: CrossSystemLookup[];
  onAutoFix: (issueId: string) => void;
  onIgnoreIssue: (issueId: string) => void;
  onUpdateRule: (rule: DataValidationRule) => void;
  onRunValidation: () => void;
  onCreateLookup: (lookup: Partial<CrossSystemLookup>) => void;
  onUpdateLookup: (lookup: CrossSystemLookup) => void;
}

export function SelfHealingData({
  issues,
  validationRules,
  metrics,
  crossSystemLookups,
  onAutoFix,
  onIgnoreIssue,
  onUpdateRule,
  onRunValidation,
  onCreateLookup,
  onUpdateLookup
}: SelfHealingDataProps) {
  const [selectedIssue, setSelectedIssue] = useState<DataQualityIssue | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [newRule, setNewRule] = useState<Partial<DataValidationRule>>({});
  const [isValidating, setIsValidating] = useState(false);

  const criticalIssues = issues.filter(i => i.severity === 'critical' && i.status === 'detected');
  const autoFixableIssues = issues.filter(i => i.autoFixAvailable && i.status === 'detected');
  const filteredIssues = issues.filter(issue => {
    if (filterType !== 'all' && issue.type !== filterType) return false;
    if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'duplicate': return <GitMerge className="h-4 w-4" />;
      case 'missing': return <AlertTriangle className="h-4 w-4" />;
      case 'invalid': return <AlertCircle className="h-4 w-4" />;
      case 'format': return <FileText className="h-4 w-4" />;
      case 'range': return <BarChart3 className="h-4 w-4" />;
      case 'consistency': return <Link className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'detected': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'fixing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'fixed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ignored': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleRunValidation = async () => {
    setIsValidating(true);
    await onRunValidation();
    setIsValidating(false);
  };

  const handleAutoFixAll = async () => {
    for (const issue of autoFixableIssues) {
      await onAutoFix(issue.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Critical Data Issues Found:</span>
                <span className="ml-2">{criticalIssues.length} issues requiring immediate attention</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAutoFixAll}
                disabled={autoFixableIssues.length === 0}
              >
                <Wand2 className="h-4 w-4 mr-1" />
                Auto-Fix All ({autoFixableIssues.length})
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Health</p>
                <p className="text-2xl font-bold">{metrics.overallHealth.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Progress value={metrics.overallHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valid Records</p>
                <p className="text-2xl font-bold">{metrics.validRecords.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((metrics.validRecords / metrics.totalRecords) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Healing Rate</p>
                <p className="text-2xl font-bold">{metrics.healingRate.toFixed(1)}%</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Auto-fix success: {metrics.autoFixSuccessRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issues Detected</p>
                <p className="text-2xl font-bold">{issues.filter(i => i.status === 'detected').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {autoFixableIssues.length} auto-fixable
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issues" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="issues">Data Issues</TabsTrigger>
          <TabsTrigger value="rules">Validation Rules</TabsTrigger>
          <TabsTrigger value="lookups">Cross-System Lookups</TabsTrigger>
          <TabsTrigger value="healing">Healing Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Type:</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="duplicate">Duplicate</SelectItem>
                    <SelectItem value="missing">Missing</SelectItem>
                    <SelectItem value="invalid">Invalid</SelectItem>
                    <SelectItem value="format">Format</SelectItem>
                    <SelectItem value="range">Range</SelectItem>
                    <SelectItem value="consistency">Consistency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Label>Severity:</Label>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleRunValidation}
              disabled={isValidating}
              className="flex items-center gap-2"
            >
              {isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isValidating ? 'Validating...' : 'Run Validation'}
            </Button>
          </div>

          {/* Issues List */}
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <Card key={issue.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(issue.type)}
                          <span className="font-medium">{issue.field}</span>
                        </div>
                        <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                        <Badge variant="secondary">
                          {issue.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(issue.status)}
                        <Badge variant="outline">
                          {issue.confidence}% confident
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Issue:</h4>
                        <p className="text-sm text-muted-foreground">
                          {issue.type === 'duplicate' && `${issue.affectedRecords} duplicate records found`}
                          {issue.type === 'missing' && `Missing values in ${issue.affectedRecords} records`}
                          {issue.type === 'invalid' && `Invalid values: ${JSON.stringify(issue.value)}`}
                          {issue.type === 'format' && `Format issues in ${issue.affectedRecords} records`}
                          {issue.type === 'range' && `Values outside expected range`}
                          {issue.type === 'consistency' && `Consistency issues across ${issue.affectedRecords} records`}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Suggested Fix:</h4>
                        <p className="text-sm text-muted-foreground">{issue.suggestion}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Detected: {new Date(issue.detectedAt).toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Affects: {issue.affectedRecords} records
                        </span>
                      </div>
                      
                      {issue.status === 'detected' && (
                        <div className="flex items-center gap-2">
                          {issue.autoFixAvailable && (
                            <Button 
                              size="sm"
                              onClick={() => onAutoFix(issue.id)}
                              className="flex items-center gap-1"
                            >
                              <Wand2 className="h-4 w-4" />
                              Auto-Fix
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedIssue(issue)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button 
                            size="sm"
                            variant="ghost"
                            onClick={() => onIgnoreIssue(issue.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Ignore
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Validation Rules</CardTitle>
              <CardDescription>
                Configure automatic data validation and healing rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => onUpdateRule({
                          ...rule,
                          enabled: e.target.checked
                        })}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rule.name}</span>
                          <Badge variant={rule.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {rule.severity}
                          </Badge>
                          {rule.autoFix && (
                            <Badge variant="outline">Auto-fix</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rule.type} validation for {rule.field}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lookups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cross-System Lookups</CardTitle>
              <CardDescription>
                Automatic data enrichment from external systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crossSystemLookups.map((lookup) => (
                  <div key={lookup.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        lookup.status === 'active' ? 'bg-green-500' : 
                        lookup.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{lookup.name}</span>
                          <Badge variant="outline">
                            {lookup.matchConfidence}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {lookup.sourceSystem} → {lookup.targetField}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last sync: {new Date(lookup.lastSync).toLocaleString()} | 
                          {lookup.recordsMatched} records matched
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Sync
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Lookup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="healing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Healing Actions</CardTitle>
              <CardDescription>
                Configure automatic data healing behaviors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Auto-fix duplicates</span>
                      <p className="text-sm text-muted-foreground">
                        Automatically merge duplicate records
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Fill missing values</span>
                      <p className="text-sm text-muted-foreground">
                        Use ML to predict missing values
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Format standardization</span>
                      <p className="text-sm text-muted-foreground">
                        Convert to standard formats
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Real-time validation</span>
                      <p className="text-sm text-muted-foreground">
                        Validate data as it enters
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SelfHealingData;