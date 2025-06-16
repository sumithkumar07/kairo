
'use client';

import type { LogEntry } from '@/types/workflow'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, RotateCcw, Settings2, Terminal } from 'lucide-react'; 
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
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card className="shadow-none border-0 rounded-none flex-grow flex flex-col bg-transparent">
      <CardHeader className="px-4 pt-4 pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Execution & Logs</CardTitle>
            <CardDescription className="text-xs">Run your workflow and see its output.</CardDescription>
          </div>
          <div className="flex items-center space-x-2" title={isSimulationMode ? "Running in Simulation Mode" : "Running in Live Mode"}>
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <Label htmlFor="simulation-mode-switch" className="text-xs text-muted-foreground cursor-pointer select-none">
              Simulate
            </Label>
            <Switch
              id="simulation-mode-switch"
              checked={isSimulationMode}
              onCheckedChange={onToggleSimulationMode}
              aria-label="Toggle simulation mode"
              className="h-5 w-9 [&>span]:h-4 [&>span]:w-4 [&>span[data-state=checked]]:translate-x-4 [&>span[data-state=unchecked]]:translate-x-0.5"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-2.5 flex-grow flex flex-col">
        <Button onClick={onRunWorkflow} disabled={isWorkflowRunning} className="w-full h-9 text-sm">
          {isWorkflowRunning ? (
            <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isWorkflowRunning ? 'Executing...' : `Run Workflow ${isSimulationMode ? '(Simulated)' : '(Live)'}`}
        </Button>
        <Separator className="my-2" />
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5" /> Logs:
        </Label>
        <ScrollArea className="flex-1 h-36 border rounded-md bg-muted/20 p-2" viewportRef={scrollAreaViewportRef}> 
          {/* Removed direct child div with its own padding, ScrollArea now handles padding with p-2 */}
            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic break-words">No logs yet. Run the workflow to see output.</p>
            ) : (
              <div className="space-y-1 font-mono">
                {logs.map((log, index) => (
                  <div key={index} className="text-xs p-1 rounded bg-background/60 break-words leading-relaxed">
                    <span className="text-muted-foreground/70 mr-1.5">[{log.timestamp}]</span>
                    <span
                      className={
                        log.type === 'error' ? 'text-destructive/90' : 
                        log.type === 'success' ? 'text-green-600 dark:text-green-500' : 
                        'text-foreground/90'
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
