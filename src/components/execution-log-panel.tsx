
'use client';

import type { LogEntry } from '@/types/workflow'; // Import LogEntry
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, RotateCcw, Settings2 } from 'lucide-react'; 
import { Separator } from './ui/separator';
import { useEffect, useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ExecutionLogPanelProps {
  logs: LogEntry[];
  onRunWorkflow: () => void;
  isWorkflowRunning?: boolean; 
  isSimulationMode: boolean;
  onToggleSimulationMode: (isSimulating: boolean) => void;
}

export function ExecutionLogPanel({ 
  logs, 
  onRunWorkflow, 
  isWorkflowRunning,
  isSimulationMode,
  onToggleSimulationMode,
}: ExecutionLogPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card className="shadow-lg flex-grow flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Execution & Logs</CardTitle>
            <CardDescription>Run your workflow and see its output.</CardDescription>
          </div>
          <div className="flex items-center space-x-2" title={isSimulationMode ? "Running in Simulation Mode" : "Running in Live Mode"}>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="simulation-mode-switch" className="text-xs text-muted-foreground cursor-pointer">
              Simulate
            </Label>
            <Switch
              id="simulation-mode-switch"
              checked={isSimulationMode}
              onCheckedChange={onToggleSimulationMode}
              aria-label="Toggle simulation mode"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow flex flex-col">
        <Button onClick={onRunWorkflow} disabled={isWorkflowRunning} className="w-full">
          {isWorkflowRunning ? (
            <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isWorkflowRunning ? 'Executing Workflow...' : `Run Workflow ${isSimulationMode ? '(Simulated)' : '(Live)'}`}
        </Button>
        <Separator />
        <p className="text-sm font-medium text-muted-foreground">Logs:</p>
        <ScrollArea className="flex-1 h-48 border rounded-md bg-muted/20"> 
          <div ref={scrollAreaRef} className="p-2 h-full overflow-y-auto"> {/* Added ref here and ensured it's scrollable */}
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
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
