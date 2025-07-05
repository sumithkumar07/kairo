
'use server';
/**
 * @fileOverview A server-side service for storing and retrieving user workflows and run history from a Supabase database.
 */
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Workflow, ExampleWorkflow, WorkflowRunRecord, McpCommandRecord, AgentConfig, SavedWorkflowMetadata, ManagedCredential, SubscriptionTier } from '@/types/workflow';
import { EXAMPLE_WORKFLOWS } from '@/config/example-workflows';
import { encrypt, decrypt } from './encryption-service';
import crypto from 'crypto';


const MAX_RUN_HISTORY = 100; // Max number of run records to keep
const MAX_MCP_HISTORY = 50; // Max number of MCP command records to keep

async function getSupabaseClient() {
    const cookieStore = cookies();
    return createServerActionClient({ cookies: () => cookieStore });
}

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
  
  const supabase = await getSupabaseClient();
  const { data: userWorkflows, error } = await supabase
    .from('workflows')
    .select('name, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
    
  if (error) {
    console.error('[Storage Service] Error listing workflows:', error);
    throw new Error('Could not list saved workflows.');
  }

  const savedUserWorkflows: SavedWorkflowMetadata[] = userWorkflows.map(wf => ({
    name: wf.name,
    description: `Last saved on ${new Date(wf.updated_at).toLocaleDateString()}`,
    type: 'user' as const,
    updated_at: wf.updated_at
  }));

  return [...exampleWorkflows, ...savedUserWorkflows];
}

export async function getIsUserWorkflow(name: string, userId: string): Promise<boolean> {
  const supabase = await getSupabaseClient();
  const { count, error } = await supabase
    .from('workflows')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('name', name);
  
  if (error) {
      console.error('[Storage Service] Error checking user workflow existence:', error);
      return false;
  }
  
  return (count ?? 0) > 0;
}


export async function getWorkflowCountForUser(userId: string): Promise<number> {
    const supabase = await getSupabaseClient();
    const { count, error } = await supabase
        .from('workflows')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (error) {
        console.error('[Storage Service] Error counting workflows:', error);
        return 0; // Fail safe
    }
    return count ?? 0;
}

export async function getWorkflowByName(name: string, userId?: string | null): Promise<Workflow | null> {
  const exampleWorkflow = EXAMPLE_WORKFLOWS.find(wf => wf.name === name);
  if (exampleWorkflow) {
    return exampleWorkflow.workflow;
  }

  if (!userId) return null; // Can't fetch user workflows if not logged in

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('workflows')
    .select('workflow_data')
    .eq('name', name)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') { // Ignore 'No rows found' error for this check
        console.error(`[Storage Service] Error getting workflow '${name}':`, error);
    }
    return null;
  }

  return data.workflow_data as Workflow;
}

