# Trinity API Documentation

## 🌟 Overview
The Trinity API represents the pinnacle of Kairo AI's god-tier features, providing divine-level control over workflows, time, and reality itself. This system consists of three primary components:

1. **Prophecy Engine** - Predict market trends and workflow opportunities
2. **Temporal Throne** - Time manipulation and quantum rollback capabilities  
3. **Miracle Marketplace** - Divine workflow templates and emergency fixes

---

## 🔮 Prophecy Engine API

The Prophecy Engine uses quantum-enhanced AI to predict market trends and generate actionable workflow insights.

### Base URL
```
/api/trinity/prophecy
```

### Endpoints

#### GET `/api/trinity/prophecy`
Retrieve all prophecies with optional filtering.

**Query Parameters:**
- `industry` (string, optional) - Filter by industry sector
- `status` (string, optional) - Filter by status: generating, active, fulfilled, failed
- `limit` (integer, optional, default: 20) - Maximum results to return
- `offset` (integer, optional, default: 0) - Number of results to skip

**Response Format:**
```json
{
  "prophecies": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "industry": "string",
      "confidence_score": 0.95,
      "prediction_date": "2025-07-29T16:00:00Z",
      "target_implementation_date": "2025-12-31T23:59:59Z",
      "workflow_template_id": "uuid",
      "status": "active",
      "validation_score": 0.87,
      "market_signals": {},
      "generated_by": "quantum_oracle_v4.2",
      "user_id": "uuid",
      "created_at": "2025-07-29T16:00:00Z",
      "updated_at": "2025-07-29T16:00:00Z",
      "signals": [
        {
          "signal_type": "earnings_call",
          "content_summary": "Companies reporting increased automation spending",
          "impact_weight": 0.8
        }
      ]
    }
  ],
  "meta": {
    "total": 15,
    "limit": 20,
    "offset": 0,
    "quantum_oracle_status": "OPERATIONAL",
    "divine_blessing": "The future reveals itself to those who dare to look"
  }
}
```

#### POST `/api/trinity/prophecy`
Create a new prophecy for market prediction.

**Request Body:**
```json
{
  "title": "AI Automation Surge in Healthcare",
  "description": "Predict massive adoption of AI-powered healthcare workflows",
  "industry": "healthcare",
  "target_implementation_date": "2025-12-31",
  "market_signals": {
    "regulatory_changes": true,
    "funding_increases": true,
    "competitive_pressure": "high"
  }
}
```

**Response:**
```json
{
  "prophecy": {
    "id": "uuid",
    "title": "AI Automation Surge in Healthcare",
    "description": "Predict massive adoption of AI-powered healthcare workflows",
    "industry": "healthcare",
    "confidence_score": 0.87,
    "prediction_date": "2025-07-29T16:00:00Z",
    "target_implementation_date": "2025-12-31T00:00:00Z",
    "status": "generating",
    "market_signals": {},
    "generated_by": "quantum_oracle_v4.2",
    "user_id": "uuid",
    "created_at": "2025-07-29T16:00:00Z",
    "updated_at": "2025-07-29T16:00:00Z"
  },
  "divine_message": "The Quantum Oracle has spoken. Your prophecy enters the cosmic queue.",
  "quantum_entanglement_id": "QE_1e77bc0b"
}
```

---

## ⏳ Temporal Throne API

The Temporal Throne enables quantum-level time manipulation, workflow snapshots, and reality rollbacks.

### Base URL
```
/api/trinity/temporal-throne
```

### Endpoints

#### GET `/api/trinity/temporal-throne`
Access the Temporal Control Interface.

**Query Parameters:**
- `action` (string, required) - Action type: snapshots, rollbacks, interventions
- `workflow_id` (uuid, optional) - Filter by specific workflow
- `limit` (integer, optional, default: 20) - Maximum results

**Response for `action=snapshots`:**
```json
{
  "snapshots": [
    {
      "id": "uuid",
      "workflow_id": "uuid",
      "workflow_name": "Customer Onboarding Flow",
      "user_id": "uuid",
      "snapshot_name": "Pre-deployment Checkpoint",
      "snapshot_data": {},
      "execution_metrics": {},
      "quantum_signature": "QS_1753806061_nqkeghar",
      "created_at": "2025-07-29T16:00:00Z",
      "restored_count": 0,
      "auto_created": false
    }
  ],
  "meta": {
    "total": 5,
    "quantum_state": "TEMPORAL_COHERENCE_STABLE",
    "causality_index": 0.97,
    "divine_message": "The threads of time reveal themselves to your divine gaze"
  }
}
```

