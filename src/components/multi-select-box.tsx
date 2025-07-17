'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Select, 
  SelectAll, 
  Square, 
  CheckSquare, 
  Copy, 
  Trash2, 
  Move, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Group, 
  Ungroup,
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  Layers,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  X,
  Plus,
  Minus,
  Settings,
  Filter,
  Search,
  Grid,
  Target,
  Zap,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Share,
  Edit,
  Info,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { WorkflowNode } from '@/types/workflow';

interface MultiSelectBoxProps {
  nodes: WorkflowNode[];
  selectedNodes: string[];
  onSelectionChange: (nodeIds: string[]) => void;
  onCopyNodes: (nodeIds: string[]) => void;
  onDeleteNodes: (nodeIds: string[]) => void;
  onDuplicateNodes: (nodeIds: string[]) => void;
  onGroupNodes: (nodeIds: string[]) => void;
  onUngroupNodes: (nodeIds: string[]) => void;
  onAlignNodes: (nodeIds: string[], direction: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle') => void;
  onDistributeNodes: (nodeIds: string[], direction: 'horizontal' | 'vertical') => void;
  onToggleNodeVisibility: (nodeId: string) => void;
  onToggleNodeLock: (nodeId: string) => void;
  onMoveToLayer: (nodeIds: string[], layer: number) => void;
  hiddenNodes: Set<string>;
  lockedNodes: Set<string>;
  groupedNodes: Map<string, string[]>;
  className?: string;
}

export function MultiSelectBox({
  nodes,
  selectedNodes,
  onSelectionChange,
  onCopyNodes,
  onDeleteNodes,
  onDuplicateNodes,
  onGroupNodes,
  onUngroupNodes,
  onAlignNodes,
  onDistributeNodes,
  onToggleNodeVisibility,
  onToggleNodeLock,
  onMoveToLayer,
  hiddenNodes,
  lockedNodes,
  groupedNodes,
  className
}: MultiSelectBoxProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'selected' | 'visible' | 'locked'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'position'>('name');

  // Filter and sort nodes
  const filteredNodes = React.useMemo(() => {
    let filtered = nodes;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(node => 
        node.name.toLowerCase().includes(lowerSearchTerm) ||
        node.type.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'selected':
        filtered = filtered.filter(node => selectedNodes.includes(node.id));
        break;
      case 'visible':
        filtered = filtered.filter(node => !hiddenNodes.has(node.id));
        break;
      case 'locked':
        filtered = filtered.filter(node => lockedNodes.has(node.id));
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Sort nodes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'position':
          return a.position.y - b.position.y || a.position.x - b.position.x;
        default:
          return 0;
      }
    });

    return filtered;
  }, [nodes, searchTerm, filterType, sortBy, selectedNodes, hiddenNodes, lockedNodes]);

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    const visibleNodeIds = filteredNodes
      .filter(node => !hiddenNodes.has(node.id))
      .map(node => node.id);
    onSelectionChange(visibleNodeIds);
  }, [filteredNodes, hiddenNodes, onSelectionChange]);

  const handleDeselectAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  const handleToggleNode = useCallback((nodeId: string) => {
    if (selectedNodes.includes(nodeId)) {
      onSelectionChange(selectedNodes.filter(id => id !== nodeId));
    } else {
      onSelectionChange([...selectedNodes, nodeId]);
    }
  }, [selectedNodes, onSelectionChange]);

  const handleInvertSelection = useCallback(() => {
    const visibleNodeIds = filteredNodes
      .filter(node => !hiddenNodes.has(node.id))
      .map(node => node.id);
    const invertedSelection = visibleNodeIds.filter(id => !selectedNodes.includes(id));
    onSelectionChange(invertedSelection);
  }, [filteredNodes, hiddenNodes, selectedNodes, onSelectionChange]);

  // Bulk operations
  const handleBulkOperation = useCallback((operation: string) => {
    if (selectedNodes.length === 0) return;

    switch (operation) {
      case 'copy':
        onCopyNodes(selectedNodes);
        break;
      case 'delete':
        onDeleteNodes(selectedNodes);
        break;
      case 'duplicate':
        onDuplicateNodes(selectedNodes);
        break;
      case 'group':
        onGroupNodes(selectedNodes);
        break;
      case 'ungroup':
        onUngroupNodes(selectedNodes);
        break;
      case 'show':
        selectedNodes.forEach(nodeId => {
          if (hiddenNodes.has(nodeId)) {
            onToggleNodeVisibility(nodeId);
          }
        });
        break;
      case 'hide':
        selectedNodes.forEach(nodeId => {
          if (!hiddenNodes.has(nodeId)) {
            onToggleNodeVisibility(nodeId);
          }
        });
        break;
      case 'lock':
        selectedNodes.forEach(nodeId => {
          if (!lockedNodes.has(nodeId)) {
            onToggleNodeLock(nodeId);
          }
        });
        break;
      case 'unlock':
        selectedNodes.forEach(nodeId => {
          if (lockedNodes.has(nodeId)) {
            onToggleNodeLock(nodeId);
          }
        });
        break;
    }
  }, [selectedNodes, onCopyNodes, onDeleteNodes, onDuplicateNodes, onGroupNodes, onUngroupNodes, onToggleNodeVisibility, onToggleNodeLock, hiddenNodes, lockedNodes]);

  // Get node status
  const getNodeStatus = useCallback((node: WorkflowNode) => {
    const statuses = [];
    if (selectedNodes.includes(node.id)) statuses.push('selected');
    if (hiddenNodes.has(node.id)) statuses.push('hidden');
    if (lockedNodes.has(node.id)) statuses.push('locked');
    return statuses;
  }, [selectedNodes, hiddenNodes, lockedNodes]);

  // Get node type color
  const getNodeTypeColor = useCallback((type: string) => {
    const colors = {
      'httpRequest': 'bg-blue-500',
      'aiTask': 'bg-purple-500',
      'ifCondition': 'bg-yellow-500',
      'forLoop': 'bg-green-500',
      'whileLoop': 'bg-orange-500',
      'delay': 'bg-gray-500',
      'logMessage': 'bg-cyan-500',
      'webhook': 'bg-pink-500',
      'database': 'bg-indigo-500',
      'file': 'bg-emerald-500',
      'email': 'bg-red-500',
      'slack': 'bg-purple-600',
      'discord': 'bg-indigo-600',
      'telegram': 'bg-blue-600',
      'twitter': 'bg-sky-500',
      'github': 'bg-gray-800',
      'googleSheets': 'bg-green-600',
      'notion': 'bg-gray-700',
      'airtable': 'bg-yellow-600',
      'salesforce': 'bg-blue-700',
      'hubspot': 'bg-orange-600',
      'mailchimp': 'bg-yellow-500',
      'stripe': 'bg-purple-700',
      'paypal': 'bg-blue-800',
      'shopify': 'bg-green-700',
      'woocommerce': 'bg-purple-800',
      'wordpress': 'bg-blue-900',
      'zapier': 'bg-orange-500',
      'integromat': 'bg-blue-500',
      'n8n': 'bg-red-600',
      'microsoft': 'bg-blue-600',
      'google': 'bg-red-500',
      'aws': 'bg-orange-500',
      'azure': 'bg-blue-500',
      'gcp': 'bg-red-500',
      'docker': 'bg-blue-600',
      'kubernetes': 'bg-purple-600',
      'jenkins': 'bg-blue-700',
      'gitlab': 'bg-orange-600',
      'bitbucket': 'bg-blue-800',
      'jira': 'bg-blue-600',
      'confluence': 'bg-blue-700',
      'trello': 'bg-blue-500',
      'asana': 'bg-red-500',
      'monday': 'bg-purple-600',
      'clickup': 'bg-purple-700',
      'basecamp': 'bg-green-600',
      'linear': 'bg-indigo-600',
      'figma': 'bg-purple-500',
      'sketch': 'bg-orange-500',
      'adobe': 'bg-red-600',
      'canva': 'bg-blue-500',
      'unsplash': 'bg-gray-800',
      'pexels': 'bg-green-500',
      'youtube': 'bg-red-600',
      'vimeo': 'bg-blue-600',
      'twitch': 'bg-purple-600',
      'spotify': 'bg-green-500',
      'soundcloud': 'bg-orange-500',
      'dropbox': 'bg-blue-500',
      'onedrive': 'bg-blue-600',
      'googledrive': 'bg-yellow-500',
      'box': 'bg-blue-700',
      'ftp': 'bg-gray-600',
      'sftp': 'bg-gray-700',
      'ssh': 'bg-gray-800',
      'rsync': 'bg-green-600',
      'curl': 'bg-orange-600',
      'wget': 'bg-green-700',
      'postman': 'bg-orange-500',
      'insomnia': 'bg-purple-600'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  }, []);

  if (!isExpanded) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Multi-Select</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-6 w-6 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Multi-Select</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {selectedNodes.length} / {nodes.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-xs border rounded"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="flex-1 px-2 py-1 text-xs border rounded"
              >
                <option value="all">All Nodes</option>
                <option value="selected">Selected</option>
                <option value="visible">Visible</option>
                <option value="locked">Locked</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-2 py-1 text-xs border rounded"
              >
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="position">Position</option>
              </select>
            </div>
          </div>

          {/* Selection Actions */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-7 px-2"
                >
                  <SelectAll className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select All</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="h-7 px-2"
                >
                  <Square className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Deselect All</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInvertSelection}
                  className="h-7 px-2"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Invert Selection</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Bulk Operations */}
          {selectedNodes.length > 0 && (
            <div className="space-y-2 p-2 bg-muted/50 rounded">
              <div className="text-xs font-medium text-muted-foreground">Bulk Actions</div>
              <div className="grid grid-cols-3 gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkOperation('copy')}
                      className="h-7 px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy Selected</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkOperation('delete')}
                      className="h-7 px-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Selected</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkOperation('duplicate')}
                      className="h-7 px-2"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Duplicate Selected</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkOperation('group')}
                      className="h-7 px-2"
                    >
                      <Group className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Group Selected</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkOperation('hide')}
                      className="h-7 px-2"
                    >
                      <EyeOff className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Hide Selected</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkOperation('lock')}
                      className="h-7 px-2"
                    >
                      <Lock className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Lock Selected</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Alignment Actions */}
              {selectedNodes.length > 1 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Alignment</div>
                  <div className="grid grid-cols-3 gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAlignNodes(selectedNodes, 'left')}
                          className="h-7 px-2"
                        >
                          <AlignLeft className="h-3 w-3" />
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
                          onClick={() => onAlignNodes(selectedNodes, 'center')}
                          className="h-7 px-2"
                        >
                          <AlignCenter className="h-3 w-3" />
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
                          onClick={() => onAlignNodes(selectedNodes, 'right')}
                          className="h-7 px-2"
                        >
                          <AlignRight className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Align Right</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDistributeNodes(selectedNodes, 'horizontal')}
                          className="h-7 px-2 flex-1"
                        >
                          <AlignHorizontalJustifyCenter className="h-3 w-3" />
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
                          onClick={() => onDistributeNodes(selectedNodes, 'vertical')}
                          className="h-7 px-2 flex-1"
                        >
                          <AlignVerticalJustifyCenter className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Distribute Vertically</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Node List */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
              Nodes ({filteredNodes.length})
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {filteredNodes.map((node) => {
                  const isSelected = selectedNodes.includes(node.id);
                  const isHidden = hiddenNodes.has(node.id);
                  const isLocked = lockedNodes.has(node.id);
                  
                  return (
                    <div
                      key={node.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded text-xs hover:bg-muted/50 cursor-pointer",
                        isSelected && "bg-primary/10 border border-primary/20",
                        isHidden && "opacity-50"
                      )}
                      onClick={() => handleToggleNode(node.id)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <CheckSquare className="h-3 w-3 text-primary" />
                          ) : (
                            <Square className="h-3 w-3" />
                          )}
                        </div>
                        
                        <div className={cn(
                          "w-3 h-3 rounded-full flex-shrink-0",
                          getNodeTypeColor(node.type)
                        )} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{node.name}</div>
                          <div className="text-muted-foreground truncate">{node.type}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                        {isHidden && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleNodeVisibility(node.id);
                          }}
                          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                        >
                          {isHidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}