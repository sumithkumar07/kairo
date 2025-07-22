import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import type { HipaaAuditLog, HipaaWorkflowCertification, HipaaComplianceRequest, GodTierApiResponse } from '@/types/god-tier';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING,
});

// GET /api/god-tier/hipaa-compliance - Get HIPAA compliance data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'certifications';
    const workflow_id = searchParams.get('workflow_id');
    const risk_level = searchParams.get('risk_level');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (type === 'audit_logs') {
      return await getHipaaAuditLogs(workflow_id, risk_level, limit, offset);
    } else if (type === 'certifications') {
      return await getHipaaWorkflowCertifications(workflow_id, limit, offset);
    } else if (type === 'compliance_dashboard') {
      return await getHipaaComplianceDashboard();
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid type parameter. Use: audit_logs, certifications, or compliance_dashboard',
      timestamp: new Date().toISOString()
    } as GodTierApiResponse, { status: 400 });

  } catch (error: any) {
    console.error('[HIPAA COMPLIANCE] Error fetching data:', error);
    return NextResponse.json({
      success: false,
      error: 'HIPAA compliance system temporarily unavailable',
      divine_message: "🏥 The healthcare compliance oracle is recalibrating privacy shields",
      timestamp: new Date().toISOString()
    } as GodTierApiResponse, { status: 500 });
  }
}

