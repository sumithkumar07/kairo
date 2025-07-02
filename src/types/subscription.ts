
/**
 * @fileOverview Defines types related to subscriptions and feature tiers.
 */

export type SubscriptionTier = 'Free' | 'Pro Trial' | 'Pro';

export interface SubscriptionFeatures {
  aiWorkflowGenerationsPerDay: number | 'unlimited';
  canExplainWorkflow: boolean;
  accessToAdvancedNodes: boolean; // Example for future use
  maxWorkflows: number | 'unlimited'; // Example for future use
}

export interface Subscription {
  tier: SubscriptionTier;
  features: SubscriptionFeatures;
  // Potentially add: startDate, endDate, status (active, cancelled, etc.)
}

export const FREE_TIER_FEATURES: SubscriptionFeatures = {
  aiWorkflowGenerationsPerDay: 5,
  canExplainWorkflow: false,
  accessToAdvancedNodes: false,
  maxWorkflows: 3,
};

export const PRO_TIER_FEATURES: SubscriptionFeatures = {
  aiWorkflowGenerationsPerDay: 'unlimited',
  canExplainWorkflow: true,
  accessToAdvancedNodes: true,
  maxWorkflows: 'unlimited',
};



