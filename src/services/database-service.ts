'use server';

import { db } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import type { Workflow, ExampleWorkflow, WorkflowRunRecord, McpCommandRecord, AgentConfig, SavedWorkflowMetadata, ManagedCredential, UserApiKey, DisplayUserApiKey } from '@/types/workflow';
import { EXAMPLE_WORKFLOWS } from '@/config/example-workflows';
import { encrypt, decrypt } from './encryption-service';
import crypto from 'crypto';
import communityWorkflowsData from '@/data/community_workflows.json';

const MAX_RUN_HISTORY = 100;
const MAX_MCP_HISTORY = 50;

// ========================
// Workflow Management
// ========================

export async function listAllWorkflows(userId?: string | null): Promise<SavedWorkflowMetadata[]> {
  const exampleWorkflows: SavedWorkflowMetadata[] = EXAMPLE_WORKFLOWS.map(wf => ({
    name: wf.name,
    description: wf.description,
    type: 'example' as const
  }));
  
  if (!userId) {
    return exampleWorkflows;
  }
  
  const userWorkflows = await db.query(
    'SELECT name, updated_at FROM workflows WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  );

  const savedUserWorkflows: SavedWorkflowMetadata[] = userWorkflows.map((wf: any) => ({
    name: wf.name,
    description: `Last saved on ${new Date(wf.updated_at).toLocaleDateString()}`,
    type: 'user' as const,
    updated_at: wf.updated_at
  }));

  return [...exampleWorkflows, ...savedUserWorkflows];
}

export async function getCommunityWorkflows(): Promise<ExampleWorkflow[]> {
  return communityWorkflowsData as ExampleWorkflow[];
}

export async function getIsUserWorkflow(name: string, userId: string): Promise<boolean> {
  const result = await db.query(
    'SELECT COUNT(*) as count FROM workflows WHERE user_id = $1 AND name = $2',
    [userId, name]
  );
  
  return parseInt(result[0].count) > 0;
}

export async function getWorkflowCountForUser(userId: string): Promise<number> {
  const result = await db.query(
    'SELECT COUNT(*) as count FROM workflows WHERE user_id = $1',
    [userId]
  );
  
  return parseInt(result[0].count);
}

export async function getWorkflowByName(name: string, userId?: string | null): Promise<Workflow | null> {
  const exampleWorkflow = EXAMPLE_WORKFLOWS.find(wf => wf.name === name);
  if (exampleWorkflow) {
    return exampleWorkflow.workflow;
  }
  
  const communityWorkflow = communityWorkflowsData.find(wf => wf.name === name);
  if (communityWorkflow) {
    return communityWorkflow.workflow;
  }

  if (!userId) return null;

  const result = await db.query(
    'SELECT workflow_data FROM workflows WHERE name = $1 AND user_id = $2',
    [name, userId]
  );

  if (result.length === 0) {
    return null;
  }

  return result[0].workflow_data as Workflow;
}

export async function saveWorkflow(name: string, workflow: Workflow, userId: string): Promise<void> {
  if (!name.trim()) {
    throw new Error('Workflow name cannot be empty.');
  }

  await db.query(
    `INSERT INTO workflows (user_id, name, workflow_data, updated_at) 
     VALUES ($1, $2, $3, NOW()) 
     ON CONFLICT (user_id, name) 
     DO UPDATE SET workflow_data = $3, updated_at = NOW()`,
    [userId, name, JSON.stringify(workflow)]
  );
}

export async function deleteWorkflowByName(name: string, userId: string): Promise<void> {
  await db.query(
    'DELETE FROM workflows WHERE user_id = $1 AND name = $2',
    [userId, name]
  );
}

export async function findWorkflowByWebhookPath(pathSuffix: string): Promise<{ workflow: Workflow; userId: string; } | null> {
  const result = await db.query(
    'SELECT * FROM find_workflow_by_webhook_path($1)',
    [pathSuffix]
  );

  if (result.length === 0) {
    return null;
  }

  return {
    workflow: result[0].workflow_data_result,
    userId: result[0].user_id_result
  };
}

export async function getAllScheduledWorkflows(): Promise<{ user_id: string; name: string; workflow_data: Workflow; }[]> {
  const result = await db.query(
    'SELECT user_id, name, workflow_data FROM workflows'
  );

  return result.filter((wf: any) => 
    wf.workflow_data && 
    Array.isArray(wf.workflow_data.nodes) && 
    wf.workflow_data.nodes.some((node: any) => node.type === 'schedule')
  );
}

// ========================
// Run History Management
// ========================

export async function getRunHistory(userId: string): Promise<WorkflowRunRecord[]> {
  const result = await db.query(
    'SELECT * FROM run_history WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2',
    [userId, MAX_RUN_HISTORY]
  );
  
  return result.map((r: any) => ({
    id: r.id,
    workflowName: r.workflow_name,
    timestamp: r.timestamp,
    status: r.status as 'Success' | 'Failed',
    executionResult: r.execution_result,
    initialData: r.initial_data,
    workflowSnapshot: r.workflow_snapshot
  }));
}

export async function getRunRecordById(id: string, userId: string): Promise<WorkflowRunRecord | null> {
  const result = await db.query(
    'SELECT * FROM run_history WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (result.length === 0) {
    return null;
  }
  
  const r = result[0];
  return {
    id: r.id,
    workflowName: r.workflow_name,
    timestamp: r.timestamp,
    status: r.status as 'Success' | 'Failed',
    executionResult: r.execution_result,
    initialData: r.initial_data,
    workflowSnapshot: r.workflow_snapshot
  };
}

export async function saveRunRecord(record: WorkflowRunRecord, userId: string): Promise<void> {
  await db.query(
    `INSERT INTO run_history (id, user_id, workflow_name, timestamp, status, execution_result, initial_data, workflow_snapshot) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      record.id,
      userId,
      record.workflowName,
      record.timestamp,
      record.status,
      JSON.stringify(record.executionResult),
      JSON.stringify(record.initialData),
      JSON.stringify(record.workflowSnapshot)
    ]
  );
}

export async function clearRunHistory(userId: string): Promise<void> {
  await db.query('DELETE FROM run_history WHERE user_id = $1', [userId]);
}

export async function getMonthlyRunCount(userId: string): Promise<number> {
  const yearMonth = new Date().toISOString().slice(0, 7);
  const result = await db.query(
    'SELECT run_count FROM workflow_runs_monthly WHERE user_id = $1 AND year_month = $2',
    [userId, yearMonth]
  );
  
  return result.length > 0 ? result[0].run_count : 0;
}

export async function incrementMonthlyRunCount(userId: string): Promise<void> {
  await db.query('SELECT increment_run_count($1)', [userId]);
}

export async function getMonthlyGenerationCount(userId: string): Promise<number> {
  const yearMonth = new Date().toISOString().slice(0, 7);
  const result = await db.query(
    'SELECT generation_count FROM ai_generations_monthly WHERE user_id = $1 AND year_month = $2',
    [userId, yearMonth]
  );
  
  return result.length > 0 ? result[0].generation_count : 0;
}

export async function incrementMonthlyGenerationCount(userId: string): Promise<void> {
  await db.query('SELECT increment_generation_count($1)', [userId]);
}

// ========================
// MCP Command History
// ========================

export async function getMcpHistory(userId: string): Promise<McpCommandRecord[]> {
  const result = await db.query(
    'SELECT * FROM mcp_command_history WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2',
    [userId, MAX_MCP_HISTORY]
  );
  
  return result as McpCommandRecord[];
}

export async function saveMcpCommand(record: Omit<McpCommandRecord, 'id' | 'user_id'>, userId: string): Promise<void> {
  await db.query(
    'INSERT INTO mcp_command_history (id, user_id, timestamp, command, response, status) VALUES ($1, $2, $3, $4, $5, $6)',
    [crypto.randomUUID(), userId, record.timestamp, record.command, record.response, record.status]
  );
}

// ========================
// Agent & User Profile
// ========================

export async function getAgentConfig(userId: string): Promise<AgentConfig> {
  const defaultConfig: AgentConfig = { enabledTools: ['listSavedWorkflows', 'getWorkflowDefinition', 'runWorkflow'] };

  const result = await db.query(
    'SELECT enabled_tools FROM agent_config WHERE user_id = $1',
    [userId]
  );
  
  if (result.length === 0) {
    return defaultConfig;
  }
  
  return { enabledTools: result[0].enabled_tools };
}

export async function saveAgentConfig(config: AgentConfig, userId: string): Promise<void> {
  await db.query(
    `INSERT INTO agent_config (user_id, enabled_tools, updated_at) 
     VALUES ($1, $2, NOW()) 
     ON CONFLICT (user_id) 
     DO UPDATE SET enabled_tools = $2, updated_at = NOW()`,
    [userId, JSON.stringify(config.enabledTools)]
  );
}

export async function getUserProfile(userId: string): Promise<{ subscription_tier: string; trial_end_date: string | null } | null> {
  const result = await db.query(
    'SELECT subscription_tier, trial_end_date FROM user_profiles WHERE id = $1',
    [userId]
  );
  
  if (result.length === 0) {
    return null;
  }
  
  return result[0];
}

export async function updateUserProfileTier(userId: string, newTier: 'Gold' | 'Diamond'): Promise<void> {
  await db.query(
    'UPDATE user_profiles SET subscription_tier = $2, trial_end_date = NULL WHERE id = $1',
    [userId, newTier]
  );
}

// ========================
// Credential Management
// ========================

export async function getCredentialsForUser(userId: string): Promise<Omit<ManagedCredential, 'value'>[]> {
  const result = await db.query(
    'SELECT id, name, service, created_at FROM credentials WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  return result.map((r: any) => ({
    id: r.id,
    name: r.name,
    service: r.service,
    created_at: r.created_at,
    user_id: userId
  }));
}

export async function getCredentialValueByNameForUser(name: string, userId: string): Promise<string | null> {
  const result = await db.query(
    'SELECT value FROM credentials WHERE user_id = $1 AND name = $2',
    [userId, name]
  );
  
  if (result.length === 0) {
    return null;
  }
  
  try {
    return await decrypt(result[0].value);
  } catch (e: any) {
    console.error(`Failed to decrypt credential '${name}' for user '${userId}':`, e.message);
    return null;
  }
}

export async function saveCredential(credential: Omit<ManagedCredential, 'id'>, userId: string): Promise<void> {
  const encryptedValue = await encrypt(credential.value);

  await db.query(
    `INSERT INTO credentials (user_id, name, value, service, created_at) 
     VALUES ($1, $2, $3, $4, $5) 
     ON CONFLICT (user_id, name) 
     DO UPDATE SET value = $3, service = $4, created_at = $5`,
    [userId, credential.name, encryptedValue, credential.service, credential.created_at]
  );
}

export async function deleteCredential(id: string, userId: string): Promise<void> {
  await db.query(
    'DELETE FROM credentials WHERE user_id = $1 AND id = $2',
    [userId, id]
  );
}

// ========================
// API Key Management
// ========================

function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export async function generateApiKey(userId: string): Promise<{ apiKey: string; id: string; prefix: string; }> {
  const prefix = 'kairo_sk_';
  const secretPart = crypto.randomBytes(24).toString('hex');
  const apiKey = `${prefix}${secretPart}`;
  const keyHash = hashApiKey(apiKey);

  const result = await db.query(
    'INSERT INTO user_api_keys (user_id, key_hash, prefix) VALUES ($1, $2, $3) RETURNING id',
    [userId, keyHash, prefix]
  );
  
  return { apiKey, id: result[0].id, prefix };
}

export async function listApiKeysForUser(userId: string): Promise<DisplayUserApiKey[]> {
  const result = await db.query(
    'SELECT id, prefix, created_at, last_used_at FROM user_api_keys WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  return result;
}

export async function revokeApiKey(keyId: string, userId: string): Promise<void> {
  await db.query(
    'DELETE FROM user_api_keys WHERE id = $1 AND user_id = $2',
    [keyId, userId]
  );
}

export async function findUserByApiKey(apiKey: string): Promise<string | null> {
  if (!apiKey.startsWith('kairo_sk_')) {
    return null;
  }
  
  const keyHash = hashApiKey(apiKey);
  const result = await db.query(
    'SELECT * FROM find_user_by_api_key($1)',
    [keyHash]
  );

  if (result.length === 0) {
    return null;
  }
  
  // Update last_used_at timestamp
  await db.query(
    'UPDATE user_api_keys SET last_used_at = NOW() WHERE key_hash = $1',
    [keyHash]
  );

  return result[0].find_user_by_api_key;
}