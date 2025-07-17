'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Grid, 
  Move, 
  Magnet, 
  Layers, 
  AlignCenter, 
  AlignLeft, 
  AlignRight, 
  AlignVerticalJustifyCenter, 
  AlignHorizontalJustifyCenter,
  Settings,
  Ruler,
  Target,
  Crosshair,
  ArrowsUpFromLine,
  ArrowsRightFromLine,
  ArrowsLeftFromLine,
  ArrowsDownFromLine,
  RotateCcw,
  Square,
  Circle,
  Triangle,
  Diamond,
  Plus,
  Minus,
  X
} from 'lucide-react';

interface SnapGridControlsProps {
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnapToGrid: () => void;
  snapToNodes: boolean;
  onToggleSnapToNodes: () => void;
  snapToGuides: boolean;
  onToggleSnapToGuides: () => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  alignmentThreshold: number;
  onAlignmentThresholdChange: (threshold: number) => void;
  onAlignNodes: (direction: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle') => void;
  onDistributeNodes: (direction: 'horizontal' | 'vertical') => void;
  onResetAlignment: () => void;
  selectedNodesCount: number;
  className?: string;
}

export function SnapGridControls({
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnapToGrid,
  snapToNodes,
  onToggleSnapToNodes,
  snapToGuides,
  onToggleSnapToGuides,
  gridSize,
  onGridSizeChange,
  alignmentThreshold,
  onAlignmentThresholdChange,
  onAlignNodes,
  onDistributeNodes,
  onResetAlignment,
  selectedNodesCount,
  className
}: SnapGridControlsProps) {
  
  const gridSizeOptions = [10, 15, 20, 25, 30, 40, 50];
  const alignmentThresholdOptions = [5, 10, 15, 20, 25, 30];

  return (
    <TooltipProvider>
      <Card className={cn("w-full max-w-sm", className)}>
        <CardContent className="p-4 space-y-4">
          {/* Grid Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Grid & Snap</h3>
              <Badge variant="outline" className="text-xs">
                {selectedNodesCount} selected
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showGrid ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleGrid}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle Grid (G)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={snapToGrid ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleSnapToGrid}
                  >
                    <Move className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Snap to Grid (S)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={snapToNodes ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleSnapToNodes}
                  >
                    <Magnet className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Snap to Nodes</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={snapToGuides ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleSnapToGuides}
                  >
                    <Ruler className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Snap to Guides</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Grid Size */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Grid Size</label>
            <div className="flex items-center gap-1 flex-wrap">
              {gridSizeOptions.map((size) => (
                <Button
                  key={size}
                  variant={gridSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => onGridSizeChange(size)}
                  className="text-xs px-2 py-1 h-auto"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Alignment Threshold */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Snap Threshold</label>
            <div className="flex items-center gap-1 flex-wrap">
              {alignmentThresholdOptions.map((threshold) => (
                <Button
                  key={threshold}
                  variant={alignmentThreshold === threshold ? "default" : "outline"}
                  size="sm"
                  onClick={() => onAlignmentThresholdChange(threshold)}
                  className="text-xs px-2 py-1 h-auto"
                >
                  {threshold}px
                </Button>
              ))}
            </div>
          </div>

          {/* Alignment Controls */}
          {selectedNodesCount > 1 && (
            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-medium">Alignment</h4>
              
              <div className="grid grid-cols-3 gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAlignNodes('left')}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Align Left</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAlignNodes('center')}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Align Center</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAlignNodes('right')}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Align Right</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAlignNodes('top')}
                    >
                      <ArrowsUpFromLine className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Align Top</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAlignNodes('middle')}
                    >
                      <AlignVerticalJustifyCenter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Align Middle</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAlignNodes('bottom')}
                    >
                      <ArrowsDownFromLine className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Align Bottom</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDistributeNodes('horizontal')}
                      className="flex-1"
                    >
                      <AlignHorizontalJustifyCenter className="h-4 w-4 mr-1" />
                      Distribute H
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Distribute Horizontally</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDistributeNodes('vertical')}
                      className="flex-1"
                    >
                      <AlignVerticalJustifyCenter className="h-4 w-4 mr-1" />
                      Distribute V
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Distribute Vertically</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onResetAlignment}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Alignment
              </Button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-sm font-medium">Quick Actions</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Toggle Grid:</span>
                <span className="font-mono">G</span>
              </div>
              <div className="flex justify-between">
                <span>Snap to Grid:</span>
                <span className="font-mono">S</span>
              </div>
              <div className="flex justify-between">
                <span>Hold Shift:</span>
                <span>Disable snap</span>
              </div>
              <div className="flex justify-between">
                <span>Hold Ctrl:</span>
                <span>Multi-select</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}