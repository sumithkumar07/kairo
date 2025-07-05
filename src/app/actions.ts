
'use server';

import {
  generateWorkflowFromPrompt as genkitGenerateWorkflowFromPrompt,
  type GenerateWorkflowFromPromptInput,
  type GenerateWorkflowFromPromptOutput
} from '@/ai/flows/generate-workflow-from-prompt';
import {
  enhanceUserPrompt as genkitEnhanceUserPrompt,
  type EnhanceUserPromptInput,
  type EnhanceUserPromptOutput
} from '@/ai/flows/enhance-user-prompt-flow';
import {
  suggestNextNode as genkitSuggestNextNode,
  type SuggestNextNodeInput,
  type SuggestNextNodeOutput
} from '@/ai/flows/suggest-next-node';
import {
  explainWorkflow as genkitExplainWorkflow,
  type ExplainWorkflowInput,
  type ExplainWorkflowOutput,
} from '@/ai/flows/explain-workflow-flow';
import {
  assistantChat as genkitAssistantChat,
  type AssistantChatInput,
  type AssistantChatOutput,
} from '@/ai/flows/assistant-chat-flow';
import {
  generateTestDataForNode as genkitGenerateTestData,
  type GenerateTestDataInput,
  type GenerateTestDataOutput
} from '@/ai/flows/generate-test-data-flow';
import {
  diagnoseWorkflowError as genkitDiagnoseWorkflowError,
  type DiagnoseWorkflowErrorInput,
  type DiagnoseWorkflowErrorOutput,
} from '@/ai/flows/diagnose-workflow-error-flow';

import type { Workflow, WorkflowRunRecord, ManagedCredential, SavedWorkflowMetadata, AgentConfig } from '@/types/workflow';
import { executeWorkflow } from '@/lib/workflow-engine';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import * as WorkflowStorage from '@/services/workflow-storage-service';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { FREE_TIER_FEATURES, GOLD_TIER_FEATURES, DIAMOND_TIER_FEATURES } from '@/types/subscription';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';


// ================================================================= //
// ========================= PUBLIC ACTIONS ======================== //
// ================================================================= //

async function getUserIdOrThrow(): Promise<string> {
    const cookieStore = cookies();
    const supabase = createServerActionClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated.');
    }
    return user.id;
}

async function getUserFeatures(userId: string): Promise<{ tier: SubscriptionTier, features: SubscriptionFeatures }> {
    const profile = await WorkflowStorage.getUserProfile(userId);
    let tier: SubscriptionTier = 'Free';
    let features: SubscriptionFeatures = FREE_TIER_FEATURES;

    if (profile) {
        if (profile.subscription_tier === 'Gold') {
            tier = 'Gold';
            features = GOLD_TIER_FEATURES;
        } else if (profile.subscription_tier === 'Diamond') {
            tier = 'Diamond';
            features = DIAMOND_TIER_FEATURES;
        } else if (profile.trial_end_date && new Date(profile.trial_end_date) > new Date()) {
            tier = 'Gold Trial';
            features = GOLD_TIER_FEATURES;
        }
    }
    return { tier, features };
}

export async function getUsageStatsAction(): Promise<{
  monthlyRunsUsed: number;
  monthlyRunsLimit: number | 'unlimited';
  monthlyGenerationsUsed: number;
  monthlyGenerationsLimit: number | 'unlimited';
  savedWorkflowsCount: number;
  savedWorkflowsLimit: number | 'unlimited';
  currentTier: SubscriptionTier;
}> {
    const userId = await getUserIdOrThrow();
    const { tier, features } = await getUserFeatures(userId);
    
    const [monthlyRuns, monthlyGenerations, savedWorkflows] = await Promise.all([
        WorkflowStorage.getMonthlyRunCount(userId),
        WorkflowStorage.getMonthlyGenerationCount(userId),
        WorkflowStorage.getWorkflowCountForUser(userId)
    ]);

    return {
        monthlyRunsUsed: monthlyRuns,
        monthlyRunsLimit: features.maxRunsPerMonth,
        monthlyGenerationsUsed: monthlyGenerations,
        monthlyGenerationsLimit: features.aiWorkflowGenerationsPerMonth,
        savedWorkflowsCount: savedWorkflows,
        savedWorkflowsLimit: features.maxWorkflows,
        currentTier: tier
    };
}