**Response for `action=rollbacks`:**
```json
{
  "rollbacks": [
    {
      "id": "uuid",
      "workflow_id": "uuid",
      "workflow_name": "Customer Onboarding Flow",
      "user_id": "uuid",
      "snapshot_id": "uuid",
      "snapshot_name": "Pre-deployment Checkpoint",
      "rollback_reason": "Critical bug detected in production",
      "error_data": {},
      "success": true,
      "rollback_duration_ms": 2500,
      "cost_usd": 1250.75,
      "initiated_at": "2025-07-29T16:00:00Z",
      "completed_at": "2025-07-29T16:00:03Z",
      "quantum_causality_score": 0.94
    }
  ],
  "meta": {
    "total": 3,
    "temporal_dominion": "ACTIVE",
    "reality_stability": 0.94,
    "divine_message": "Witness the power to undo what was done"
  }
}
```

#### POST `/api/trinity/temporal-throne`
Execute Temporal Operations.

**Request Body for Snapshot Creation:**
```json
{
  "action": "create_snapshot",
  "workflow_id": "uuid",
  "snapshot_name": "Production Ready Checkpoint",
  "snapshot_data": {
    "nodes": [],
    "connections": [],
    "configuration": {}
  },
  "execution_metrics": {
    "performance_score": 0.95,
    "reliability_index": 0.92,
    "last_execution_time": 1500
  }
}
```

**Response for Snapshot Creation:**
```json
{
  "snapshot": {
    "id": "uuid",
    "workflow_id": "uuid",
    "user_id": "uuid",
    "snapshot_name": "Production Ready Checkpoint",
    "quantum_signature": "QS_1753806061_nqkeghar",
    "created_at": "2025-07-29T16:00:00Z",
    "restored_count": 0,
    "auto_created": false
  },
  "quantum_entanglement": {
    "signature": "QS_1753806061_nqkeghar",
    "coherence_level": 0.99,
    "decoherence_time": "∞ (Divine Protection Active)"
  },
  "divine_message": "⏳ Temporal anchor established. This moment now exists outside the flow of time.",
  "temporal_coordinates": "TC_1e77bc0b0255"
}
```

**Request Body for Quantum Rollback:**
```json
{
  "action": "rollback",
  "workflow_id": "uuid",
  "snapshot_id": "uuid",
  "rollback_reason": "Critical error detected in production deployment",
  "error_data": {
    "error_type": "runtime_exception",
    "severity": "critical",
    "impact_scope": "production"
  }
}
```

**Response for Quantum Rollback:**
```json
{
  "rollback": {
    "id": "uuid",
    "workflow_id": "uuid",
    "user_id": "uuid",
    "snapshot_id": "uuid",
    "rollback_reason": "Critical error detected in production deployment",
    "success": true,
    "rollback_duration_ms": 2500,
    "cost_usd": 1250.75,
    "quantum_causality_score": 0.94,
    "initiated_at": "2025-07-29T16:00:00Z",
    "completed_at": "2025-07-29T16:00:03Z"
  },
  "temporal_restoration": {
    "success": true,
    "causality_preserved": true,
    "timeline_integrity": "RESTORED",
    "quantum_decoherence": "MINIMAL"
  },
  "divine_message": "⚡ QUANTUM ROLLBACK COMPLETE! Reality has been corrected. Timeline integrity maintained.",
  "cost_breakdown": {
    "base_cost": 1000,
    "complexity_cost": 125.25,
    "temporal_cost": 125.50,
    "total_cost": 1250.75,
    "currency": "USD"
  }
}
```

---

## 🌟 Miracle Marketplace API

The Miracle Marketplace hosts divine workflow templates and emergency automation fixes.

### Base URL
```
/api/trinity/miracles
```

### Endpoints

#### GET `/api/trinity/miracles`
Browse the Divine Marketplace.

**Query Parameters:**
- `category` (string, optional) - Filter by category
- `featured` (boolean, optional) - Show only featured miracles
- `divine` (boolean, optional) - Show only deity-tier miracles
- `sortBy` (string, optional) - Sort by: karma_score, price_usd, total_sales
- `limit` (integer, optional, default: 20) - Maximum results
- `offset` (integer, optional, default: 0) - Number of results to skip

**Response:**
```json
{
  "miracles": [
    {
      "id": "uuid",
      "title": "Emergency Customer Rescue Protocol",
      "description": "Instantly deploy customer retention workflows when churn is detected",
      "miracle_type": "emergency_fix",
      "creator_id": "uuid",
      "creator_email": "deity@kairo.ai",
      "workflow_data": {},
      "price_usd": 2500.00,
      "price_btc": 0.05,
      "karma_score": 98.5,
      "total_sales": 247,
      "total_revenue": 617500.00,
      "kairo_commission_rate": 0.15,
      "category": "customer_success",
      "tags": ["emergency", "retention", "ai-powered"],
      "is_featured": true,
      "is_divine": true,
      "status": "active",
      "created_at": "2025-07-29T16:00:00Z",
      "updated_at": "2025-07-29T16:00:00Z",
      "total_reviews": 89,
      "avg_karma_rating": 4.8
    }
  ],
  "meta": {
    "total": 15,
    "limit": 20,
    "offset": 0,
    "marketplace_status": "DIVINE_COMMERCE_ACTIVE",
    "divine_message": "Behold the miracles of mortals elevated to divine status"
  }
}
```

