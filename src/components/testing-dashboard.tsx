'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Stop, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Activity,
  Shield,
  Accessibility,
  Database,
  Zap,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Settings,
  Download,
  Share
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  duration: number;
  error?: string;
  details?: any;
  timestamp: number;
}

interface TestSuite {
  name: string;
  description: string;
  tests: TestResult[];
  status: 'passed' | 'failed' | 'warning';
  duration: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
  };
}

export function TestingDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestSuite[]>([]);
  const [testHistory, setTestHistory] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);

  const fetchTestStatus = async () => {
    try {
      const response = await fetch('/api/testing?action=status');
      if (response.ok) {
        const data = await response.json();
        setIsRunning(data.isRunning);
        if (data.latestResults) {
          setTestResults(data.latestResults);
        }
        if (data.history) {
          setTestHistory(data.history);
        }
      }
    } catch (error) {
      console.error('Failed to fetch test status:', error);
    }
  };

  const runTests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run' })
      });

      if (response.ok) {
        setIsRunning(true);
        // Poll for results while tests are running
        const pollInterval = setInterval(async () => {
          await fetchTestStatus();
          const statusResponse = await fetch('/api/testing?action=status');
          const statusData = await statusResponse.json();
          
          if (!statusData.isRunning) {
            clearInterval(pollInterval);
            setIsRunning(false);
            await fetchTestStatus();
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to run tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestStatus();
    const interval = setInterval(fetchTestStatus, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'skipped': return <Minus className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'skipped': return 'text-gray-500';
      default: return 'text-blue-500';
    }
  };

  const getSuiteIcon = (suiteName: string) => {
    switch (suiteName.toLowerCase()) {
      case 'performance tests': return Activity;
      case 'database tests': return Database;
      case 'api tests': return Zap;
      case 'security tests': return Shield;
      case 'accessibility tests': return Accessibility;
      default: return FileText;
    }
  };

  const calculateOverallStats = () => {
    if (testResults.length === 0) return null;

    const overall = testResults.reduce(
      (acc, suite) => ({
        total: acc.total + suite.summary.total,
        passed: acc.passed + suite.summary.passed,
        failed: acc.failed + suite.summary.failed,
        warnings: acc.warnings + suite.summary.warnings,
        skipped: acc.skipped + suite.summary.skipped
      }),
      { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0 }
    );

    const successRate = overall.total > 0 ? Math.round((overall.passed / overall.total) * 100) : 0;
    const status = overall.failed > 0 ? 'failed' : overall.warnings > 0 ? 'warning' : 'passed';

    return { ...overall, successRate, status };
  };

  const overallStats = calculateOverallStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Testing Dashboard</h2>
          <p className="text-muted-foreground">Automated testing and quality assurance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={runTests}
            disabled={isRunning || loading}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Tests
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={fetchTestStatus}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      {overallStats && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(overallStats.status)}
                <div>
                  <CardTitle>Overall Test Results</CardTitle>
                  <CardDescription>
                    Success rate: {overallStats.successRate}% ({overallStats.passed}/{overallStats.total} tests passed)
                  </CardDescription>
                </div>
              </div>
              
              <Badge 
                variant={overallStats.status === 'passed' ? 'default' : 'destructive'}
                className="text-lg px-4 py-2"
              >
                {overallStats.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <Progress value={overallStats.successRate} className="h-3" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-lg font-bold text-green-600">{overallStats.passed}</div>
                  <div className="text-sm text-green-600">Passed</div>
                </div>
                
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <XCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                  <div className="text-lg font-bold text-red-600">{overallStats.failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
                
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                  <div className="text-lg font-bold text-yellow-600">{overallStats.warnings}</div>
                  <div className="text-sm text-yellow-600">Warnings</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                  <Minus className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                  <div className="text-lg font-bold text-gray-600">{overallStats.skipped}</div>
                  <div className="text-sm text-gray-600">Skipped</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="results" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-6">
          {testResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testResults.map((suite, index) => {
                const SuiteIcon = getSuiteIcon(suite.name);
                const successRate = suite.summary.total > 0 
                  ? Math.round((suite.summary.passed / suite.summary.total) * 100) 
                  : 0;

                return (
                  <Card 
                    key={index}
                    className={`cursor-pointer hover:shadow-lg transition-all ${
                      suite.status === 'failed' ? 'border-red-200' : 
                      suite.status === 'warning' ? 'border-yellow-200' : 
                      'border-green-200'
                    }`}
                    onClick={() => setSelectedSuite(suite)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            suite.status === 'failed' ? 'bg-red-100 dark:bg-red-950/20' :
                            suite.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-950/20' :
                            'bg-green-100 dark:bg-green-950/20'
                          }`}>
                            <SuiteIcon className={`h-5 w-5 ${getStatusColor(suite.status)}`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{suite.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {suite.summary.total} tests • {suite.duration}ms
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusIcon(suite.status)}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <Progress value={successRate} className="h-2" />
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{suite.summary.passed} passed</span>
                          </div>
                          {suite.summary.failed > 0 && (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-3 w-3 text-red-500" />
                              <span>{suite.summary.failed} failed</span>
                            </div>
                          )}
                          {suite.summary.warnings > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              <span>{suite.summary.warnings} warnings</span>
                            </div>
                          )}
                          {suite.summary.skipped > 0 && (
                            <div className="flex items-center gap-2">
                              <Minus className="h-3 w-3 text-gray-500" />
                              <span>{suite.summary.skipped} skipped</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Test Results</h3>
                <p className="text-muted-foreground mb-4">
                  Run the test suite to see results here
                </p>
                <Button onClick={runTests} disabled={isRunning || loading}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Tests
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {testHistory.length > 0 ? (
            <div className="space-y-4">
              {testHistory.map((suite, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(suite.status)}
                        <div>
                          <h4 className="font-semibold">{suite.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {suite.summary.passed}/{suite.summary.total} tests passed • {suite.duration}ms
                          </p>
                        </div>
                      </div>
                      <Badge variant={suite.status === 'passed' ? 'default' : 'destructive'}>
                        {suite.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Test History</h3>
                <p className="text-muted-foreground">
                  Test history will appear here after running tests
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {selectedSuite ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedSuite.name}</CardTitle>
                <CardDescription>{selectedSuite.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {selectedSuite.tests.map((test, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(test.status)}
                            <h5 className="font-semibold">{test.name}</h5>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {test.duration}ms
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {test.description}
                        </p>
                        
                        {test.error && (
                          <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded text-sm">
                            <strong>Error:</strong> {test.error}
                          </div>
                        )}
                        
                        {test.details && (
                          <div className="bg-muted/30 p-3 rounded text-sm mt-2">
                            <strong>Details:</strong>
                            <pre className="mt-1 text-xs">
                              {JSON.stringify(test.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Test Suite Selected</h3>
                <p className="text-muted-foreground">
                  Click on a test suite from the results tab to view detailed information
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}