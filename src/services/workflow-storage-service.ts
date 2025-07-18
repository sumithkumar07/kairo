'use server';
/**
 * @fileOverview A server-side service for storing and retrieving user workflows and run history from PostgreSQL database.
 */
import { cookies } from 'next/headers';
import type { Workflow, ExampleWorkflow, WorkflowRunRecord, McpCommandRecord, AgentConfig, SavedWorkflowMetadata, ManagedCredential, SubscriptionTier, UserApiKey, DisplayUserApiKey } from '@/types/workflow';
import { EXAMPLE_WORKFLOWS } from '@/config/example-workflows';
import { encrypt, decrypt } from './encryption-service';
import crypto from 'crypto';
import communityWorkflowsData from '@/data/community_workflows.json';
import { db } from '@/lib/database';


const MAX_RUN_HISTORY = 100; // Max number of run records to keep
const MAX_MCP_HISTORY = 50; // Max number of MCP command records to keep

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
  
  try {
    const userWorkflows = await db.query(
      'SELECT name, updated_at FROM workflows WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    
    const savedUserWorkflows: SavedWorkflowMetadata[] = userWorkflows.map(wf => ({
      name: wf.name,
      description: `Last saved on ${new Date(wf.updated_at).toLocaleDateString()}`,
      type: 'user' as const,
      updated_at: wf.updated_at
    }));

    return [...exampleWorkflows, ...savedUserWorkflows];
  } catch (error) {
    console.error('[Storage Service] Error listing workflows:', error);
    throw new Error('Could not list saved workflows.');
  }
}

export async function getCommunityWorkflows(): Promise<ExampleWorkflow[]> {
    // In a real app, this might fetch from a database or a remote service.
    // For this prototype, we'll just return the imported JSON data.
    return communityWorkflowsData as ExampleWorkflow[];
}

export async function getIsUserWorkflow(name: string, userId: string): Promise<boolean> {
  try {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM workflows WHERE user_id = $1 AND name = $2',
      [userId, name]
    );
    return parseInt(result[0].count) > 0;
  } catch (error) {
    console.error('[Storage Service] Error checking user workflow existence:', error);
    return false;
  }
}

export async function getWorkflowCountForUser(userId: string): Promise<number> {
  try {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM workflows WHERE user_id = $1',
      [userId]
    );
    return parseInt(result[0].count);
  } catch (error) {
    console.error('[Storage Service] Error counting workflows:', error);
    return 0;
  }
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

  if (!userId) return null; // Can't fetch user workflows if not logged in

  try {
    const result = await db.query(
      'SELECT workflow_data FROM workflows WHERE name = $1 AND user_id = $2',
      [name, userId]
    );
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0].workflow_data as Workflow;
  } catch (error) {
    console.error(`[Storage Service] Error getting workflow '${name}':`, error);
    return null;
  }
}

export async function saveWorkflow(name: string, workflow: Workflow, userId: string): Promise<void> {
  if (!name.trim()) {
    throw new Error('Workflow name cannot be empty.');
  }

  try {
    await db.query(
      `INSERT INTO workflows (user_id, name, workflow_data, updated_at) 
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, name) 
       DO UPDATE SET workflow_data = $3, updated_at = NOW()`,
      [userId, name, JSON.stringify(workflow)]
    );
  } catch (error) {
    console.error(`[Storage Service] Error saving workflow '${name}':`, error);
    throw new Error(`Could not save workflow: ${error}`);
  }
}

export async function deleteWorkflowByName(name: string, userId: string): Promise<void> {
  try {
    await db.query(
      'DELETE FROM workflows WHERE user_id = $1 AND name = $2',
      [userId, name]
    );
  } catch (error) {
    console.error(`[Storage Service] Error deleting workflow '${name}':`, error);
    throw new Error(`Could not delete workflow: ${error}`);
  }
}

