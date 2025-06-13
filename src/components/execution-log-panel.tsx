
'use client';

import type { LogEntry } from '@/types/workflow'; // Import LogEntry
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, RotateCcw } from 'lucide-react'; 
import { Separator } from './ui/separator';

interface ExecutionLogPanelProps {
  logs: LogEntry[];
  onRunWorkflow: () => void;
  isWorkflowRunning?: boolean; 
}

export function ExecutionLogPanel({ logs, onRunWorkflow, isWorkflowRunning }: ExecutionLogPanelProps) {
  return (
    <Card className="shadow-lg flex-grow flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Execution & Logs</CardTitle>
        <CardDescription>Run your workflow and see its output.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow flex flex-col">
        <Button onClick={onRunWorkflow} disabled={isWorkflowRunning} className="w-full">
          {isWorkflowRunning ? (
            <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isWorkflowRunning ? 'Executing Workflow...' : 'Run Workflow'}
        </Button>
        <Separator />
        <p className="text-sm font-medium text-muted-foreground">Logs:</p>
        <ScrollArea className="flex-1 h-48 border rounded-md p-2 bg-muted/20"> 
          {logs.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No logs yet. Run the workflow to see output.</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-xs p-1 rounded bg-background/50 break-words">
                  <span className="font-mono text-muted-foreground mr-2">[{log.timestamp}]</span>
                  <span
                    className={
                      log.type === 'error' ? 'text-destructive' : 
                      log.type === 'success' ? 'text-green-600 dark:text-green-400' : 
                      'text-foreground'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