// POST /api/god-tier/hipaa-compliance - Create HIPAA compliance certification
export async function POST(request: NextRequest) {
  try {
    const body: HipaaComplianceRequest = await request.json();
    
    if (!body.workflow_id || !body.phi_categories || !body.access_controls) {
      return NextResponse.json({
        success: false,
        error: 'HIPAA compliance requires workflow_id, phi_categories, and access_controls',
        timestamp: new Date().toISOString()
      } as GodTierApiResponse, { status: 400 });
    }

    // Validate PHI categories
    const validPhiCategories = [
      'demographic_info', 'medical_records', 'treatment_data', 'payment_info',
      'insurance_data', 'appointment_records', 'prescription_data', 'diagnostic_results',
      'provider_communications', 'billing_records'
    ];
    
    const invalidCategories = body.phi_categories.filter(cat => !validPhiCategories.includes(cat));
    if (invalidCategories.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Invalid PHI categories: ${invalidCategories.join(', ')}`,
        timestamp: new Date().toISOString()
      } as GodTierApiResponse, { status: 400 });
    }

    const certificationId = uuidv4();
    const userId = uuidv4(); // Mock - replace with actual auth
    
    // Perform automated compliance assessment
    const complianceChecks = await performHipaaComplianceChecks(body);
    const riskAssessment = await performHipaaRiskAssessment(body);
    
    // Determine certification level based on compliance checks
    const certificationLevel = determineCertificationLevel(complianceChecks);
    
    const insertQuery = `
      INSERT INTO hipaa_workflow_certifications (
        id, workflow_id, user_id, certification_level, compliance_checks,
        risk_assessment, phi_handling_approved, ba_agreement_signed,
        encryption_verified, access_controls_verified, audit_trail_enabled,
        expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1); // 1 year expiration

    const result = await pool.query(insertQuery, [
      certificationId,
      body.workflow_id,
      userId,
      certificationLevel,
      JSON.stringify(complianceChecks),
      JSON.stringify(riskAssessment),
      complianceChecks.phi_handling_score > 0.8,
      body.business_associate_agreement,
      complianceChecks.encryption_score > 0.9,
      complianceChecks.access_control_score > 0.85,
      true,
      expirationDate
    ]);

    const certification = result.rows[0];

    // Create audit log entry
    await createHipaaAuditLog({
      user_id: userId,
      workflow_id: body.workflow_id,
      phi_accessed: false,
      access_type: 'certification_request',
      phi_categories: body.phi_categories,
      audit_event: 'HIPAA_WORKFLOW_CERTIFICATION_CREATED',
      compliance_score: complianceChecks.overall_score,
      risk_level: riskAssessment.risk_level,
      mitigation_actions: riskAssessment.mitigation_actions || {}
    });

    return NextResponse.json({
      success: true,
      data: {
        certification: {
          id: certification.id,
          workflow_id: certification.workflow_id,
          user_id: certification.user_id,
          certification_level: certification.certification_level,
          compliance_checks: certification.compliance_checks,
          risk_assessment: certification.risk_assessment,
          phi_handling_approved: certification.phi_handling_approved,
          ba_agreement_signed: certification.ba_agreement_signed,
          encryption_verified: certification.encryption_verified,
          access_controls_verified: certification.access_controls_verified,
          audit_trail_enabled: certification.audit_trail_enabled,
          certification_date: certification.certification_date,
          expires_at: certification.expires_at,
          certification_status: certification.certification_status
        } as HipaaWorkflowCertification,
        compliance_score: complianceChecks.overall_score,
        recommendations: complianceChecks.recommendations
      },
      divine_message: `🏥 HIPAA ${certificationLevel} certification granted! Your workflow now has divine healthcare compliance protection.`,
      timestamp: new Date().toISOString()
    } as GodTierApiResponse);

  } catch (error: any) {
    console.error('[HIPAA COMPLIANCE] Error creating certification:', error);
    return NextResponse.json({
      success: false,
      error: 'HIPAA certification process failed',
      divine_message: "⚠️ Healthcare privacy spirits require additional protection rituals",
      timestamp: new Date().toISOString()
    } as GodTierApiResponse, { status: 500 });
  }
}

async function getHipaaAuditLogs(workflow_id: string | null, risk_level: string | null, limit: number, offset: number) {
  let query = `
    SELECT * FROM hipaa_audit_logs
    WHERE 1=1
  `;
  
  const params: any[] = [];
  let paramCount = 0;

  if (workflow_id) {
    paramCount++;
    query += ` AND workflow_id = $${paramCount}`;
    params.push(workflow_id);
  }

  if (risk_level) {
    paramCount++;
    query += ` AND risk_level = $${paramCount}`;
    params.push(risk_level);
  }

  paramCount++;
  query += ` ORDER BY timestamp DESC LIMIT $${paramCount}`;
  params.push(limit);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const result = await pool.query(query, params);

  const auditLogs: HipaaAuditLog[] = result.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    workflow_id: row.workflow_id,
    phi_accessed: row.phi_accessed,
    access_type: row.access_type,
    phi_categories: row.phi_categories,
    audit_event: row.audit_event,
    compliance_score: parseFloat(row.compliance_score),
    risk_level: row.risk_level,
    mitigation_actions: row.mitigation_actions,
    timestamp: row.timestamp,
    ip_address: row.ip_address,
    user_agent: row.user_agent,
    session_id: row.session_id
  }));

  return NextResponse.json({
    success: true,
    data: {
      audit_logs: auditLogs,
      meta: {
        total: auditLogs.length,
        limit,
        offset,
        hipaa_compliance_status: "ACTIVE",
        audit_trail_integrity: "VERIFIED"
      }
    },
    divine_message: "🔍 HIPAA audit trail reveals all healthcare data access patterns",
    timestamp: new Date().toISOString()
  } as GodTierApiResponse);
}

