
import type { Tool } from '@/types/workflow';
import {
  listSavedWorkflowsTool,
  getWorkflowDefinitionTool,
  runWorkflowTool,
  youtubeFindVideoTool,
  youtubeGetReportTool,
  googleDriveFindFileTool,
} from './workflow-management-tools';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { FileIcon } from 'lucide-react';

// This map will hold all tools available to the AI, keyed by their name.
export const ALL_AVAILABLE_TOOLS_MAP = new Map<string, Tool>();

// Helper to create a Tool object from a GenkitTool and metadata.
const createTool = (
  genkitTool: Tool['genkitTool'],
  icon: Tool['icon'],
  service: Tool['service']
): Tool => ({
  name: genkitTool.name,
  description: genkitTool.description,
  icon,
  service,
  genkitTool,
});

// Create and register tools from workflow-management-tools.ts
const kairoIcon = AVAILABLE_NODES_CONFIG.find(n => n.type === 'workflowNode')?.icon!;
const youtubeIcon = AVAILABLE_NODES_CONFIG.find(n => n.type === 'youtubeFetchTrending')?.icon!;
const gdriveIcon = FileIcon; 

ALL_AVAILABLE_TOOLS_MAP.set(listSavedWorkflowsTool.name, createTool(listSavedWorkflowsTool, kairoIcon, 'Kairo'));
ALL_AVAILABLE_TOOLS_MAP.set(getWorkflowDefinitionTool.name, createTool(getWorkflowDefinitionTool, kairoIcon, 'Kairo'));
ALL_AVAILABLE_TOOLS_MAP.set(runWorkflowTool.name, createTool(runWorkflowTool, kairoIcon, 'Kairo'));

ALL_AVAILABLE_TOOLS_MAP.set(youtubeFindVideoTool.name, createTool(youtubeFindVideoTool, youtubeIcon, 'YouTube'));
ALL_AVAILABLE_TOOLS_MAP.set(youtubeGetReportTool.name, createTool(youtubeGetReportTool, youtubeIcon, 'YouTube'));

ALL_AVAILABLE_TOOLS_MAP.set(googleDriveFindFileTool.name, createTool(googleDriveFindFileTool, gdriveIcon, 'Google Drive'));

// You can easily add more tools here from other files.
// For example, if you had `src/ai/tools/social-media-tools.ts`:
// import { postToTwitterTool } from './social-media-tools';
// const twitterIcon = ...;
// ALL_AVAILABLE_TOOLS_MAP.set(postToTwitterTool.name, createTool(postToTwitterTool, twitterIcon, 'Twitter'));


// Export a simple array for easy iteration in UI components
export const ALL_AVAILABLE_TOOLS: Tool[] = Array.from(ALL_AVAILABLE_TOOLS_MAP.values());
