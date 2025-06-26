
'use server';
/**
 * @fileOverview A server-side service for storing and retrieving user workflows and run history.
 * This acts as a file-based database.
 */
import fs from 'fs/promises';
import path from 'path';
import type { Workflow, ExampleWorkflow, WorkflowRunRecord, McpCommandRecord, AgentConfig } from '@/types/workflow';
import { EXAMPLE_WORKFLOWS } from '@/config/example-workflows';

const WORKFLOWS_DB_PATH = path.join(process.cwd(), 'src/data/user_workflows.json');
const RUN_HISTORY_DB_PATH = path.join(process.cwd(), 'src/data/run_history.json');
const MCP_HISTORY_DB_PATH = path.join(process.cwd(), 'src/data/mcp_command_history.json');
const AGENT_CONFIG_DB_PATH = path.join(process.cwd(), 'src/data/agent_config.json');

const MAX_RUN_HISTORY = 100; // Max number of run records to keep
const MAX_MCP_HISTORY = 50; // Max number of MCP command records to keep

interface StoredWorkflow {
  name: string;
  workflow: Workflow;
  updatedAt: string;
}

// ========================
// Generic File IO Handlers
// ========================

async function readDataFromFile<T>(filePath: string): Promise<T[]> {
  try {
    await fs.access(filePath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    if (!fileContent.trim()) return [];
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // If the file doesn't exist, create it with an empty array.
      await fs.writeFile(filePath, '[]', 'utf-8');
      return [];
    }
    console.error(`[Storage Service] Error reading file ${filePath}:`, error);
    throw new Error(`Could not read data from ${path.basename(filePath)}.`);
  }
}

async function writeDataToFile<T>(filePath: string, data: T[] | T): Promise<void> {
  try {
    const dataToWrite = Array.isArray(data) ? data : [data];
    await fs.writeFile(filePath, JSON.stringify(dataToWrite, null, 2), 'utf-8');
  } catch (error) {
    console.error(`[Storage Service] Error writing file ${filePath}:`, error);
    throw new Error(`Could not save data to ${path.basename(filePath)}.`);
  }
}

// ========================
// Workflow Management
// ========================

export async function listAllWorkflows(): Promise<{ name: string; description: string; type: 'example' | 'user' }[]> {
  const userWorkflows = await readDataFromFile<StoredWorkflow>(WORKFLOWS_DB_PATH);
  const exampleWorkflows = EXAMPLE_WORKFLOWS.map(wf => ({
    name: wf.name,
    description: wf.description,
    type: 'example' as const
  }));
  
  const savedUserWorkflows = userWorkflows.map(wf => ({
    name: wf.name,
    description: `Last saved on ${new Date(wf.updatedAt).toLocaleDateString()}`,
    type: 'user' as const
  }));

  return [...exampleWorkflows, ...savedUserWorkflows];
}

export async function getWorkflowByName(name: string): Promise<Workflow | null> {
  const userWorkflows = await readDataFromFile<StoredWorkflow>(WORKFLOWS_DB_PATH);
  const userWorkflow = userWorkflows.find(wf => wf.name === name);
  if (userWorkflow) {
    return userWorkflow.workflow;
  }

  const exampleWorkflow = EXAMPLE_WORKFLOWS.find(wf => wf.name === name);
  if (exampleWorkflow) {
    return { 
        nodes: exampleWorkflow.nodes, 
        connections: exampleWorkflow.connections,
        canvasOffset: { x: 0, y: 0 },
        zoomLevel: 1,
        isSimulationMode: true,
    };
  }

  return null;
}

export async function saveWorkflow(name: string, workflow: Workflow): Promise<void> {
  if (!name.trim()) {
    throw new Error('Workflow name cannot be empty.');
  }
  const workflows = await readDataFromFile<StoredWorkflow>(WORKFLOWS_DB_PATH);
  const existingIndex = workflows.findIndex(wf => wf.name === name);

  const newStoredWorkflow: StoredWorkflow = {
    name,
    workflow,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex > -1) {
    workflows[existingIndex] = newStoredWorkflow;
  } else {
    workflows.push(newStoredWorkflow);
  }

  await writeDataToFile<StoredWorkflow>(WORKFLOWS_DB_PATH, workflows);
}