export async function findWorkflowByWebhookPath(pathSuffix: string): Promise<{ workflow: Workflow; userId: string; } | null> {
  try {
    const result = await db.query(
      'SELECT * FROM find_workflow_by_webhook_path($1)',
      [pathSuffix]
    );
    
    if (result.length === 0) {
      return null;
    }
    
    const data = result[0];
    return { workflow: data.workflow_data_result, userId: data.user_id_result };
  } catch (error) {
    console.error('[Storage Service] Error in find_workflow_by_webhook_path:', error);
    return null;
  }
}

export async function getAllScheduledWorkflows(): Promise<{ user_id: string; name: string; workflow_data: Workflow; }[]> {
  try {
    const result = await db.query(
      'SELECT user_id, name, workflow_data FROM workflows'
    );
    
    const scheduledWorkflows = result.filter(wf => 
      wf.workflow_data && 
      Array.isArray(wf.workflow_data.nodes) && 
      wf.workflow_data.nodes.some((node: any) => node.type === 'schedule')
    );

    return scheduledWorkflows;
  } catch (error) {
    console.error('[Storage Service] Error fetching all workflows for scheduler:', error);
    throw new Error('Could not fetch workflows for scheduling.');
  }
}

// ========================
// Run History Management
// ========================

export async function getRunHistory(userId: string): Promise<WorkflowRunRecord[]> {
  try {
    const result = await db.query(
      'SELECT * FROM run_history WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [userId, MAX_RUN_HISTORY]
    );
    
    return result.map(r => ({
      id: r.id,
      workflowName: r.workflow_name,
      timestamp: r.timestamp,
      status: r.status as 'Success' | 'Failed',
      executionResult: r.execution_result,
      initialData: r.initial_data,
      workflowSnapshot: r.workflow_snapshot
    }));
  } catch (error) {
    console.error(`[Storage Service] Error fetching run history:`, error);
    return [];
  }
}

export async function getRunRecordById(id: string, userId: string): Promise<WorkflowRunRecord | null> {
  try {
    const result = await db.query(
      'SELECT * FROM run_history WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.length === 0) {
      return null;
    }
    
    const data = result[0];
    return {
      id: data.id,
      workflowName: data.workflow_name,
      timestamp: data.timestamp,
      status: data.status as 'Success' | 'Failed',
      executionResult: data.execution_result,
      initialData: data.initial_data,
      workflowSnapshot: data.workflow_snapshot
    };
  } catch (error) {
    console.error(`[Storage Service] Error fetching run record by ID ${id}:`, error);
    return null;
  }
}

export async function saveRunRecord(record: WorkflowRunRecord, userId: string): Promise<void> {
  try {
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
  } catch (error) {
    console.error(`[Storage Service] Error saving run record:`, error);
    throw new Error('Could not save run record.');
  }
}

export async function clearRunHistory(userId: string): Promise<void> {
  try {
    await db.query(
      'DELETE FROM run_history WHERE user_id = $1',
      [userId]
    );
  } catch (error) {
    console.error(`[Storage Service] Error clearing run history:`, error);
    throw new Error('Could not clear run history.');
  }
}

export async function getMonthlyRunCount(userId: string): Promise<number> {
  try {
    const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const result = await db.query(
      'SELECT run_count FROM workflow_runs_monthly WHERE user_id = $1 AND year_month = $2',
      [userId, yearMonth]
    );
    
    return result.length > 0 ? result[0].run_count : 0;
  } catch (error) {
    console.error('[Storage Service] Error getting monthly run count:', error);
    return 0;
  }
}

export async function incrementMonthlyRunCount(userId: string): Promise<void> {
  try {
    await db.query('SELECT increment_run_count($1)', [userId]);
  } catch (error) {
    console.error('[Storage Service] Error incrementing run count:', error);
  }
}