export async function rerunWorkflowAction(runId: string): Promise<WorkflowRunRecord> {
  const userId = await getUserIdOrThrow();
  const originalRun = await WorkflowStorage.getRunRecordById(runId);
  if (!originalRun) {
    throw new Error('Run record not found.');
  }
  if (!originalRun.workflowSnapshot) {
    throw new Error('Cannot re-run: The original workflow definition was not saved with this run.');
  }

  // Determine if the original run was live or simulated
  const isLiveMode = !!originalRun.initialData;

  // Re-execute the workflow with the original snapshot and trigger data
  const result = await executeWorkflow(
    originalRun.workflowSnapshot,
    !isLiveMode, // Run in simulation if original was simulation, live if original was live
    userId,
    originalRun.initialData
  );

  const hasErrors = Object.values(result.finalWorkflowData).some((nodeOutput: any) => nodeOutput.lastExecutionStatus === 'error');

  const newRunRecord: WorkflowRunRecord = {
    id: crypto.randomUUID(),
    workflowName: `${originalRun.workflowName} (Re-run)`,
    timestamp: new Date().toISOString(),
    status: hasErrors ? 'Failed' : 'Success',
    executionResult: result,
    initialData: originalRun.initialData,
    workflowSnapshot: originalRun.workflowSnapshot,
  };

  await WorkflowStorage.saveRunRecord(newRunRecord, userId);

  return newRunRecord;
}

export async function runWorkflowFromEditor(workflow: Workflow, isSimulationMode: boolean): Promise<WorkflowRunRecord> {
    const userId = await getUserIdOrThrow();
    
    // The check for run limits is now inside executeWorkflow.
    // We just need to handle the potential error here.
    try {
        const result = await executeWorkflow(workflow, isSimulationMode, userId);
        const hasErrors = Object.values(result.finalWorkflowData).some((nodeOutput: any) => nodeOutput.lastExecutionStatus === 'error');
        
        const newRunRecord: WorkflowRunRecord = {
            id: crypto.randomUUID(),
            workflowName: `Manual Run: ${new Date().toISOString()}`,
            timestamp: new Date().toISOString(),
            status: hasErrors ? 'Failed' : 'Success',
            executionResult: result,
            workflowSnapshot: workflow,
        };
        
        await WorkflowStorage.saveRunRecord(newRunRecord, userId);
        return newRunRecord;

    } catch(error: any) {
        // Rethrow the specific error from executeWorkflow so the client can display it.
        throw new Error(error.message);
    }
}

export async function getRunHistoryAction(): Promise<WorkflowRunRecord[]> {
  return WorkflowStorage.getRunHistory();
}


// All other public actions remain the same
export async function generateWorkflow(input: GenerateWorkflowFromPromptInput): Promise<GenerateWorkflowFromPromptOutput> {
  const userId = await getUserIdOrThrow();
  const { tier, features } = await getUserFeatures(userId);

  if (features.aiWorkflowGenerationsPerMonth !== 'unlimited') {
      const currentCount = await WorkflowStorage.getMonthlyGenerationCount(userId);
      if (currentCount >= features.aiWorkflowGenerationsPerMonth) {
          throw new Error(`You have reached your monthly limit of ${features.aiWorkflowGenerationsPerMonth} AI workflow generations for the ${tier} plan. Please upgrade to generate more.`);
      }
  }

  const result = await genkitGenerateWorkflowFromPrompt(input);
  await WorkflowStorage.incrementMonthlyGenerationCount(userId);

  return result;
}

export async function suggestNextWorkflowNode(clientInput: { workflowContext: string; currentNodeType?: string }): Promise<SuggestNextNodeOutput> {
  const inputForGenkit: SuggestNextNodeInput = { ...clientInput, availableNodeTypes: AVAILABLE_NODES_CONFIG.map(n => ({ type: n.type, name: n.name, description: n.description || '', category: n.category })) };
  return genkitSuggestNextNode(inputForGenkit);
}
export async function getWorkflowExplanation(workflowData: ExplainWorkflowInput): Promise<string> {
  const result = await genkitExplainWorkflow(workflowData);
  if (!result || !result.explanation) throw new Error("AI failed to provide an explanation.");
  return result.explanation;
}
export async function assistantChat(input: AssistantChatInput): Promise<AssistantChatOutput> {
  const result = await genkitAssistantChat(input);
  if (!result) throw new Error("AI assistant returned an empty response.");
  return result;
}

