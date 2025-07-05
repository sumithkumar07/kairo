
/**
 * @fileOverview Defines types related to subscriptions and feature tiers.
 */

export type SubscriptionTier = 'Free' | 'Diamond Trial' | 'Gold' | 'Diamond';

export interface SubscriptionFeatures {
  aiWorkflowGenerationsPerMonth: number | 'unlimited';
  canExplainWorkflow: boolean;
  accessToAdvancedNodes: boolean;
  maxWorkflows: number | 'unlimited';
  maxRunsPerMonth: number | 'unlimited';
}

export interface Subscription {
  tier: SubscriptionTier;
  features: SubscriptionFeatures;
  // Potentially add: startDate, endDate, status (active, cancelled, etc.)
}

export const FREE_TIER_FEATURES: SubscriptionFeatures = {
  aiWorkflowGenerationsPerMonth: 5,
  canExplainWorkflow: false,
  accessToAdvancedNodes: false,
  maxWorkflows: 3,
  maxRunsPerMonth: 20,
};

export const GOLD_TIER_FEATURES: SubscriptionFeatures = {
  aiWorkflowGenerationsPerMonth: 50,
  canExplainWorkflow: true,
  accessToAdvancedNodes: true,
  maxWorkflows: 20,
  maxRunsPerMonth: 100,
};

export const DIAMOND_TIER_FEATURES: SubscriptionFeatures = {
  aiWorkflowGenerationsPerMonth: 200,
  canExplainWorkflow: true,
  accessToAdvancedNodes: true,
  maxWorkflows: 50,
  maxRunsPerMonth: 200,
};