export async function getMonthlyGenerationCount(userId: string): Promise<number> {
  try {
    const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const result = await db.query(
      'SELECT generation_count FROM ai_generations_monthly WHERE user_id = $1 AND year_month = $2',
      [userId, yearMonth]
    );
    
    return result.length > 0 ? result[0].generation_count : 0;
  } catch (error) {
    console.error('[Storage Service] Error getting monthly generation count:', error);
    return 0;
  }
}

export async function incrementMonthlyGenerationCount(userId: string): Promise<void> {
  try {
    await db.query('SELECT increment_generation_count($1)', [userId]);
  } catch (error) {
    console.error('[Storage Service] Error incrementing generation count:', error);
  }
}

// ========================
// MCP Command History
// ========================

export async function getMcpHistory(userId: string): Promise<McpCommandRecord[]> {
  try {
    const result = await db.query(
      'SELECT * FROM mcp_command_history WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [userId, MAX_MCP_HISTORY]
    );
    
    return result as McpCommandRecord[];
  } catch (error) {
    console.error(`[Storage Service] Error fetching MCP history:`, error);
    return [];
  }
}

export async function saveMcpCommand(record: Omit<McpCommandRecord, 'id' | 'user_id'>, userId: string): Promise<void> {
  try {
    await db.query(
      `INSERT INTO mcp_command_history (id, user_id, timestamp, command, response, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        crypto.randomUUID(),
        userId,
        record.timestamp,
        record.command,
        record.response,
        record.status
      ]
    );
  } catch (error) {
    console.error(`[Storage Service] Error saving MCP command:`, error);
    throw new Error('Could not save MCP command record.');
  }
}

// ========================
// Agent & User Profile
// ========================

export async function getAgentConfig(userId: string): Promise<AgentConfig> {
  const defaultConfig: AgentConfig = { enabledTools: ['listSavedWorkflows', 'getWorkflowDefinition', 'runWorkflow'] };

  try {
    const result = await db.query(
      'SELECT enabled_tools FROM agent_config WHERE user_id = $1',
      [userId]
    );
    
    if (result.length === 0) {
      return defaultConfig;
    }
    
    return { enabledTools: result[0].enabled_tools };
  } catch (error) {
    console.warn('[Storage Service] Could not read agent config, falling back to default.', error);
    return defaultConfig;
  }
}

export async function saveAgentConfig(config: AgentConfig, userId: string): Promise<void> {
  try {
    await db.query(
      `INSERT INTO agent_config (user_id, enabled_tools, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET enabled_tools = $2, updated_at = NOW()`,
      [userId, JSON.stringify(config.enabledTools)]
    );
  } catch (error) {
    console.error(`[Storage Service] Error saving agent config:`, error);
    throw new Error(`Could not save agent config: ${error}`);
  }
}

export async function getUserProfile(userId: string): Promise<{ subscription_tier: SubscriptionTier, trial_end_date: string | null } | null> {
  try {
    const result = await db.query(
      'SELECT subscription_tier, trial_end_date FROM user_profiles WHERE id = $1',
      [userId]
    );
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0] as { subscription_tier: SubscriptionTier, trial_end_date: string | null };
  } catch (error) {
    console.error(`[Storage Service] Error getting user profile for ${userId}:`, error);
    return null;
  }
}

export async function updateUserProfileTier(userId: string, newTier: 'Gold' | 'Diamond'): Promise<void> {
  try {
    await db.query(
      'UPDATE user_profiles SET subscription_tier = $1, trial_end_date = NULL WHERE id = $2',
      [newTier, userId]
    );
  } catch (error) {
    console.error(`[Storage Service] Error updating user profile tier for ${userId}:`, error);
    throw new Error('Could not update user profile.');
  }
}

// ========================
// Credential Management
// ========================

export async function getCredentialsForUser(userId: string): Promise<Omit<ManagedCredential, 'value'>[]> {
  try {
    const result = await db.query(
      'SELECT id, name, service, created_at FROM credentials WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return result;
  } catch (error) {
    console.error('[Storage Service] Error fetching credentials:', error);
    throw new Error('Could not fetch credentials.');
  }
}

export async function getCredentialValueByNameForUser(name: string, userId: string): Promise<string | null> {
  try {
    const result = await db.query(
      'SELECT value FROM credentials WHERE user_id = $1 AND name = $2',
      [userId, name]
    );
    
    if (result.length === 0) {
      return null;
    }
    
    return await decrypt(result[0].value);
  } catch (error) {
    console.error(`[Storage Service] Error fetching value for credential '${name}':`, error);
    return null;
  }
}

export async function saveCredential(credential: Omit<ManagedCredential, 'id'>, userId: string): Promise<void> {
  try {
    const encryptedValue = await encrypt(credential.value);
    
    await db.query(
      `INSERT INTO credentials (user_id, name, value, service, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, name)
       DO UPDATE SET value = $3, service = $4, created_at = $5`,
      [userId, credential.name, encryptedValue, credential.service, credential.created_at]
    );
  } catch (error) {
    console.error(`[Storage Service] Error saving credential '${credential.name}':`, error);
    throw new Error('Could not save credential. A credential with this name may already exist.');
  }
}

export async function deleteCredential(id: string, userId: string): Promise<void> {
  try {
    await db.query(
      'DELETE FROM credentials WHERE user_id = $1 AND id = $2',
      [userId, id]
    );
  } catch (error) {
    console.error(`[Storage Service] Error deleting credential ID '${id}':`, error);
    throw new Error('Could not delete credential.');
  }
}

// ========================
// API Key Management
// ========================

function hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export async function generateApiKey(userId: string): Promise<{ apiKey: string; id: string; prefix: string; }> {
  try {
    const prefix = 'kairo_sk_';
    const secretPart = crypto.randomBytes(24).toString('hex');
    const apiKey = `${prefix}${secretPart}`;
    const keyHash = hashApiKey(apiKey);

    const result = await db.query(
      'INSERT INTO user_api_keys (user_id, key_hash, prefix) VALUES ($1, $2, $3) RETURNING id',
      [userId, keyHash, prefix]
    );
    
    if (result.length === 0) {
      throw new Error('Could not generate API key.');
    }

    return { apiKey, id: result[0].id, prefix };
  } catch (error) {
    console.error('[Storage Service] Error saving new API key hash:', error);
    throw new Error('Could not generate API key.');
  }
}

export async function listApiKeysForUser(userId: string): Promise<DisplayUserApiKey[]> {
  try {
    const result = await db.query(
      'SELECT id, prefix, created_at, last_used_at FROM user_api_keys WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return result;
  } catch (error) {
    console.error('[Storage Service] Error listing API keys:', error);
    throw new Error('Could not list API keys.');
  }
}

export async function revokeApiKey(keyId: string, userId: string): Promise<void> {
  try {
    await db.query(
      'DELETE FROM user_api_keys WHERE id = $1 AND user_id = $2',
      [keyId, userId]
    );
  } catch (error) {
    console.error(`[Storage Service] Error revoking API key ID '${keyId}':`, error);
    throw new Error('Could not revoke API key.');
  }
}

export async function findUserByApiKey(apiKey: string): Promise<string | null> {
  if (!apiKey.startsWith('kairo_sk_')) {
    return null;
  }
  
  try {
    const keyHash = hashApiKey(apiKey);
    const result = await db.query('SELECT find_user_by_api_key($1)', [keyHash]);
    
    if (result.length === 0 || !result[0].find_user_by_api_key) {
      return null;
    }
    
    // Update the last_used_at timestamp
    await db.query(
      'UPDATE user_api_keys SET last_used_at = NOW() WHERE key_hash = $1',
      [keyHash]
    );

    return result[0].find_user_by_api_key;
  } catch (error) {
    console.error('[Storage Service] Error looking up user by API key:', error);
    return null;
  }
}