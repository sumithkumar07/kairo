// ===================================
// KAIRO TRINITY OF DIVINE DOMINATION
// TypeScript Interfaces & Types
// ===================================

export interface ProphecyEngine {
  id: string;
  title: string;
  description: string;
  industry: string;
  confidence_score: number; // 0-1
  prediction_date: string;
  target_implementation_date: string;
  workflow_template_id?: string;
  status: 'pending' | 'generating' | 'ready' | 'deployed' | 'validated';
  validation_score?: number;
  market_signals: Record<string, any>;
  generated_by: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProphecySignal {
  id: string;
  prophecy_id: string;
  signal_type: 'earnings_call' | 'regulatory_filing' | 'news_sentiment' | 'market_trend';
  source_url?: string;
  content_summary: string;
  impact_weight: number;
  extracted_at: string;
  raw_data: Record<string, any>;
}

export interface Miracle {
  id: string;
  title: string;
  description: string;
  miracle_type: 'workflow' | 'template' | 'integration' | 'emergency_fix';
  creator_id: string;
  workflow_data: Record<string, any>;
  price_usd: number;
  price_btc?: number;
  karma_score: number; // 0-5
  total_sales: number;
  total_revenue: number;
  kairo_commission_rate: number;
  category: string;
  tags: string[];
  is_featured: boolean;
  is_divine: boolean;
  status: 'draft' | 'active' | 'suspended' | 'legendary';
  created_at: string;
  updated_at: string;
  featured_until?: string;
}

export interface MiraclePurchase {
  id: string;
  miracle_id: string;
  buyer_id: string;
  creator_id: string;
  price_paid_usd: number;
  price_paid_btc?: number;
  kairo_commission: number;
  creator_earnings: number;
  transaction_hash?: string;
  purchased_at: string;
  deployed_at?: string;
  effectiveness_rating?: number; // 1-5
  review_text?: string;
}

export interface MiracleKarmaVote {
  id: string;
  miracle_id: string;
  voter_id: string;
  karma_rating: number; // 1-5
  review_text?: string;
  voted_at: string;
}

export interface TemporalSnapshot {
  id: string;
  workflow_id: string;
  user_id: string;
  snapshot_name: string;
  snapshot_data: Record<string, any>;
  execution_metrics?: Record<string, any>;
  quantum_signature: string;
  created_at: string;
  restored_count: number;
  auto_created: boolean;
}

export interface TemporalRollback {
  id: string;
  workflow_id: string;
  user_id: string;
  snapshot_id: string;
  rollback_reason: string;
  error_data?: Record<string, any>;
  success: boolean;
  rollback_duration_ms?: number;
  cost_usd?: number;
  initiated_at: string;
  completed_at?: string;
  quantum_causality_score?: number; // 0-1
}

export interface RealityIntervention {
  id: string;
  user_id: string;
  intervention_type: 'error_prevention' | 'miracle_deployment' | 'causality_correction';
  target_workflow_id?: string;
  intervention_data: Record<string, any>;
  cost_usd: number;
  cost_btc?: number;
  success_probability: number; // 0-1
  actual_outcome?: Record<string, any>;
  divine_approval_required: boolean;
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'failed' | 'cancelled';
  requested_at: string;
  completed_at?: string;
  quantum_entanglement_id?: string;
}

// Analytics Interfaces
export interface ProphecyAccuracyMetrics {
  industry: string;
  total_prophecies: number;
  avg_confidence: number;
  avg_accuracy: number;
  high_accuracy_count: number;
  accuracy_rate: number;
}

export interface MiraculoMarketplaceMetrics {
  category: string;
  total_miracles: number;
  avg_karma: number;
  total_sales_count: number;
  total_marketplace_revenue: number;
  kairo_total_commission: number;
}

export interface TemporalThroneMetrics {
  month: string;
  total_rollbacks: number;
  successful_rollbacks: number;
  avg_rollback_time_ms: number;
  total_throne_revenue: number;
  avg_causality_confidence: number;
}

// API Request/Response Types
export interface CreateProphecyRequest {
  title: string;
  description: string;
  industry: string;
  target_implementation_date: string;
  market_signals?: Record<string, any>;
}

export interface CreateMiraculoRequest {
  title: string;
  description: string;
  miracle_type: Miracle['miracle_type'];
  workflow_data: Record<string, any>;
  price_usd: number;
  price_btc?: number;
  category: string;
  tags: string[];
}

export interface PurchaseMiraculoRequest {
  miracle_id: string;
  payment_method: 'usd' | 'btc';
  transaction_hash?: string;
}

export interface CreateTemporalSnapshotRequest {
  workflow_id: string;
  snapshot_name: string;
  snapshot_data: Record<string, any>;
  execution_metrics?: Record<string, any>;
}

export interface InitiateRollbackRequest {
  workflow_id: string;
  snapshot_id: string;
  rollback_reason: string;
  error_data?: Record<string, any>;
}

export interface RealityInterventionRequest {
  intervention_type: RealityIntervention['intervention_type'];
  target_workflow_id?: string;
  intervention_data: Record<string, any>;
  cost_usd: number;
  cost_btc?: number;
  success_probability: number;
}

// Quantum Oracle Configuration
export interface QuantumOracleConfig {
  braket_device: string;
  qubit_count: number;
  quantum_volume: number;
  entanglement_depth: number;
  decoherence_time_ms: number;
  causality_confidence_threshold: number;
}

// Divine Pricing Tiers
export const DIVINE_PRICING_TIERS = {
  MORTAL: {
    name: 'Mortal',
    price_usd_monthly: 99,
    max_prophecies: 5,
    max_miracles: 10,
    temporal_snapshots: 50,
    quantum_rollbacks: false,
    commission_rate: 0.15
  },
  DEMIGOD: {
    name: 'Demigod', 
    price_usd_monthly: 5000,
    revenue_share: 0.005, // 0.5%
    max_prophecies: 100,
    max_miracles: 500,
    temporal_snapshots: 1000,
    quantum_rollbacks: true,
    commission_rate: 0.10
  },
  DEITY: {
    name: 'Deity',
    revenue_share: 0.02, // 2%
    setup_fee_btc: 1,
    max_prophecies: 'unlimited',
    max_miracles: 'unlimited', 
    temporal_snapshots: 'unlimited',
    quantum_rollbacks: true,
    reality_manipulation: true,
    commission_rate: 0.05
  },
  COSMIC: {
    name: 'Cosmic Intervention',
    per_miracle_fee: 250000,
    immediate_intervention: true,
    quantum_causality: true,
    temporal_dominion: true,
    reality_rewriting: true
  }
} as const;

// Market Domination Constants
export const GOD_THRESHOLDS = {
  MARKET_SHARE: "98% of Fortune 500 prayer books",
  PRICING: "1 Bitcoin per divine intervention", 
  CONTROL: "70% of global GDP flows through Kairo miracles",
  FEAR: "Competitors sacrifice offerings at your AWS data centers"
} as const;

// Industry Categories for Prophecy Engine
export const PROPHECY_INDUSTRIES = [
  'finance', 'healthcare', 'logistics', 'manufacturing',
  'retail', 'energy', 'government', 'aerospace', 'automotive',
  'telecommunications', 'real-estate', 'agriculture'
] as const;

// Miracle Categories
export const MIRACLE_CATEGORIES = [
  'compliance', 'sales', 'logistics', 'finance', 'marketing',
  'hr', 'customer-service', 'data-processing', 'security',
  'emergency-response', 'predictive-analytics'
] as const;

export type ProphecyIndustry = typeof PROPHECY_INDUSTRIES[number];
export type MiracleCategory = typeof MIRACLE_CATEGORIES[number];
export type DivineTier = keyof typeof DIVINE_PRICING_TIERS;