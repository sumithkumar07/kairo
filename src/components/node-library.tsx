
'use client';

import type { AvailableNodeType } from '@/types/workflow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils'; 
import { useMemo } from 'react';

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

interface NodeLibraryProps {
  availableNodes: AvailableNodeType[];
}

export function NodeLibrary({ availableNodes }: NodeLibraryProps) {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: AvailableNodeType) => {
    event.dataTransfer.setData('application/json', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  const getCategoryStyling = (category: AvailableNodeType['category']) => {
    switch (category) {
      case 'trigger':
        return {
          textColor: 'text-blue-600 dark:text-blue-400',
          borderColor: 'border-blue-500/60',
          bgColor: 'bg-blue-500/5',
          hoverRingColor: 'hover:ring-blue-500/50',
        };
      case 'action':
        return {
          textColor: 'text-green-600 dark:text-green-400',
          borderColor: 'border-green-500/60',
          bgColor: 'bg-green-500/5',
          hoverRingColor: 'hover:ring-green-500/50',
        };
      case 'io':
        return {
          textColor: 'text-purple-600 dark:text-purple-400',
          borderColor: 'border-purple-500/60',
          bgColor: 'bg-purple-500/5',
          hoverRingColor: 'hover:ring-purple-500/50',
        };
      case 'logic':
        return {
          textColor: 'text-orange-600 dark:text-orange-400',
          borderColor: 'border-orange-500/60',
          bgColor: 'bg-orange-500/5',
          hoverRingColor: 'hover:ring-orange-500/50',
        };
      case 'ai':
        return {
          textColor: 'text-sky-600 dark:text-sky-400',
          borderColor: 'border-sky-500/60',
          bgColor: 'bg-sky-500/5',
          hoverRingColor: 'hover:ring-sky-500/50',
        };
      case 'group':
      case 'iteration':
      case 'control':
      case 'interaction':
          return {
            textColor: 'text-slate-600 dark:text-slate-400',
            borderColor: 'border-slate-500/60',
            bgColor: 'bg-slate-500/5',
            hoverRingColor: 'hover:ring-slate-500/50',
          };
      default:
        return {
          textColor: 'text-gray-600 dark:text-gray-400',
          borderColor: 'border-gray-400/60',
          bgColor: 'bg-gray-500/5',
          hoverRingColor: 'hover:ring-gray-500/50',
        };
    }
  };

  const groupedNodes = useMemo(() => {
    return availableNodes.reduce((acc, node) => {
      const category = node.category || 'unknown';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(node);
      return acc;
    }, {} as Record<string, AvailableNodeType[]>);
  }, [availableNodes]);

  const categoryOrder: AvailableNodeType['category'][] = ['trigger', 'action', 'io', 'logic', 'ai', 'group', 'iteration', 'control', 'interaction', 'unknown'];

  return (
    <aside className="w-72 border-r bg-card h-full flex flex-col shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">Node Library</h2>
        <p className="text-sm text-muted-foreground">Drag nodes to the canvas</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {categoryOrder.map(categoryKey => {
            const nodesInCategory = groupedNodes[categoryKey];
            if (!nodesInCategory || nodesInCategory.length === 0) {
              return null;
            }
            const styling = getCategoryStyling(categoryKey);
            return (
              <div key={categoryKey} className="space-y-2">
                <h3 className={cn(
                  "text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md",
                  styling.textColor,
                  styling.bgColor,
                  styling.borderColor,
                )}>
                  {capitalizeFirstLetter(categoryKey)}
                </h3>
                {nodesInCategory.map((nodeType) => (
                  <div
                    key={nodeType.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, nodeType)}
                    className={cn(
                      "p-3 border rounded-lg cursor-grab bg-background transition-all duration-150 ease-in-out flex flex-col gap-1.5 shadow-sm",
                      styling.borderColor,
                      styling.hoverRingColor,
                      "hover:shadow-lg hover:border-primary/60 hover:ring-1"
                    )}
                    title={nodeType.description || nodeType.name}
                  >
                    <div className="flex items-center gap-2">
                      <nodeType.icon className={cn("h-5 w-5 shrink-0", styling.textColor)} />
                      <span className="text-sm font-medium text-foreground">{nodeType.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{nodeType.description}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
