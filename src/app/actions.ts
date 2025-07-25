'use server';

import {
  generateWorkflowFromPrompt,
  type GenerateWorkflowFromPromptInput,
  type GenerateWorkflowFromPromptOutput
} from '@/ai/flows/generate-workflow-from-prompt';
import {
  enhanceUserPrompt,
  type EnhanceUserPromptInput,
} from '@/ai/flows/enhance-user-prompt-flow';
import {
  suggestNextNode,
  type SuggestNextNodeInput,
  type SuggestNextNodeOutput
} from '@/ai/flows/suggest-next-node';
import {
  explainWorkflow,
  type ExplainWorkflowInput,
  type ExplainWorkflowOutput,
} from '@/ai/flows/explain-workflow-flow';
import {
  assistantChat as flowAssistantChat,
  type AssistantChatInput,
  type AssistantChatOutput,
} from '@/ai/flows/assistant-chat-flow';
import {
  generateTestDataForNode as flowGenerateTestData,
  type GenerateTestDataInput,
  type GenerateTestDataOutput
} from '@/ai/flows/generate-test-data-flow';
import {
  diagnoseWorkflowError as flowDiagnoseWorkflowError,
  type DiagnoseWorkflowErrorInput,
  type DiagnoseWorkflowErrorOutput,
} from '@/ai/flows/diagnose-workflow-error-flow';
import {
  generateWorkflowIdeas,
  type GenerateWorkflowIdeasInput,
  type GenerateWorkflowIdeasOutput,
} from '@/ai/flows/generate-workflow-ideas';
import {
  textToSpeech,
  type TextToSpeechInput,
  type TextToSpeechOutput,
} from '@/ai/flows/text-to-speech-flow';
import {
  generateImage
} from '@/ai/flows/generate-image-flow';


import type { Workflow, WorkflowRunRecord, ManagedCredential, SavedWorkflowMetadata, AgentConfig, ExampleWorkflow, DisplayUserApiKey, McpCommandRecord } from '@/types/workflow';
import { executeWorkflow } from '@/lib/workflow-engine';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import * as WorkflowStorage from '@/services/database-service';
import { getCurrentUser } from '@/lib/auth';
import { FREE_TIER_FEATURES, GOLD_TIER_FEATURES, DIAMOND_TIER_FEATURES } from '@/types/subscription';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';


// ================================================================= //
// ========================= PUBLIC ACTIONS ======================== //
// ================================================================= //

async function getUserIdOrThrow(): Promise<string> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('User not authenticated.');
    }
    return currentUser.id;
}

async function getUserIdOrNull(): Promise<string | null> {
    const currentUser = await getCurrentUser();
    return currentUser?.id || null;
}

