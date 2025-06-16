
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, RotateCcw, Settings2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ExecutionLogPanelProps {
  onRunWorkflow: () => void;
  isWorkflowRunning?: boolean;
  isSimulationMode: boolean;
  onToggleSimulationMode: (isSimulating: boolean) => void;
}

export function ExecutionLogPanel({
  onRunWorkflow,
  isWorkflowRunning,
  isSimulationMode,
  onToggleSimulationMode,
}: ExecutionLogPanelProps) {
  return (
    <Card className="shadow-none border-0 rounded-none flex-grow flex flex-col bg-transparent">
      <CardHeader className="px-4 pt-4 pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Execution Controls</CardTitle>
            <CardDescription className="text-xs">Run your workflow and manage settings.</CardDescription>
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
      </CardContent>
    </Card>
  );
}