export async function saveWorkflow(name: string, workflow: Workflow, userId: string): Promise<void> {
  if (!name.trim()) {
    throw new Error('Workflow name cannot be empty.');
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from('workflows')
    .upsert({
      user_id: userId,
      name: name,
      workflow_data: workflow as any, // Supabase expects JSONB, so `any` is okay here
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, name' });

  if (error) {
    console.error(`[Storage Service] Error saving workflow '${name}':`, error);
    throw new Error(`Could not save workflow: ${error.message}`);
  }
}

export async function deleteWorkflowByName(name: string, userId: string): Promise<void> {
  const supabase = await getSupabaseClient();
  
  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('user_id', userId)
    .eq('name', name);
    
  if (error) {
    console.error(`[Storage Service] Error deleting workflow '${name}':`, error);
    throw new Error(`Could not delete workflow: ${error.message}`);
  }
}

export async function findWorkflowByWebhookPath(pathSuffix: string): Promise<{ workflow: Workflow; userId: string; } | null> {
  // This RPC needs to be secure as it searches across all users' workflows.
  // The 'SECURITY DEFINER' in the function definition and RLS on the table help.
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
      .rpc('find_workflow_by_webhook_path', { path_suffix_to_find: pathSuffix })
      .single();

  if (error) {
      if (error.code !== 'PGRST116') { // Don't log "No rows found" as an error
        console.error('[Storage Service] Error in RPC find_workflow_by_webhook_path:', error);
      }
      return null;
  }

  return data ? { workflow: data.workflow_data_result, userId: data.user_id_result } : null;
}

export async function getAllScheduledWorkflows(): Promise<{ user_id: string; name: string; workflow_data: Workflow; }[]> {
  const supabase = await getSupabaseClient();
  
  const { data, error } = await supabase
    .from('workflows')
    .select('user_id, name, workflow_data');
    
  if (error) {
    console.error('[Storage Service] Error fetching all workflows for scheduler:', error);
    throw new Error('Could not fetch workflows for scheduling.');
  }

  const scheduledWorkflows = data.filter(wf => 
    wf.workflow_data && 
    Array.isArray(wf.workflow_data.nodes) && 
    wf.workflow_data.nodes.some((node: any) => node.type === 'schedule')
  );

  return scheduledWorkflows as { user_id: string; name: string; workflow_data: Workflow; }[];
}


// ========================
// Run History Management
// ========================

export async function getRunHistory(userId: string): Promise<WorkflowRunRecord[]> {
  const supabase = await getSupabaseClient();
  
  const { data, error } = await supabase
    .from('run_history')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(MAX_RUN_HISTORY);
    
  if (error) {
    console.error(`[Storage Service] Error fetching run history:`, error);
    return [];
  }
  
  return data.map(r => ({
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
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from('run_history')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error(`[Storage Service] Error fetching run record by ID ${id}:`, error);
    }
    return null;
  }
  
  return {
    id: data.id,
    workflowName: data.workflow_name,
    timestamp: data.timestamp,
    status: data.status as 'Success' | 'Failed',
    executionResult: data.execution_result,
    initialData: data.initial_data,
    workflowSnapshot: data.workflow_snapshot
  };
}

export async function saveRunRecord(record: WorkflowRunRecord, userId: string): Promise<void> {
    const supabase = await getSupabaseClient();

    const { error } = await supabase.from('run_history').insert({
        id: record.id,
        user_id: userId,
        workflow_name: record.workflowName,
        timestamp: record.timestamp,
        status: record.status,
        execution_result: record.executionResult as any,
        initial_data: record.initialData as any,
        workflow_snapshot: record.workflowSnapshot as any
    });

    if (error) {
        console.error(`[Storage Service] Error saving run record:`, error);
        throw new Error('Could not save run record.');
    }
}

export async function clearRunHistory(userId: string): Promise<void> {
  const supabase = await getSupabaseClient();
  
  const { error } = await supabase
    .from('run_history')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error(`[Storage Service] Error clearing run history:`, error);
    throw new Error('Could not clear run history.');
  }
}

export async function getMonthlyRunCount(userId: string): Promise<number> {
    const supabase = await getSupabaseClient();
    const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    const { data, error } = await supabase
        .from('workflow_runs_monthly')
        .select('run_count')
        .eq('user_id', userId)
        .eq('year_month', yearMonth)
        .single();
        
    if (error) {
        if (error.code === 'PGRST116') return 0; // No record found for this month, which is fine.
        console.error('[Storage Service] Error getting monthly run count:', error);
        return 0; // Fail safe
    }

    return data.run_count;
}

export async function incrementMonthlyRunCount(userId: string): Promise<void> {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.rpc('increment_run_count', { p_user_id: userId });

    if (error) {
        console.error('[Storage Service] Error incrementing run count:', error);
    }
}

export async function getMonthlyGenerationCount(userId: string): Promise<number> {
    const supabase = await getSupabaseClient();
    const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    const { data, error } = await supabase
        .from('ai_generations_monthly')
        .select('generation_count')
        .eq('user_id', userId)
        .eq('year_month', yearMonth)
        .single();
        
    if (error) {
        if (error.code === 'PGRST116') return 0; // No record found for this month, which is fine.
        console.error('[Storage Service] Error getting monthly generation count:', error);
        return 0; // Fail safe
    }

    return data.generation_count;
}

export async function incrementMonthlyGenerationCount(userId: string): Promise<void> {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.rpc('increment_generation_count', { p_user_id: userId });

    if (error) {
        console.error('[Storage Service] Error incrementing generation count:', error);
    }
}



// ========================
// MCP Command History
// ========================

export async function getMcpHistory(userId: string): Promise<McpCommandRecord[]> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from('mcp_command_history')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(MAX_MCP_HISTORY);
    
  if (error) {
    console.error(`[Storage Service] Error fetching MCP history:`, error);
    return [];
  }

  return data as McpCommandRecord[];
}

export async function saveMcpCommand(record: Omit<McpCommandRecord, 'id' | 'user_id'>, userId: string): Promise<void> {
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase.from('mcp_command_history').insert({
        ...record,
        id: crypto.randomUUID(),
        user_id: userId,
    });
    if (error) {
        console.error(`[Storage Service] Error saving MCP command:`, error);
        throw new Error('Could not save MCP command record.');
    }
}

// ========================
// Agent & User Profile
// ========================

export async function getAgentConfig(userId: string): Promise<AgentConfig> {
    const supabase = await getSupabaseClient();
    const defaultConfig: AgentConfig = { enabledTools: ['listSavedWorkflows', 'getWorkflowDefinition', 'runWorkflow'] };

    const { data, error } = await supabase
        .from('agent_config')
        .select('enabled_tools')
        .eq('user_id', userId)
        .single();
    
    if (error || !data) {
        if (error && error.code !== 'PGRST116') {
             console.warn('[Storage Service] Could not read agent config, falling back to default.', error);
        }
        return defaultConfig;
    }
    
    return { enabledTools: data.enabled_tools };
}

export async function saveAgentConfig(config: AgentConfig, userId: string): Promise<void> {
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
        .from('agent_config')
        .upsert({
            user_id: userId,
            enabled_tools: config.enabledTools,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

    if (error) {
        console.error(`[Storage Service] Error saving agent config:`, error);
        throw new Error(`Could not save agent config: ${error.message}`);
    }
}

export async function getUserProfile(userId: string): Promise<{ subscription_tier: SubscriptionTier, trial_end_date: string | null } | null> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_tier, trial_end_date')
        .eq('id', userId)
        .single();
        
    if (error) {
        if (error.code !== 'PGRST116') {
            console.error(`[Storage Service] Error getting user profile for ${userId}:`, error);
        }
        return null;
    }
    
    return data as { subscription_tier: SubscriptionTier, trial_end_date: string | null };
}

export async function updateUserProfileTier(userId: string, newTier: 'Gold' | 'Diamond'): Promise<void> {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
        .from('user_profiles')
        .update({ subscription_tier: newTier, trial_end_date: null })
        .eq('id', userId);

    if (error) {
        console.error(`[Storage Service] Error updating user profile tier for ${userId}:`, error);
        throw new Error('Could not update user profile.');
    }
}


// ========================
// Credential Management
// ========================

export async function getCredentialsForUser(userId: string): Promise<Omit<ManagedCredential, 'value'>[]> {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
        .from('credentials')
        .select('id, name, service, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[Storage Service] Error fetching credentials:', error);
        throw new Error('Could not fetch credentials.');
    }
    return data;
}

export async function getCredentialValueByNameForUser(name: string, userId: string): Promise<string | null> {
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
        .from('credentials')
        .select('value')
        .eq('user_id', userId)
        .eq('name', name)
        .single();
    
    if (error || !data) {
        if (error && error.code !== 'PGRST116') {
            console.error(`[Storage Service] Error fetching value for credential '${name}':`, error);
        }
        return null;
    }
    
    try {
      return await decrypt(data.value);
    } catch (e: any) {
      console.error(`[Storage Service] Failed to decrypt credential '${name}' for user '${userId}'. Error: ${e.message}`);
      return null; // Return null on decryption failure to prevent exposing encrypted data.
    }
}

export async function saveCredential(credential: Omit<ManagedCredential, 'id'>, userId: string): Promise<void> {
    const supabase = await getSupabaseClient();
    
    const encryptedValue = await encrypt(credential.value);

    const { error } = await supabase.from('credentials').upsert(
        { 
            user_id: userId,
            name: credential.name,
            value: encryptedValue, // Store the encrypted value
            service: credential.service,
            created_at: credential.created_at
        },
        { onConflict: 'user_id, name' }
    );
    
    if (error) {
        console.error(`[Storage Service] Error saving credential '${credential.name}':`, error);
        throw new Error('Could not save credential. A credential with this name may already exist.');
    }
}

export async function deleteCredential(id: string, userId: string): Promise<void> {
    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('user_id', userId)
        .eq('id', id);
        
    if (error) {
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

export async function generateApiKey(userId: string): Promise<string> {
    const supabase = await getSupabaseClient();
    const prefix = 'kairo_sk_';
    const secretPart = crypto.randomBytes(24).toString('hex');
    const apiKey = `${prefix}${secretPart}`;
    const keyHash = hashApiKey(apiKey);

    const { error } = await supabase.from('user_api_keys').insert({
        user_id: userId,
        key_hash: keyHash,
        prefix: prefix,
    });
    
    if (error) {
        console.error('[Storage Service] Error saving new API key hash:', error);
        throw new Error('Could not generate API key.');
    }

    // Return the full, unhashed key to the user ONCE.
    return apiKey;
}

export async function findUserByApiKey(apiKey: string): Promise<string | null> {
    if (!apiKey.startsWith('kairo_sk_')) {
        return null;
    }
    const supabase = await getSupabaseClient();
    const keyHash = hashApiKey(apiKey);
    
    const { data, error } = await supabase.rpc('find_user_by_api_key', { p_key_hash: keyHash });

    if (error || !data) {
        if (error && error.code !== 'PGRST116') {
             console.error('[Storage Service] Error looking up user by API key:', error);
        }
        return null;
    }
    
    // Also update the last_used_at timestamp, fire-and-forget
    supabase.from('user_api_keys').update({ last_used_at: new Date().toISOString() }).eq('key_hash', keyHash).then();

    return data;
}