async function getUserFeatures(userId: string): Promise<{ tier: SubscriptionTier, features: SubscriptionFeatures }> {
    const profile = await WorkflowStorage.getUserProfile(userId);
    let tier: SubscriptionTier = 'Free';
    let features: SubscriptionFeatures = FREE_TIER_FEATURES;

    if (profile) {
        if (profile.subscription_tier === 'Diamond') {
            tier = 'Diamond';
            features = DIAMOND_TIER_FEATURES;
        } else if (profile.subscription_tier === 'Gold') {
            tier = 'Gold';
            features = GOLD_TIER_FEATURES;
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
    try {
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
    } catch (error) {
        console.warn(`[getUsageStatsAction] Could not get user, returning default stats. Error: ${(error as Error).message}`);
        return {
            monthlyRunsUsed: 0,
            monthlyRunsLimit: FREE_TIER_FEATURES.maxRunsPerMonth,
            monthlyGenerationsUsed: 0,
            monthlyGenerationsLimit: FREE_TIER_FEATURES.aiWorkflowGenerationsPerMonth,
            savedWorkflowsCount: 0,
            savedWorkflowsLimit: FREE_TIER_FEATURES.maxWorkflows,
            currentTier: 'Free',
        }
    }
}


export async function rerunWorkflowAction(runId: string): Promise<WorkflowRunRecord> {
  const userId = await getUserIdOrThrow();
  const originalRun = await WorkflowStorage.getRunRecordById(runId, userId);
  if (!originalRun) {
    throw new Error('Run record not found.');
  }
  if (!originalRun.workflowSnapshot) {
    throw new Error('Cannot re-run: The original workflow definition was not saved with this run.');
  }

  const isLiveMode = !!originalRun.initialData;

  try {
    const result = await executeWorkflow(
      originalRun.workflowSnapshot,
      !isLiveMode,
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

  } catch(error: any) {
    console.error(`[rerunWorkflowAction] Error re-running workflow ${runId}: ${error.message}`);
    throw new Error(error.message);
  }
}

export async function runWorkflowFromEditor(workflow: Workflow, workflowName: string, isSimulationMode: boolean): Promise<WorkflowRunRecord> {
    const userId = await getUserIdOrThrow();
    
    try {
        const result = await executeWorkflow(workflow, isSimulationMode, userId);
        const hasErrors = Object.values(result.finalWorkflowData).some((nodeOutput: any) => nodeOutput.lastExecutionStatus === 'error');
        
        const runName = workflowName && workflowName !== 'Untitled Workflow' 
            ? workflowName 
            : `Manual Run: ${new Date().toISOString()}`;

        const newRunRecord: WorkflowRunRecord = {
            id: crypto.randomUUID(),
            workflowName: runName,
            timestamp: new Date().toISOString(),
            status: hasErrors ? 'Failed' : 'Success',
            executionResult: result,
            workflowSnapshot: workflow,
        };
        
        await WorkflowStorage.saveRunRecord(newRunRecord, userId);
        return newRunRecord;

    } catch(error: any) {
        throw new Error(error.message);
    }
}

export async function getRunHistoryAction(): Promise<WorkflowRunRecord[]> {
  const userId = await getUserIdOrNull();
  if (!userId) return []; // Return empty array if no user, instead of throwing
  return WorkflowStorage.getRunHistory(userId);
}

export async function generateWorkflow(input: GenerateWorkflowFromPromptInput, userIdOverride?: string): Promise<GenerateWorkflowFromPromptOutput> {
  try {
    const userId = userIdOverride || await getUserIdOrThrow();
    const { tier, features } = await getUserFeatures(userId);

    if (features.aiWorkflowGenerationsPerMonth !== 'unlimited') {
        const currentCount = await WorkflowStorage.getMonthlyGenerationCount(userId);
        if (currentCount >= features.aiWorkflowGenerationsPerMonth) {
            throw new Error(`You have reached your monthly limit of ${features.aiWorkflowGenerationsPerMonth} AI workflow generations for the ${tier} plan. Please upgrade to generate more.`);
        }
    }

    const result = await generateWorkflowFromPrompt(input);
    await WorkflowStorage.incrementMonthlyGenerationCount(userId);
    return result;
  } catch (e: any) {
    console.error(`[generateWorkflow] Error: ${e.message}`);
    throw new Error(`Failed to generate workflow: ${e.message}`);
  }
}

export async function suggestNextWorkflowNode(clientInput: { workflowContext: string; leafNodes?: { id: string, name: string, type: string, description?: string }[] }): Promise<SuggestNextNodeOutput> {
  try {
    const inputForFlow: SuggestNextNodeInput = { 
      ...clientInput, 
      availableNodeTypes: AVAILABLE_NODES_CONFIG.map(n => ({ type: n.type, name: n.name, description: n.description || '', category: n.category })) 
    };
    return await suggestNextNode(inputForFlow);
  } catch (e: any) {
    console.error(`[suggestNextWorkflowNode] Error: ${e.message}`);
    throw new Error(`Failed to suggest next node: ${e.message}`);
  }
}
export async function getWorkflowExplanation(workflowData: ExplainWorkflowInput): Promise<string> {
  try {
    const userId = await getUserIdOrThrow();
    const { features } = await getUserFeatures(userId);
    if (!features.canExplainWorkflow) {
      throw new Error('AI Workflow Explanation is a premium feature. Please upgrade your plan.');
    }
    const result = await explainWorkflow(workflowData);
    if (!result || !result.explanation) throw new Error("AI failed to provide an explanation.");
    return result.explanation;
  } catch (e: any) {
    console.error(`[getWorkflowExplanation] Error: ${e.message}`);
    throw new Error(`Failed to get workflow explanation: ${e.message}`);
  }
}
export async function assistantChat(input: AssistantChatInput): Promise<AssistantChatOutput> {
    try {
        const userId = input.userId || await getUserIdOrNull();
        if (userId) {
            input.userId = userId;
        }

        const result = await flowAssistantChat(input);
        if (!result) throw new Error("AI assistant returned an empty response.");
        return result;
    } catch (e: any) {
        console.error(`[assistantChat] Error: ${e.message}`);
        throw new Error(`Failed to get response from AI assistant: ${e.message}`);
    }
}

export async function enhanceAndGenerateWorkflow(input: { originalPrompt: string }): Promise<GenerateWorkflowFromPromptOutput> {
    try {
        const userId = await getUserIdOrThrow();
        const { tier, features } = await getUserFeatures(userId);

        if (features.aiWorkflowGenerationsPerMonth !== 'unlimited') {
            const currentCount = await WorkflowStorage.getMonthlyGenerationCount(userId);
            if (currentCount >= features.aiWorkflowGenerationsPerMonth) {
                throw new Error(`You have reached your monthly limit of ${features.aiWorkflowGenerationsPerMonth} AI workflow generations for the ${tier} plan. Please upgrade to generate more.`);
            }
        }

        const enhancementResult = await enhanceUserPrompt({ originalPrompt: input.originalPrompt });
        const promptForGeneration = enhancementResult?.enhancedPrompt || input.originalPrompt;

        const result = await generateWorkflow({ prompt: promptForGeneration }, userId);
        return result;
    } catch (e: any) {
        console.error(`[enhanceAndGenerateWorkflow] Error: ${e.message}`);
        throw new Error(`Failed to enhance and generate workflow: ${e.message}`);
    }
}

export async function generateTestDataForNode(input: GenerateTestDataInput): Promise<GenerateTestDataOutput> {
  try {
    const userId = await getUserIdOrThrow();
    const { features } = await getUserFeatures(userId);
    if (!features.aiTestDataGeneration) {
      throw new Error('AI Test Data Generation is a premium feature. Please upgrade your plan.');
    }
    return await flowGenerateTestData(input);
  } catch (e: any) {
    console.error(`[generateTestDataForNode] Error: ${e.message}`);
    throw new Error(`Failed to generate test data: ${e.message}`);
  }
}

export async function diagnoseWorkflowError(input: DiagnoseWorkflowErrorInput): Promise<DiagnoseWorkflowErrorOutput> {
  try {
    const userId = await getUserIdOrThrow();
    const { features } = await getUserFeatures(userId);
    if (!features.aiErrorDiagnosis) {
      throw new Error('AI Error Diagnosis is a premium feature. Please upgrade your plan.');
    }
    return await flowDiagnoseWorkflowError(input);
  } catch (e: any) {
    console.error(`[diagnoseWorkflowError] Error: ${e.message}`);
    throw new Error(`Failed to diagnose workflow error: ${e.message}`);
  }
}

export async function listWorkflowsAction(): Promise<SavedWorkflowMetadata[]> {
  const userId = await getUserIdOrNull();
  return WorkflowStorage.listAllWorkflows(userId);
}

export async function getCommunityWorkflowsAction(): Promise<ExampleWorkflow[]> {
  return WorkflowStorage.getCommunityWorkflows();
}

export async function generateWorkflowIdeasAction(input: GenerateWorkflowIdeasInput): Promise<GenerateWorkflowIdeasOutput> {
    try {
        const userId = await getUserIdOrThrow();
        const { tier, features } = await getUserFeatures(userId);

        if (features.aiWorkflowGenerationsPerMonth !== 'unlimited') {
            const currentCount = await WorkflowStorage.getMonthlyGenerationCount(userId);
            if (currentCount >= features.aiWorkflowGenerationsPerMonth) {
                throw new Error(`You have reached your monthly limit of ${features.aiWorkflowGenerationsPerMonth} AI workflow generations for the ${tier} plan. Please upgrade to generate more.`);
            }
        }
        const result = await generateWorkflowIdeas(input);
        await WorkflowStorage.incrementMonthlyGenerationCount(userId);
        return result;
    } catch (e: any) {
        console.error(`[generateWorkflowIdeasAction] Error: ${e.message}`);
        throw new Error(`Failed to generate workflow ideas: ${e.message}`);
    }
}


export async function loadWorkflowAction(name: string): Promise<{ name: string; workflow: Workflow } | null> {
  const userId = await getUserIdOrNull();
  const workflow = await WorkflowStorage.getWorkflowByName(name, userId);
  return workflow ? { name, workflow } : null;
}

export async function saveWorkflowAction(name: string, workflow: Workflow): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getUserIdOrThrow();

    const isUpdate = await WorkflowStorage.getIsUserWorkflow(name, userId);

    if (!isUpdate) {
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

    await WorkflowStorage.saveWorkflow(name, workflow, userId);
    return { success: true, message: `Workflow "${name}" ${isUpdate ? 'updated' : 'saved'}.` };

  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function deleteWorkflowAction(name: string): Promise<{ success: boolean; message: string }> {
    try {
        const userId = await getUserIdOrThrow();
        await WorkflowStorage.deleteWorkflowByName(name, userId);
        return { success: true, message: `Workflow "${name}" deleted.` };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function textToSpeechAction(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
    try {
        const userId = await getUserIdOrThrow();
        // In a real app, you might check for premium features here.
        // For now, we'll allow it for all users.
        return await textToSpeech(input);
    } catch (e: any) {
        console.error(`[textToSpeechAction] Error: ${e.message}`);
        throw new Error(`Failed to convert text to speech: ${e.message}`);
    }
}

export async function generateImageAction(prompt: string) {
    try {
        const userId = await getUserIdOrThrow();
        const { features } = await getUserFeatures(userId);
        if (!features.accessToAdvancedNodes) { // Gating image generation as an "advanced" feature
            throw new Error('AI Image Generation is a premium feature. Please upgrade your plan.');
        }
        return await generateImage({ prompt });
    } catch (e: any) {
        console.error(`[generateImageAction] Error: ${e.message}`);
        throw new Error(`Failed to generate image: ${e.message}`);
    }
}


// Credential Management Actions
export async function listCredentialsAction(): Promise<Omit<ManagedCredential, 'value'>[]> {
    const userId = await getUserIdOrThrow();
    return WorkflowStorage.getCredentialsForUser(userId);
}

export async function saveCredentialAction(name: string, value: string, service?: string): Promise<{ success: boolean; message: string; }> {
    try {
        const userId = await getUserIdOrThrow();
        await WorkflowStorage.saveCredential({ name, value, service, user_id: userId, created_at: new Date().toISOString() }, userId);
        return { success: true, message: 'Credential saved successfully.' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function deleteCredentialAction(id: string): Promise<{ success: boolean; message: string; }> {
    try {
        const userId = await getUserIdOrThrow();
        await WorkflowStorage.deleteCredential(id, userId);
        return { success: true, message: 'Credential deleted.' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function getAgentConfigAction(): Promise<AgentConfig> {
  const userId = await getUserIdOrThrow();
  return WorkflowStorage.getAgentConfig(userId);
}

export async function saveAgentConfigAction(config: AgentConfig): Promise<void> {
    const userId = await getUserIdOrThrow();
    return WorkflowStorage.saveAgentConfig(config, userId);
}

export async function generateApiKeyAction(): Promise<{ apiKey: string; id: string; prefix: string; }> {
    const userId = await getUserIdOrThrow();
    return WorkflowStorage.generateApiKey(userId);
}

export async function listApiKeysAction(): Promise<DisplayUserApiKey[]> {
    const userId = await getUserIdOrThrow();
    return WorkflowStorage.listApiKeysForUser(userId);
}

export async function revokeApiKeyAction(keyId: string): Promise<void> {
    const userId = await getUserIdOrThrow();
    return WorkflowStorage.revokeApiKey(keyId, userId);
}


export async function clearRunHistoryAction(): Promise<void> {
    const userId = await getUserIdOrThrow();
    return WorkflowStorage.clearRunHistory(userId);
}

// Subscription Management Actions
export async function upgradeToGoldAction(): Promise<void> {
    const userId = await getUserIdOrThrow();
    await WorkflowStorage.updateUserProfileTier(userId, 'Gold');
}

export async function upgradeToDiamondAction(): Promise<void> {
    const userId = await getUserIdOrThrow();
    await WorkflowStorage.updateUserProfileTier(userId, 'Diamond');
}

// Agent Hub Interactive Command Action
export async function agentCommandAction(command: string, history: McpCommandRecord[]): Promise<{
    responseRecord: McpCommandRecord,
    generatedWorkflow?: GenerateWorkflowFromPromptOutput
}> {
    const userId = await getUserIdOrThrow();
    let status: 'Success' | 'Failed' = 'Success';
    let aiResponseText = '';
    let generatedWorkflow: GenerateWorkflowFromPromptOutput | undefined = undefined;

    try {
        const agentConfig = await WorkflowStorage.getAgentConfig(userId);
        const chatHistoryForAi = history.slice(-5).map(h => ({
            sender: h.command ? 'user' : 'ai',
            message: h.command || h.response
        }));

        const chatInput: AssistantChatInput = {
            userMessage: command,
            enabledTools: agentConfig.enabledTools,
            userId,
            chatHistory: chatHistoryForAi,
        };

        const chatResult = await assistantChat(chatInput);
        aiResponseText = chatResult.aiResponse;
        
        if (chatResult.isWorkflowGenerationRequest && chatResult.workflowGenerationPrompt) {
            try {
                generatedWorkflow = await generateWorkflow({ prompt: chatResult.workflowGenerationPrompt }, userId);
                aiResponseText += `\n\n[Action: Workflow Generated. See below.]`;
            } catch (genError: any) {
                status = 'Failed';
                aiResponseText = `I tried to generate the workflow, but encountered an error: ${genError.message}`;
            }
        }
    } catch (e: any) {
        status = 'Failed';
        aiResponseText = `An error occurred while processing your command: ${e.message}`;
    }

    const responseRecord = {
        id: crypto.randomUUID(),
        user_id: userId,
        command: command,
        response: aiResponseText,
        status,
        timestamp: new Date().toISOString(),
    };

    await WorkflowStorage.saveMcpCommand(responseRecord, userId);
    
    return {
        responseRecord: {
            ...responseRecord,
            command, // ensure command is part of the returned record
        },
        generatedWorkflow
    };
}