export async function enhanceAndGenerateWorkflow(input: { originalPrompt: string }): Promise<GenerateWorkflowFromPromptOutput> {
    const userId = await getUserIdOrThrow();
    const { tier, features } = await getUserFeatures(userId);

    if (features.aiWorkflowGenerationsPerMonth !== 'unlimited') {
        const currentCount = await WorkflowStorage.getMonthlyGenerationCount(userId);
        if (currentCount >= features.aiWorkflowGenerationsPerMonth) {
            throw new Error(`You have reached your monthly limit of ${features.aiWorkflowGenerationsPerMonth} AI workflow generations for the ${tier} plan. Please upgrade to generate more.`);
        }
    }

    const enhancementResult = await genkitEnhanceUserPrompt({ originalPrompt: input.originalPrompt });
    const promptForGeneration = enhancementResult?.enhancedPrompt || input.originalPrompt;

    const result = await generateWorkflow({ prompt: promptForGeneration });
    // The call to generateWorkflow already increments the count, so we don't need to do it again here.

    return result;
}

export async function generateTestDataForNode(input: GenerateTestDataInput): Promise<GenerateTestDataOutput> {
  return genkitGenerateTestData(input);
}

export async function diagnoseWorkflowError(input: DiagnoseWorkflowErrorInput): Promise<DiagnoseWorkflowErrorOutput> {
  return genkitDiagnoseWorkflowError(input);
}

export async function listWorkflowsAction(): Promise<SavedWorkflowMetadata[]> {
  const workflows = await WorkflowStorage.listAllWorkflows();
  return workflows;
}

export async function loadWorkflowAction(name: string): Promise<{ name: string; workflow: Workflow } | null> {
  const workflow = await WorkflowStorage.getWorkflowByName(name);
  return workflow ? { name, workflow } : null;
}

export async function saveWorkflowAction(name: string, workflow: Workflow): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getUserIdOrThrow();

    const isUpdate = await WorkflowStorage.getIsUserWorkflow(name, userId);

    if (!isUpdate) { // Only check limits when creating a NEW workflow
        const { tier, features } = await getUserFeatures(userId);
        
        if (features.maxWorkflows !== 'unlimited') {
            const currentCount = await WorkflowStorage.getWorkflowCountForUser(userId);
            if (currentCount >= features.maxWorkflows) {
                return { 
                    success: false, 
                    message: `You have reached your limit of ${features.maxWorkflows} saved workflows for the ${tier} plan. Please upgrade your plan to save more.` 
                };
            }
        }
    }

    await WorkflowStorage.saveWorkflow(name, workflow);
    return { success: true, message: `Workflow "${name}" ${isUpdate ? 'updated' : 'saved'}.` };

  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function deleteWorkflowAction(name: string): Promise<{ success: boolean; message: string }> {
    try {
        await WorkflowStorage.deleteWorkflowByName(name);
        return { success: true, message: `Workflow "${name}" deleted.` };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

// Credential Management Actions
export async function listCredentialsAction(): Promise<Omit<ManagedCredential, 'value'>[]> {
    return WorkflowStorage.getCredentialsForUser();
}

export async function saveCredentialAction(name: string, value: string, service?: string): Promise<{ success: boolean; message: string; }> {
    try {
        const userId = await getUserIdOrThrow();
        await WorkflowStorage.saveCredential({ name, value, service, user_id: userId, created_at: new Date().toISOString() });
        return { success: true, message: 'Credential saved successfully.' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function deleteCredentialAction(id: string): Promise<{ success: boolean; message: string; }> {
    try {
        await WorkflowStorage.deleteCredential(id);
        return { success: true, message: 'Credential deleted.' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function getAgentConfigAction(): Promise<AgentConfig> {
  return WorkflowStorage.getAgentConfig();
}
