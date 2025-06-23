
'use server';
/**
 * @fileOverview A server-side service for storing and retrieving user workflows.
 * This acts as a file-based database for workflows, replacing localStorage.
 */
import fs from 'fs/promises';
import path from 'path';
import type { Workflow, ExampleWorkflow } from '@/types/workflow';
import { EXAMPLE_WORKFLOWS } from '@/config/example-workflows';

// In a real production app, this would be a proper database.
// For this prototype, we'll use a JSON file on the server's filesystem.
const DB_PATH = path.join(process.cwd(), 'src/data/user_workflows.json');

interface StoredWorkflow {
  name: string;
  workflow: Workflow;
  updatedAt: string;
}

async function readWorkflowsFromFile(): Promise<StoredWorkflow[]> {
  try {
    await fs.access(DB_PATH);
    const fileContent = await fs.readFile(DB_PATH, 'utf-8');
    if (!fileContent.trim()) return [];
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, which is fine. Create it with an empty array.
      await fs.writeFile(DB_PATH, '[]', 'utf-8');
      return [];
    }
    console.error('[Storage Service] Error reading workflow file:', error);
    throw new Error('Could not read workflows from storage.');
  }
}

async function writeWorkflowsToFile(workflows: StoredWorkflow[]): Promise<void> {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(workflows, null, 2), 'utf-8');
  } catch (error) {
    console.error('[Storage Service] Error writing workflow file:', error);
    throw new Error('Could not save workflows to storage.');
  }
}

/**
 * Lists all available workflows, combining hardcoded examples and user-saved workflows.
 */
export async function listAllWorkflows(): Promise<{ name: string; description: string; type: 'example' | 'user' }[]> {
  const userWorkflows = await readWorkflowsFromFile();
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

/**
 * Gets a single workflow definition by its unique name.
 * It checks user-saved workflows first, then example workflows.
 */
export async function getWorkflowByName(name: string): Promise<Workflow | null> {
  const userWorkflows = await readWorkflowsFromFile();
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

/**
 * Saves a user-created workflow. Overwrites if a workflow with the same name exists.
 */
export async function saveWorkflow(name: string, workflow: Workflow): Promise<void> {
  if (!name.trim()) {
    throw new Error('Workflow name cannot be empty.');
  }
  const workflows = await readWorkflowsFromFile();
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

  await writeWorkflowsToFile(workflows);
}

/**
 * Deletes a user-saved workflow by name.
 */
export async function deleteWorkflowByName(name: string): Promise<void> {
  let workflows = await readWorkflowsFromFile();
  const initialLength = workflows.length;
  workflows = workflows.filter(wf => wf.name !== name);

  if (workflows.length === initialLength) {
    // Optional: throw an error if the workflow to delete was not found
    console.warn(`[Storage Service] Attempted to delete non-existent workflow: ${name}`);
  }

  await writeWorkflowsToFile(workflows);
}

/**
 * Finds a workflow that has a webhook trigger with a matching pathSuffix.
 * This is used by the live webhook API route.
 */
export async function findWorkflowByWebhookPath(pathSuffix: string): Promise<Workflow | null> {
  const allWorkflows = await readWorkflowsFromFile();
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
