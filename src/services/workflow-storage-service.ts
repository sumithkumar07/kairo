
'use server';
/**
 * @fileOverview A server-side service for storing and retrieving user workflows and run history from a Supabase database.
 */
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Workflow, ExampleWorkflow, WorkflowRunRecord, McpCommandRecord, AgentConfig, SavedWorkflowMetadata, ManagedCredential, SubscriptionTier } from '@/types/workflow';
import { EXAMPLE_WORKFLOWS } from '@/config/example-workflows';
import { encrypt, decrypt } from './encryption-service';

const MAX_RUN_HISTORY = 100; // Max number of run records to keep
const MAX_MCP_HISTORY = 50; // Max number of MCP command records to keep

async function getSupabaseClient() {
    const cookieStore = cookies();
    return createServerActionClient({ cookies: () => cookieStore });
}

async function getUserId() {
    const supabase = await getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated.');
    }
    return user.id;
}

async function getUserIdOrNull() {
    try {
        const supabase = await getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id || null;
    } catch {
        return null;
    }
}


// ========================
// Workflow Management
// ========================

export async function listAllWorkflows(): Promise<SavedWorkflowMetadata[]> {
  const supabase = await getSupabaseClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  const exampleWorkflows: SavedWorkflowMetadata[] = EXAMPLE_WORKFLOWS.map(wf => ({
    name: wf.name,
    description: wf.description,
    type: 'example' as const
  }));
  
  if (!userId) {
      return exampleWorkflows;
  }
  
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

export async function getWorkflowByName(name: string): Promise<Workflow | null> {
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

  const supabase = await getSupabaseClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return null; // Can't fetch user workflows if not logged in

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

export async function saveWorkflow(name: string, workflow: Workflow): Promise<void> {
  const supabase = await getSupabaseClient();
  const userId = await getUserId();
  if (!name.trim()) {
    throw new Error('Workflow name cannot be empty.');
  }
  
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

export async function deleteWorkflowByName(name: string): Promise<void> {
  const supabase = await getSupabaseClient();
  const userId = await getUserId();
  
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
  const supabase = await getSupabaseClient();
  // Note: This RPC searches across all users' workflows. A securityToken in the webhook node is recommended.
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


// ========================
// Run History Management
// ========================

export async function getRunHistory(): Promise<WorkflowRunRecord[]> {
  const supabase = await getSupabaseClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return [];
  
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

export async function getRunRecordById(id: string): Promise<WorkflowRunRecord | null> {
  const supabase = await getSupabaseClient();
  const userId = await getUserId();

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

export async function saveRunRecord(record: WorkflowRunRecord, recordUserId?: string): Promise<void> {
    const supabase = await getSupabaseClient();
    const userId = recordUserId || (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
        console.warn("[Storage Service] No user ID provided or found in session. Run record not saved.");
        return;
    }

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

export async function clearRunHistory(): Promise<void> {
  const supabase = await getSupabaseClient();
  const userId = await getUserId();
  
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

export async function getMcpHistory(): Promise<McpCommandRecord[]> {
  const supabase = await getSupabaseClient();
  const userId = await getUserIdOrNull();
  if (!userId) return [];

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

export async function saveMcpCommand(record: Omit<McpCommandRecord, 'id'>): Promise<void> {
    const supabase = await getSupabaseClient();
    const userId = await getUserIdOrNull();
    if (!userId) {
        console.warn("[Storage Service] Anonymous user tried to save an MCP command. Record not saved.");
        return;
    }
    
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

export async function getAgentConfig(): Promise<AgentConfig> {
    const supabase = await getSupabaseClient();
    const userId = await getUserIdOrNull();
    const defaultConfig: AgentConfig = { enabledTools: ['listSavedWorkflows', 'getWorkflowDefinition', 'runWorkflow'] };

    if (!userId) {
        return defaultConfig;
    }
    
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

export async function saveAgentConfig(config: AgentConfig): Promise<void> {
    const supabase = await getSupabaseClient();
    const userId = await getUserId();
    
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

export async function getCredentialsForUser(): Promise<Omit<ManagedCredential, 'value'>[]> {
    const supabase = await getSupabaseClient();
    const userId = await getUserId();

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

export async function saveCredential(credential: Omit<ManagedCredential, 'id'>): Promise<void> {
    const supabase = await getSupabaseClient();
    
    const encryptedValue = await encrypt(credential.value);

    const { error } = await supabase.from('credentials').upsert(
        { 
            user_id: credential.user_id,
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

export async function deleteCredential(id: string): Promise<void> {
    const supabase = await getSupabaseClient();
    const userId = await getUserId();
    
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
