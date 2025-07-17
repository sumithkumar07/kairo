'use client';

import React, { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
}

interface KeyboardShortcutHandlerProps {
  shortcuts: KeyboardShortcut[];
  disabled?: boolean;
  children?: React.ReactNode;
}

export function KeyboardShortcutHandler({ 
  shortcuts, 
  disabled = false, 
  children 
}: KeyboardShortcutHandlerProps) {
  const { toast } = useToast();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    // Don't trigger shortcuts if user is typing in an input field
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.contentEditable === 'true';
    
    if (isInputField && !event.ctrlKey && !event.metaKey) return;

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = (shortcut.ctrlKey || false) === (event.ctrlKey || event.metaKey);
      const shiftMatch = (shortcut.shiftKey || false) === event.shiftKey;
      const altMatch = (shortcut.altKey || false) === event.altKey;
      
      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      matchingShortcut.action();
    }
  }, [shortcuts, disabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return <>{children}</>;
}

// Default workflow editor shortcuts
export const createWorkflowShortcuts = (actions: {
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onDuplicate: () => void;
  onSave: () => void;
  onRun: () => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onToggleMinimap: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomFit: () => void;
  onClearSelection: () => void;
}): KeyboardShortcut[] => [
  {
    key: 'z',
    ctrlKey: true,
    description: 'Undo',
    action: actions.onUndo
  },
  {
    key: 'z',
    ctrlKey: true,
    shiftKey: true,
    description: 'Redo',
    action: actions.onRedo
  },
  {
    key: 'y',
    ctrlKey: true,
    description: 'Redo',
    action: actions.onRedo
  },
  {
    key: 'c',
    ctrlKey: true,
    description: 'Copy',
    action: actions.onCopy
  },
  {
    key: 'v',
    ctrlKey: true,
    description: 'Paste',
    action: actions.onPaste
  },
  {
    key: 'Delete',
    description: 'Delete selected',
    action: actions.onDelete
  },
  {
    key: 'Backspace',
    description: 'Delete selected',
    action: actions.onDelete
  },
  {
    key: 'a',
    ctrlKey: true,
    description: 'Select all',
    action: actions.onSelectAll
  },
  {
    key: 'd',
    ctrlKey: true,
    description: 'Duplicate',
    action: actions.onDuplicate
  },
  {
    key: 's',
    ctrlKey: true,
    description: 'Save',
    action: actions.onSave
  },
  {
    key: 'Enter',
    ctrlKey: true,
    description: 'Run workflow',
    action: actions.onRun
  },
  {
    key: 'g',
    description: 'Toggle grid',
    action: actions.onToggleGrid
  },
  {
    key: 's',
    description: 'Toggle snap',
    action: actions.onToggleSnap
  },
  {
    key: 'm',
    description: 'Toggle minimap',
    action: actions.onToggleMinimap
  },
  {
    key: '=',
    ctrlKey: true,
    description: 'Zoom in',
    action: actions.onZoomIn
  },
  {
    key: '-',
    ctrlKey: true,
    description: 'Zoom out',
    action: actions.onZoomOut
  },
  {
    key: '0',
    ctrlKey: true,
    description: 'Reset zoom',
    action: actions.onZoomReset
  },
  {
    key: '9',
    ctrlKey: true,
    description: 'Zoom to fit',
    action: actions.onZoomFit
  },
  {
    key: 'Escape',
    description: 'Clear selection',
    action: actions.onClearSelection
  }
];

// Hook for using keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], disabled?: boolean) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.contentEditable === 'true';
    
    if (isInputField && !event.ctrlKey && !event.metaKey) return;

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = (shortcut.ctrlKey || false) === (event.ctrlKey || event.metaKey);
      const shiftMatch = (shortcut.shiftKey || false) === event.shiftKey;
      const altMatch = (shortcut.altKey || false) === event.altKey;
      
      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      matchingShortcut.action();
    }
  }, [shortcuts, disabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}