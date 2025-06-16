
'use client';

import type { AvailableNodeType } from '@/types/workflow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge'; 
import { useMemo } from 'react';
import { cn } from '@/lib/utils'; // Import cn

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export function NodeLibrary({ availableNodes }: NodeLibraryProps) {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: AvailableNodeType) => {
    event.dataTransfer.setData('application/json', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  const getCategoryColorClasses = (category: AvailableNodeType['category']) => {
    switch (category) {
      case 'trigger':
        return 'border-blue-500/50 text-blue-700 dark:text-blue-400';
      case 'action':
        return 'border-green-500/50 text-green-700 dark:text-green-400';
      case 'io':
        return 'border-purple-500/50 text-purple-700 dark:text-purple-400';
      case 'logic':
        return 'border-orange-500/50 text-orange-700 dark:text-orange-400';
      case 'ai':
        return 'border-sky-500/50 text-sky-700 dark:text-sky-400';
      case 'group':
      case 'iteration':
      case 'control':
      case 'interaction':
          return 'border-slate-500/50 text-slate-700 dark:text-slate-400';
      default:
        return 'border-gray-400/50 text-gray-600 dark:text-gray-400';
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
        <p className="text-sm text-muted-foreground">Drag nodes to build your workflow</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {categoryOrder.map(categoryKey => {
            const nodesInCategory = groupedNodes[categoryKey];
            if (!nodesInCategory || nodesInCategory.length === 0) {
              return null;
            }
            const categoryColor = getCategoryColorClasses(categoryKey);
            return (
              <div key={categoryKey} className="space-y-2">
                <h3 className={cn(
                  "text-xs font-semibold uppercase tracking-wider px-1 pt-2",
                  categoryColor.split(' ')[1] // Use text color part for heading
                )}>
                  {capitalizeFirstLetter(categoryKey)}
                </h3>
                {nodesInCategory.map((nodeType) => (
                  <div
                    key={nodeType.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, nodeType)}
                    className={cn(
                      "p-3 border rounded-lg cursor-grab bg-background transition-all flex flex-col gap-1.5",
                      "hover:shadow-lg hover:border-primary/60 hover:ring-1 hover:ring-primary/60", // Enhanced hover
                       categoryColor.split(' ')[0] // Use border color part
                    )}
                    title={nodeType.description || nodeType.name}
                  >
                    <div className="flex items-center gap-2">
                      <nodeType.icon className={cn("h-5 w-5 shrink-0", categoryColor.split(' ')[1])} />
                      <span className="text-sm font-semibold text-foreground">{nodeType.name}</span>
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