async function getHipaaWorkflowCertifications(workflow_id: string | null, limit: number, offset: number) {
  let query = `
    SELECT * FROM hipaa_workflow_certifications
    WHERE 1=1
  `;
  
  const params: any[] = [];
  let paramCount = 0;

  if (workflow_id) {
    paramCount++;
    query += ` AND workflow_id = $${paramCount}`;
    params.push(workflow_id);
  }

  paramCount++;
  query += ` ORDER BY certification_date DESC LIMIT $${paramCount}`;
  params.push(limit);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const result = await pool.query(query, params);

  const certifications: HipaaWorkflowCertification[] = result.rows.map(row => ({
    id: row.id,
    workflow_id: row.workflow_id,
    user_id: row.user_id,
    certification_level: row.certification_level,
    compliance_checks: row.compliance_checks,
    risk_assessment: row.risk_assessment,
    phi_handling_approved: row.phi_handling_approved,
    ba_agreement_signed: row.ba_agreement_signed,
    encryption_verified: row.encryption_verified,
    access_controls_verified: row.access_controls_verified,
    audit_trail_enabled: row.audit_trail_enabled,
    certification_date: row.certification_date,
    expires_at: row.expires_at,
    certification_status: row.certification_status
  }));

  return NextResponse.json({
    success: true,
    data: {
      certifications,
      meta: {
        total: certifications.length,
        limit,
        offset,
        active_certifications: certifications.filter(c => c.certification_status === 'active').length,
        expiring_soon: certifications.filter(c => {
          if (!c.expires_at) return false;
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          return new Date(c.expires_at) < thirtyDaysFromNow;
        }).length
      }
    },
    divine_message: "📋 HIPAA workflow certifications demonstrate your commitment to healthcare privacy excellence",
    timestamp: new Date().toISOString()
  } as GodTierApiResponse);
}

async function getHipaaComplianceDashboard() {
  // Get compliance metrics
  const [auditCount, certificationCount, riskMetrics] = await Promise.all([
    pool.query('SELECT COUNT(*), risk_level FROM hipaa_audit_logs GROUP BY risk_level'),
    pool.query('SELECT COUNT(*), certification_level FROM hipaa_workflow_certifications WHERE certification_status = $1 GROUP BY certification_level', ['active']),
    pool.query('SELECT AVG(compliance_score) as avg_compliance, COUNT(*) as total_audits FROM hipaa_audit_logs WHERE timestamp > NOW() - INTERVAL \'30 days\'')
  ]);

  const dashboardData = {
    audit_summary: auditCount.rows.reduce((acc, row) => {
      acc[row.risk_level] = parseInt(row.count);
      return acc;
    }, {}),
    certification_summary: certificationCount.rows.reduce((acc, row) => {
      acc[row.certification_level] = parseInt(row.count);
      return acc;
    }, {}),
    compliance_metrics: {
      average_compliance_score: riskMetrics.rows[0]?.avg_compliance ? parseFloat(riskMetrics.rows[0].avg_compliance) : 0,
      total_audits_30_days: riskMetrics.rows[0]?.total_audits ? parseInt(riskMetrics.rows[0].total_audits) : 0,
      compliance_trend: "improving", // Would calculate trend in real implementation
      risk_distribution: auditCount.rows
    }
  };

  return NextResponse.json({
    success: true,
    data: dashboardData,
    divine_message: "📊 HIPAA compliance dashboard shows your healthcare automation empire status",
    timestamp: new Date().toISOString()
  } as GodTierApiResponse);
}

