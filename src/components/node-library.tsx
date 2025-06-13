
'use client';

import type { AvailableNodeType } from '@/types/workflow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge'; // Import Badge

interface NodeLibraryProps {
  availableNodes: AvailableNodeType[];
}

export function NodeLibrary({ availableNodes }: NodeLibraryProps) {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: AvailableNodeType) => {
    event.dataTransfer.setData('application/json', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  const getCategoryBadgeVariant = (category: AvailableNodeType['category']) => {
    switch (category) {
      case 'trigger':
        return 'default'; // bg-primary
      case 'action':
        return 'secondary'; // bg-secondary
      case 'io':
        return 'outline'; // text-foreground, border
      case 'logic':
        return 'destructive'; // bg-destructive (example, can be changed)
      case 'ai':
        return 'default'; // another color or style if needed
      default:
        return 'outline';
    }
  };

  return (
    <aside className="w-72 border-r bg-card h-full flex flex-col shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">Node Library</h2>
        <p className="text-sm text-muted-foreground">Drag nodes to build your workflow</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {availableNodes.map((nodeType) => (
            <div
              key={nodeType.type}
              draggable
              onDragStart={(e) => handleDragStart(e, nodeType)}
              className="p-3 border rounded-lg hover:shadow-md cursor-grab bg-background hover:bg-muted/50 transition-all flex flex-col gap-1"
              title={nodeType.description || nodeType.name}
            >
              <div className="flex items-center gap-2">
                <nodeType.icon className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-semibold text-foreground">{nodeType.name}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">{nodeType.description}</p>
              <Badge 
                variant={getCategoryBadgeVariant(nodeType.category)} 
                className="mt-1 capitalize text-xs self-start"
              >
                {nodeType.category}
              </Badge>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