export async function deleteWorkflowByName(name: string): Promise<void> {
  let workflows = await readDataFromFile<StoredWorkflow>(WORKFLOWS_DB_PATH);
  const initialLength = workflows.length;
  workflows = workflows.filter(wf => wf.name !== name);

  if (workflows.length === initialLength) {
    console.warn(`[Storage Service] Attempted to delete non-existent workflow: ${name}`);
  }

  await writeDataToFile<StoredWorkflow>(WORKFLOWS_DB_PATH, workflows);
}

export async function findWorkflowByWebhookPath(pathSuffix: string): Promise<Workflow | null> {
  const allWorkflows = await readDataFromFile<StoredWorkflow>(WORKFLOWS_DB_PATH);
  const allExampleWorkflows: ExampleWorkflow[] = EXAMPLE_WORKFLOWS;

  const combined: Workflow[] = [
    ...allWorkflows.map(uw => ({ ...uw.workflow, name: uw.name })), 
    ...allExampleWorkflows.map(ew => ({
        nodes: ew.nodes,
        connections: ew.connections,
        canvasOffset: {x: 0, y: 0},
        zoomLevel: 1,
        isSimulationMode: true,
    }))
  ];

  for (const wf of combined) {
    const hasMatchingTrigger = wf.nodes.some(
      n => n.type === 'webhookTrigger' && n.config?.pathSuffix === pathSuffix
    );
    if (hasMatchingTrigger) {
      console.log(`[Storage Service] Found workflow '${(wf as any).name || 'User Workflow'}' for webhook path: ${pathSuffix}`);
      return { nodes: wf.nodes, connections: wf.connections };
    }
  }

  return null;
}


// ========================
// Run History Management
// ========================

export async function getRunHistory(): Promise<WorkflowRunRecord[]> {
  const history = await readDataFromFile<WorkflowRunRecord>(RUN_HISTORY_DB_PATH);
  return history.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getRunRecordById(id: string): Promise<WorkflowRunRecord | null> {
  const history = await getRunHistory();
  return history.find(record => record.id === id) || null;
}

export async function saveRunRecord(record: WorkflowRunRecord): Promise<void> {
  const history = await getRunHistory();
  history.unshift(record); // Add new record to the top
  const trimmedHistory = history.slice(0, MAX_RUN_HISTORY);
  await writeDataToFile<WorkflowRunRecord>(RUN_HISTORY_DB_PATH, trimmedHistory);
}

export async function clearRunHistory(): Promise<void> {
  await writeDataToFile<WorkflowRunRecord>(RUN_HISTORY_DB_PATH, []);
}

// ========================
// MCP Command History
// ========================

export async function getMcpHistory(): Promise<McpCommandRecord[]> {
  const history = await readDataFromFile<McpCommandRecord>(MCP_HISTORY_DB_PATH);
  return history.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function saveMcpCommand(record: McpCommandRecord): Promise<void> {
  const history = await getMcpHistory();
  history.unshift(record); // Add new record to the top
  const trimmedHistory = history.slice(0, MAX_MCP_HISTORY);
  await writeDataToFile<McpCommandRecord>(MCP_HISTORY_DB_PATH, trimmedHistory);
}

// ========================
// Agent Configuration
// ========================

export async function getAgentConfig(): Promise<AgentConfig> {
    try {
        const data = await readDataFromFile<AgentConfig>(AGENT_CONFIG_DB_PATH);
        if (data.length > 0) {
            return data[0];
        }
    } catch (error) {
        console.warn('[Storage Service] Could not read agent config, falling back to default.', error);
    }
    // Default config if file doesn't exist or is empty
    return { enabledTools: ['listSavedWorkflows', 'getWorkflowDefinition', 'runWorkflow'] };
}

export async function saveAgentConfig(config: AgentConfig): Promise<void> {
    await writeDataToFile<AgentConfig>(AGENT_CONFIG_DB_PATH, config);
}


