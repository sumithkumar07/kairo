
'use client';

import type { AvailableNodeType } from '@/types/workflow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useMemo, useState, memo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, ShieldCheck } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getCanvasNodeStyling } from '@/config/nodes';

interface NodeLibraryProps {
  availableNodes: AvailableNodeType[];
}

const NodeLibraryComponent = ({ availableNodes }: NodeLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const { isDiamondOrTrial, isLoggedIn } = useSubscription();

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 200); 

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: AvailableNodeType) => {
    if (nodeType.isAdvanced && !isDiamondOrTrial) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData('application/json', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim()) {
      return availableNodes;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return availableNodes.filter(node =>
      node.name.toLowerCase().includes(lowerSearchTerm) ||
      (node.description && node.description.toLowerCase().includes(lowerSearchTerm)) ||
      node.type.toLowerCase().includes(lowerSearchTerm) ||
      node.category.toLowerCase().includes(lowerSearchTerm)
    );
  }, [availableNodes, searchTerm]);

  return (
    <aside className="w-72 border-r bg-card h-full flex flex-col shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">Node Library</h2>
        <p className="text-sm text-muted-foreground">Drag nodes to the canvas</p>
      </div>
      <div className="p-3 border-b relative">
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search nodes..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full pl-8 h-9 text-sm"
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredNodes.length === 0 && searchTerm.trim() !== '' && (
            <p className="text-sm text-muted-foreground text-center py-4">No nodes found matching "{searchTerm}".</p>
          )}
          {filteredNodes.map((nodeType) => {
            const itemStyling = getCanvasNodeStyling(nodeType.category);
            const isLocked = nodeType.isAdvanced && !isDiamondOrTrial;
            const tooltipContent = isLocked 
              ? `This is a Diamond feature. ${isLoggedIn ? 'Upgrade your plan to use.' : 'Sign up or log in to start a trial.'}` 
              : nodeType.description || nodeType.name;

            return (
              <TooltipProvider key={nodeType.type} delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      draggable={!isLocked}
                      onDragStart={(e) => handleDragStart(e, nodeType)}
                      className={cn(
                        "p-3 border rounded-lg flex flex-col gap-1.5 shadow-sm relative transition-all duration-150 ease-in-out",
                        itemStyling.nodeBorder,
                        isLocked 
                          ? 'bg-muted/30 cursor-not-allowed opacity-60' 
                          : `${itemStyling.headerBg} cursor-grab hover:shadow-md hover:ring-1 hover:ring-primary/50 hover:scale-[1.03]`
                      )}
                      title={tooltipContent} 
                    >
                      <div className="flex items-center gap-2">
                        <nodeType.icon className={cn("h-5 w-5 shrink-0", isLocked ? 'text-muted-foreground' : itemStyling.headerIconColor)} />
                        <span className={cn("text-sm font-medium", isLocked ? 'text-muted-foreground' : itemStyling.headerTextColor)}>{nodeType.name}</span>
                        {isLocked && (
                           <ShieldCheck className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 absolute top-1.5 right-1.5" />
                        )}
                      </div>
                      <p className={cn("text-xs leading-snug line-clamp-2", isLocked ? 'text-muted-foreground/70' : 'text-muted-foreground')}>
                        {nodeType.description}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="start" className="max-w-xs">
                    <p className="text-xs font-medium">{nodeType.name} {isLocked && "(Diamond Feature)"}</p>
                    <p className="text-xs text-muted-foreground">{tooltipContent}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
};

export const NodeLibrary = memo(NodeLibraryComponent);
NodeLibrary.displayName = 'NodeLibrary';
