
'use server';
/**
 * @fileOverview A server-side service for storing and retrieving user workflows and run history.
 * This acts as a file-based database.
 */
import fs from 'fs/promises';
import path from 'path';
import type { Workflow, ExampleWorkflow, WorkflowRunRecord } from '@/types/workflow';
import { EXAMPLE_WORKFLOWS } from '@/config/example-workflows';

const WORKFLOWS_DB_PATH = path.join(process.cwd(), 'src/data/user_workflows.json');
const RUN_HISTORY_DB_PATH = path.join(process.cwd(), 'src/data/run_history.json');
const MAX_RUN_HISTORY = 100; // Max number of run records to keep

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
      await fs.writeFile(filePath, '[]', 'utf-8');
      return [];
    }
    console.error(`[Storage Service] Error reading file ${filePath}:`, error);
    throw new Error(`Could not read data from ${path.basename(filePath)}.`);
  }
}

async function writeDataToFile<T>(filePath: string, data: T[]): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
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
    return { nodes: exampleWorkflow.nodes, connections: exampleWorkflow.connections };
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

  const combined = [
    ...allWorkflows.map(uw => ({ ...uw.workflow, name: uw.name })), 
    ...allExampleWorkflows
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
  return await readDataFromFile<WorkflowRunRecord>(RUN_HISTORY_DB_PATH);
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
