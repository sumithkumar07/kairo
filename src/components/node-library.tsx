'use client';

import type { AvailableNodeType } from '@/types/workflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NodeLibraryProps {
  availableNodes: AvailableNodeType[];
}

export function NodeLibrary({ availableNodes }: NodeLibraryProps) {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: AvailableNodeType) => {
    event.dataTransfer.setData('application/json', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="w-64 border-r h-full flex flex-col rounded-none shadow-md">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg font-semibold">Nodes</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="p-2 space-y-2">
          {availableNodes.map((nodeType) => (
            <div
              key={nodeType.type}
              draggable
              onDragStart={(e) => handleDragStart(e, nodeType)}
              className="p-3 border rounded-md hover:shadow-lg cursor-grab bg-card hover:bg-accent/10 transition-shadow flex items-center gap-3"
              title={nodeType.description || nodeType.name}
            >
              <nodeType.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{nodeType.name}</span>
            </div>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
