
'use server';
/**
 * @fileOverview Defines Genkit tools for AI-driven workflow management.
 * These tools allow the AI to list, inspect, and execute workflows by interacting
 * with the central WorkflowStorage service and external APIs.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { listAllWorkflows, getWorkflowByName, getCredentialValueByNameForUser } from '@/services/workflow-storage-service';
import type { WorkflowNode, WorkflowConnection } from '@/types/workflow';
import { executeWorkflow } from '@/lib/workflow-engine';
import { google } from 'googleapis';

// Schema for Workflow Nodes (simplified for tool input)
const WorkflowNodeInputSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }),
  config: z.any(),
  inputHandles: z.array(z.string()).optional(),
  outputHandles: z.array(z.string()).optional(),
  aiExplanation: z.string().optional(),
  category: z.string(),
  lastExecutionStatus: z.string().optional(),
});

// Schema for Workflow Connections (simplified for tool input)
const WorkflowConnectionInputSchema = z.object({
  id: z.string(),
  sourceNodeId: z.string(),
  sourceHandle: z.string().optional(),
  targetNodeId: z.string(),
  targetHandle: z.string().optional(),
});


export const listSavedWorkflowsTool = ai.defineTool(
  {
    name: 'listSavedWorkflows',
    description: 'Lists all available saved workflows, including examples and user-created ones for the given user.',
    inputSchema: z.object({ 
        userId: z.string().describe("The ID of the user whose workflows to list.") 
    }),
    outputSchema: z.array(z.object({
        name: z.string(),
        description: z.string(),
        type: z.enum(['example', 'user']),
    })),
  },
  async ({ userId }) => {
    console.log(`[Agent Tool] Listing all workflows for user ${userId} from storage...`);
    return await listAllWorkflows(userId);
  }
);

export const getWorkflowDefinitionTool = ai.defineTool(
  {
    name: 'getWorkflowDefinition',
    description: 'Retrieves the full JSON definition (nodes and connections) for a specific workflow by its name for a given user.',
    inputSchema: z.object({ 
        name: z.string().describe("The exact name of the workflow to retrieve."),
        userId: z.string().describe("The ID of the user who owns the workflow."),
    }),
    outputSchema: z.object({
        nodes: z.array(WorkflowNodeInputSchema),
        connections: z.array(WorkflowConnectionInputSchema),
    }).optional(),
  },
  async ({ name, userId }) => {
    console.log(`[Agent Tool] Getting definition for workflow: ${name} from storage for user ${userId}...`);
    const workflow = await getWorkflowByName(name, userId);
    if (workflow) {
      // Cast the workflow nodes and connections to the input schemas.
      return {
        nodes: workflow.nodes as z.infer<typeof WorkflowNodeInputSchema>[],
        connections: workflow.connections as z.infer<typeof WorkflowConnectionInputSchema>[],
      };
    }
    return undefined;
  }
);

export const runWorkflowTool = ai.defineTool(
    {
        name: 'runWorkflow',
        description: 'Executes a given workflow definition for a specific user and returns the result. Can be run in "simulation" or "live" mode.',
        inputSchema: z.object({
            userId: z.string().describe("The ID of the user for whom to run the workflow."),
            nodes: z.array(WorkflowNodeInputSchema).describe("The array of nodes in the workflow."),
            connections: z.array(WorkflowConnectionInputSchema).describe("The array of connections between the nodes."),
            isSimulation: z.boolean().optional().default(true).describe("Whether to run in simulation mode (default) or live mode. Live mode may interact with real external services."),
        }),
        outputSchema: z.object({
            status: z.string().describe("The final status of the workflow execution ('Success' or 'Failed')."),
            summary: z.string().describe("A brief summary of the execution, including any error messages."),
        }),
    },
    async ({ userId, nodes, connections, isSimulation }) => {
        if (!userId) {
            return {
                status: 'Failed',
                summary: 'User ID is not provided. Cannot run workflow.',
            };
        }

        console.log(`[Agent Tool] Running workflow with ${nodes.length} nodes for user ${userId} in ${isSimulation ? 'simulation' : 'live'} mode...`);
        try {
            const result = await executeWorkflow({ nodes: nodes as WorkflowNode[], connections: connections as WorkflowConnection[] }, isSimulation, userId);
            const hasErrors = Object.values(result.finalWorkflowData).some((nodeOutput: any) => nodeOutput.lastExecutionStatus === 'error');
            const status = hasErrors ? 'Failed' : 'Success';

            let summary = `Workflow execution completed with status: ${status}.`;
            if (hasErrors) {
                const errorDetails = Object.entries(result.finalWorkflowData)
                    .filter(([_, value]) => (value as any).lastExecutionStatus === 'error')
                    .map(([key, value]) => `Node '${(nodes.find(n => n.id === key))?.name || key}' failed with error: ${(value as any).error_message}`)
                    .join('; ');
                summary += ` Errors: ${errorDetails}`;
            }

            return { status, summary };
        } catch (e: any) {
            console.error(`[Agent Tool] Critical error running workflow for user ${userId}: ${e.message}`);
            return {
                status: 'Failed',
                summary: `A critical error occurred during workflow execution: ${e.message}`,
            };
        }
    }
);


// Activated tools with real API calls
export const youtubeFindVideoTool = ai.defineTool({
    name: 'youtubeFindVideo',
    description: 'Finds a YouTube video based on a search query. Can be used to find "latest video" or a specific title.',
    inputSchema: z.object({ 
        query: z.string().describe('The search query, e.g., "Kairo Launch Trailer" or "latest video from Kairo channel".'),
        userId: z.string().describe("The user's ID, needed to retrieve their API key."),
    }),
    outputSchema: z.object({ videoId: z.string(), title: z.string(), channel: z.string() }).optional(),
}, async ({ query, userId }) => {
    console.log(`[Agent Tool] Finding YouTube video for query: ${query} (user: ${userId})`);
    const apiKey = await getCredentialValueByNameForUser('YouTubeApiKey', userId);
    if (!apiKey) throw new Error('YouTubeApiKey credential not found. Please add it in the AI Agent Hub.');

    const youtube = google.youtube({ version: 'v3', auth: apiKey });
    try {
        const response = await youtube.search.list({
            part: ['snippet'],
            q: query,
            type: ['video'],
            maxResults: 1,
        });
        const video = response.data.items?.[0];
        if (video?.id?.videoId && video.snippet?.title && video.snippet.channelTitle) {
            return {
                videoId: video.id.videoId,
                title: video.snippet.title,
                channel: video.snippet.channelTitle,
            };
        }
        return undefined;
    } catch (e: any) {
        throw new Error(`YouTube API error: ${e.message}`);
    }
});

export const youtubeGetReportTool = ai.defineTool({
    name: 'youtubeGetReport',
    description: 'Gets a performance report (views, likes, comments) for a given YouTube video ID.',
    inputSchema: z.object({ 
        videoId: z.string().describe("The ID of the video to get a report for."),
        userId: z.string().describe("The user's ID, needed to retrieve their API key."),
    }),
    outputSchema: z.object({ views: z.number(), likes: z.number(), comments: z.number() }).optional(),
}, async ({ videoId, userId }) => {
    console.log(`[Agent Tool] Getting report for YouTube video: ${videoId} (user: ${userId})`);
    const apiKey = await getCredentialValueByNameForUser('YouTubeApiKey', userId);
    if (!apiKey) throw new Error('YouTubeApiKey credential not found. Please add it in the AI Agent Hub.');

    const youtube = google.youtube({ version: 'v3', auth: apiKey });
    try {
        const response = await youtube.videos.list({
            part: ['statistics'],
            id: [videoId],
        });
        const stats = response.data.items?.[0]?.statistics;
        if (stats) {
            return {
                views: parseInt(stats.viewCount || '0', 10),
                likes: parseInt(stats.likeCount || '0', 10),
                comments: parseInt(stats.commentCount || '0', 10),
            };
        }
        return undefined;
    } catch (e: any) {
        throw new Error(`YouTube API error: ${e.message}`);
    }
});

export const googleDriveFindFileTool = ai.defineTool({
    name: 'googleDriveFindFile',
    description: 'Finds a file or folder in Google Drive by its name.',
    inputSchema: z.object({ 
        name: z.string().describe('The name of the file or folder to find.'),
        userId: z.string().describe("The user's ID, needed to retrieve their service account key."),
    }),
    outputSchema: z.object({ fileId: z.string(), name: z.string(), mimeType: z.string() }).optional(),
}, async ({ name, userId }) => {
    console.log(`[Agent Tool] Finding Google Drive file: ${name} (user: ${userId})`);
    const serviceAccountKeyJson = await getCredentialValueByNameForUser('GoogleServiceAccount', userId);
    if (!serviceAccountKeyJson) throw new Error('GoogleServiceAccount credential not found. Please add your Google Service Account JSON key in the AI Agent Hub.');

    try {
        const serviceAccountKey = JSON.parse(serviceAccountKeyJson);
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: serviceAccountKey.client_email,
                private_key: serviceAccountKey.private_key,
            },
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        const drive = google.drive({ version: 'v3', auth });
        const response = await drive.files.list({
            q: `name = '${name}' and trashed = false`,
            fields: 'files(id, name, mimeType)',
            spaces: 'drive',
            pageSize: 1,
        });

        const file = response.data.files?.[0];
        if (file?.id && file.name && file.mimeType) {
            return { fileId: file.id, name: file.name, mimeType: file.mimeType };
        }
        return undefined;
    } catch (e: any) {
        throw new Error(`Google Drive API error: ${e.message}. Ensure the service account has access to the file.`);
    }
});