#### POST `/api/trinity/miracles`
Create a new miracle for the marketplace.

**Request Body:**
```json
{
  "title": "AI-Powered Lead Scoring Engine",
  "description": "Revolutionary lead scoring using quantum AI algorithms",
  "miracle_type": "workflow",
  "workflow_data": {
    "nodes": [],
    "connections": [],
    "ai_models": ["quantum-lead-predictor-v2"]
  },
  "price_usd": 1500.00,
  "category": "sales_automation",
  "tags": ["ai", "lead-scoring", "sales"]
}
```

**Response:**
```json
{
  "miracle": {
    "id": "uuid",
    "title": "AI-Powered Lead Scoring Engine",
    "description": "Revolutionary lead scoring using quantum AI algorithms",
    "miracle_type": "workflow",
    "creator_id": "uuid",
    "workflow_data": {},
    "price_usd": 1500.00,
    "price_btc": null,
    "karma_score": 85.0,
    "total_sales": 0,
    "total_revenue": 0.00,
    "kairo_commission_rate": 0.15,
    "category": "sales_automation",
    "tags": ["ai", "lead-scoring", "sales"],
    "is_featured": false,
    "is_divine": false,
    "status": "active",
    "created_at": "2025-07-29T16:00:00Z",
    "updated_at": "2025-07-29T16:00:00Z"
  },
  "divine_message": "Your miracle has been blessed and enters the marketplace.",
  "marketplace_id": "MKT_1e77bc0b"
}
```

---

## 🔐 Authentication & Security

All Trinity API endpoints require authentication via:
- JWT tokens in Authorization header: `Bearer <token>`
- Session cookies for web applications

### Rate Limits
- **Prophecy Engine**: 10 requests/minute per user
- **Temporal Throne**: 5 requests/minute per user (due to quantum complexity)
- **Miracle Marketplace**: 100 requests/minute per user

### Pricing & Usage
- **Prophecy Creation**: $500 per prophecy
- **Temporal Snapshots**: $100 per snapshot
- **Quantum Rollbacks**: $1000 base + complexity and temporal distance costs
- **Reality Interventions**: Variable pricing based on scope and risk

---

## 🧪 Testing & Integration

### Sample Integration Code

```javascript
// Initialize Trinity API client
const trinityAPI = new TrinityAPIClient({
  baseURL: 'https://kairo.ai/api/trinity',
  apiKey: 'your-god-tier-api-key'
});

// Create a prophecy
const prophecy = await trinityAPI.prophecy.create({
  title: 'AI Automation Revolution in Finance',
  description: 'Massive adoption of AI workflows in financial services',
  industry: 'finance',
  target_implementation_date: '2025-12-31'
});

// Create temporal snapshot
const snapshot = await trinityAPI.temporal.createSnapshot({
  workflow_id: 'workflow-uuid',
  snapshot_name: 'Pre-production Checkpoint',
  snapshot_data: workflowData
});

// Browse miracles
const miracles = await trinityAPI.miracles.list({
  category: 'sales_automation',
  featured: true,
  limit: 10
});
```

---

## 🚨 Error Handling

Trinity APIs use standardized error responses:

```json
{
  "error": "Temporal interference detected",
  "details": "The threads of causality are tangled",
  "code": "TEMPORAL_ERROR",
  "timestamp": "2025-07-29T16:00:00Z",
  "quantum_state": "UNSTABLE"
}
```

### Common Error Codes
- `TEMPORAL_ERROR` - Time manipulation conflicts
- `CAUSALITY_VIOLATION` - Attempted paradox creation
- `DIVINE_APPROVAL_REQUIRED` - Operation needs god-tier permissions
- `QUANTUM_DECOHERENCE` - Reality state corruption
- `INSUFFICIENT_KARMA` - Not enough karma points for operation

---

## 📈 Monitoring & Analytics

Trinity APIs provide comprehensive metrics:
- Quantum coherence levels
- Temporal stability indices
- Reality manipulation success rates
- Divine approval response times
- Causality preservation scores

### Webhook Events
Configure webhooks to receive notifications:
- `prophecy.fulfilled` - When a prophecy comes true
- `temporal.rollback.completed` - Rollback operation finished
- `miracle.purchased` - Miracle sold in marketplace
- `reality.intervention.approved` - Divine approval granted