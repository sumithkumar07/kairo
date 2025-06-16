
'use client';

import type { AvailableNodeType } from '@/types/workflow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils'; 
import { useMemo } from 'react';

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Re-using a similar styling function, could be centralized if shared with canvas nodes eventually
const getCategoryStyling = (category: AvailableNodeType['category']) => {
  switch (category) {
    case 'trigger':
      return {
        bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
        borderColor: 'border-blue-500/60',
        iconColor: 'text-blue-600 dark:text-blue-400',
        titleColor: 'text-blue-700 dark:text-blue-300',
      };
    case 'action':
      return {
        bgColor: 'bg-green-500/10 hover:bg-green-500/20',
        borderColor: 'border-green-500/60',
        iconColor: 'text-green-600 dark:text-green-400',
        titleColor: 'text-green-700 dark:text-green-300',
      };
    case 'io':
      return {
        bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
        borderColor: 'border-purple-500/60',
        iconColor: 'text-purple-600 dark:text-purple-400',
        titleColor: 'text-purple-700 dark:text-purple-300',
      };
    case 'logic':
      return {
        bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
        borderColor: 'border-orange-500/60',
        iconColor: 'text-orange-600 dark:text-orange-400',
        titleColor: 'text-orange-700 dark:text-orange-300',
      };
    case 'ai':
      return {
        bgColor: 'bg-sky-500/10 hover:bg-sky-500/20',
        borderColor: 'border-sky-500/60',
        iconColor: 'text-sky-600 dark:text-sky-400',
        titleColor: 'text-sky-700 dark:text-sky-300',
      };
    case 'group':
    case 'iteration':
    case 'control':
    case 'interaction':
        return {
          bgColor: 'bg-slate-500/10 hover:bg-slate-500/20',
          borderColor: 'border-slate-500/60',
          iconColor: 'text-slate-600 dark:text-slate-400',
          titleColor: 'text-slate-700 dark:text-slate-300',
        };
    default:
      return {
        bgColor: 'bg-gray-500/10 hover:bg-gray-500/20',
        borderColor: 'border-gray-400/60',
        iconColor: 'text-gray-600 dark:text-gray-400',
        titleColor: 'text-gray-700 dark:text-gray-300',
      };
  }
};


interface NodeLibraryProps {
  availableNodes: AvailableNodeType[];
}

export function NodeLibrary({ availableNodes }: NodeLibraryProps) {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: AvailableNodeType) => {
    event.dataTransfer.setData('application/json', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
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
            const categoryStyling = getCategoryStyling(categoryKey);
            return (
              <div key={categoryKey} className="space-y-2">
                <h3 className={cn(
                  "text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md",
                  categoryStyling.iconColor, // Using iconColor for category title as well
                  categoryStyling.bgColor.replace('hover:bg-', 'bg-'), // Use non-hover version for title bg
                  categoryStyling.borderColor,
                )}>
                  {capitalizeFirstLetter(categoryKey)}
                </h3>
                {nodesInCategory.map((nodeType) => {
                   const itemStyling = getCategoryStyling(nodeType.category);
                  return (
                    <div
                      key={nodeType.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, nodeType)}
                      className={cn(
                        "p-3 border rounded-lg cursor-grab transition-all duration-150 ease-in-out flex flex-col gap-1.5 shadow-sm",
                        itemStyling.borderColor,
                        itemStyling.bgColor,
                        "hover:shadow-md hover:ring-1 hover:ring-primary/50"
                      )}
                      title={nodeType.description || nodeType.name}
                    >
                      <div className="flex items-center gap-2">
                        <nodeType.icon className={cn("h-5 w-5 shrink-0", itemStyling.iconColor)} />
                        <span className={cn("text-sm font-medium", itemStyling.titleColor)}>{nodeType.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{nodeType.description}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
