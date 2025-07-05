
/**
 * @fileOverview Defines types related to subscriptions and feature tiers.
 */

export type SubscriptionTier = 'Free' | 'Gold Trial' | 'Gold' | 'Diamond';

export interface SubscriptionFeatures {
  aiWorkflowGenerationsPerMonth: number | 'unlimited';
  canExplainWorkflow: boolean;
  accessToAdvancedNodes: boolean;
  maxWorkflows: number | 'unlimited';
  maxRunsPerMonth: number | 'unlimited';
  aiErrorDiagnosis: boolean;
  aiTestDataGeneration: boolean;
}

export interface Subscription {
  tier: SubscriptionTier;
  features: SubscriptionFeatures;
  // Potentially add: startDate, endDate, status (active, cancelled, etc.)
}

export const FREE_TIER_FEATURES: SubscriptionFeatures = {
  aiWorkflowGenerationsPerMonth: 5,
  canExplainWorkflow: true, // Let's make this a free feature for better onboarding
  accessToAdvancedNodes: false,
  maxWorkflows: 3,
  maxRunsPerMonth: 50,
  aiErrorDiagnosis: false,
  aiTestDataGeneration: false,
};

export const GOLD_TIER_FEATURES: SubscriptionFeatures = {
  aiWorkflowGenerationsPerMonth: 50,
  canExplainWorkflow: true,
  accessToAdvancedNodes: true,
  maxWorkflows: 20,
  maxRunsPerMonth: 250,
  aiErrorDiagnosis: false, // Keep this for the highest tier
  aiTestDataGeneration: true,
};

export const DIAMOND_TIER_FEATURES: SubscriptionFeatures = {
  aiWorkflowGenerationsPerMonth: 'unlimited',
  canExplainWorkflow: true,
  accessToAdvancedNodes: true,
  maxWorkflows: 'unlimited',
  maxRunsPerMonth: 'unlimited',
  aiErrorDiagnosis: true,
  aiTestDataGeneration: true,
};