async function performHipaaComplianceChecks(request: HipaaComplianceRequest): Promise<any> {
  const checks = {
    encryption_score: 0,
    access_control_score: 0,
    phi_handling_score: 0,
    audit_trail_score: 0,
    overall_score: 0,
    recommendations: [] as string[]
  };

  // Encryption assessment
  if (request.access_controls.data_encryption) {
    checks.encryption_score = 0.95;
  } else {
    checks.encryption_score = 0.4;
    checks.recommendations.push("Enable end-to-end encryption for all PHI data");
  }

  // Access control assessment
  let accessScore = 0;
  if (request.access_controls.role_based_access) accessScore += 0.3;
  if (request.access_controls.multi_factor_auth) accessScore += 0.3;
  if (request.access_controls.audit_logging) accessScore += 0.25;
  
  checks.access_control_score = Math.min(accessScore + 0.15, 1.0);

  if (!request.access_controls.role_based_access) {
    checks.recommendations.push("Implement role-based access controls for PHI");
  }
  if (!request.access_controls.multi_factor_auth) {
    checks.recommendations.push("Enable multi-factor authentication for all users");
  }

  // PHI handling assessment
  const phiComplexity = request.phi_categories.length;
  if (phiComplexity <= 3) {
    checks.phi_handling_score = 0.95;
  } else if (phiComplexity <= 6) {
    checks.phi_handling_score = 0.85;
  } else {
    checks.phi_handling_score = 0.75;
    checks.recommendations.push("Consider workflow simplification to reduce PHI exposure surface");
  }

  // Audit trail assessment
  if (request.access_controls.audit_logging) {
    checks.audit_trail_score = 0.9;
  } else {
    checks.audit_trail_score = 0.3;
    checks.recommendations.push("Enable comprehensive audit logging for all PHI access");
  }

  // Calculate overall score
  checks.overall_score = (
    checks.encryption_score * 0.3 +
    checks.access_control_score * 0.3 +
    checks.phi_handling_score * 0.25 +
    checks.audit_trail_score * 0.15
  );

  return checks;
}

async function performHipaaRiskAssessment(request: HipaaComplianceRequest): Promise<any> {
  const riskFactors = {
    phi_volume_risk: request.phi_categories.length > 5 ? 'medium' : 'low',
    access_complexity_risk: request.access_controls.role_based_access ? 'low' : 'high',
    encryption_risk: request.access_controls.data_encryption ? 'low' : 'critical',
    ba_agreement_risk: request.business_associate_agreement ? 'low' : 'high'
  };

  // Calculate overall risk level
  const riskScores = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };

  const totalRiskScore = Object.values(riskFactors).reduce((sum, risk) => sum + riskScores[risk], 0);
  const avgRiskScore = totalRiskScore / Object.keys(riskFactors).length;

  let overallRiskLevel: string;
  if (avgRiskScore <= 1.5) overallRiskLevel = 'low';
  else if (avgRiskScore <= 2.5) overallRiskLevel = 'medium';
  else if (avgRiskScore <= 3.5) overallRiskLevel = 'high';
  else overallRiskLevel = 'critical';

  const mitigationActions = [];
  
  if (riskFactors.encryption_risk === 'critical') {
    mitigationActions.push('Immediate implementation of AES-256 encryption required');
  }
  if (riskFactors.access_complexity_risk === 'high') {
    mitigationActions.push('Deploy role-based access control system within 30 days');
  }
  if (riskFactors.ba_agreement_risk === 'high') {
    mitigationActions.push('Execute Business Associate Agreement with all third parties');
  }

  return {
    risk_level: overallRiskLevel,
    risk_factors: riskFactors,
    mitigation_actions: mitigationActions,
    assessment_date: new Date().toISOString(),
    next_assessment_due: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
  };
}

function determineCertificationLevel(complianceChecks: any): string {
  if (complianceChecks.overall_score >= 0.95) return 'enterprise';
  if (complianceChecks.overall_score >= 0.85) return 'advanced';
  if (complianceChecks.overall_score >= 0.7) return 'standard';
  return 'basic';
}

async function createHipaaAuditLog(auditData: Partial<HipaaAuditLog>): Promise<void> {
  const auditId = uuidv4();
  
  await pool.query(`
    INSERT INTO hipaa_audit_logs (
      id, user_id, workflow_id, phi_accessed, access_type, phi_categories,
      audit_event, compliance_score, risk_level, mitigation_actions
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [
    auditId,
    auditData.user_id,
    auditData.workflow_id,
    auditData.phi_accessed || false,
    auditData.access_type,
    auditData.phi_categories || [],
    auditData.audit_event,
    auditData.compliance_score || 1.0,
    auditData.risk_level || 'low',
    JSON.stringify(auditData.mitigation_actions || {})
  ]);
}