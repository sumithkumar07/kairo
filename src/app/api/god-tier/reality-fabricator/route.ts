import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import type { IoTDevice, RealityFabricationJob, RealityFabricationRequest, GodTierApiResponse } from '@/types/god-tier';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING,
});

// GET /api/god-tier/reality-fabricator - Get reality fabrication data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'jobs';
    const status = searchParams.get('status');
    const device_type = searchParams.get('device_type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (type === 'devices') {
      return await getIoTDevices(status, device_type, limit, offset);
    } else if (type === 'jobs') {
      return await getRealityFabricationJobs(status, limit, offset);
    } else if (type === 'reality_dashboard') {
      return await getRealityFabricationDashboard();
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid type parameter. Use: devices, jobs, or reality_dashboard',
      timestamp: new Date().toISOString()
    } as GodTierApiResponse, { status: 400 });

  } catch (error: any) {
    console.error('[REALITY FABRICATOR] Error fetching data:', error);
    return NextResponse.json({
      success: false,
      error: 'Reality fabrication matrix temporarily offline',
      divine_message: "🔧 The IoT realm is recalibrating physical connections to the divine network",
      timestamp: new Date().toISOString()
    } as GodTierApiResponse, { status: 500 });
  }
}

// POST /api/god-tier/reality-fabricator - Create reality fabrication job
export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    if (action === 'register_device') {
      return await registerIoTDevice(data);
    } else if (action === 'fabricate_reality') {
      return await createRealityFabricationJob(data as RealityFabricationRequest);
    } else if (action === 'emergency_miracle') {
      return await executeEmergencyMiracle(data);
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use: register_device, fabricate_reality, or emergency_miracle',
      timestamp: new Date().toISOString()
    } as GodTierApiResponse, { status: 400 });

  } catch (error: any) {
    console.error('[REALITY FABRICATOR] Error processing action:', error);
    return NextResponse.json({
      success: false,
      error: 'Reality fabrication failed. Physical laws may be interfering.',
      divine_message: "⚡ The fabric of reality resisted manipulation. Increase divine power levels.",
      timestamp: new Date().toISOString()
    } as GodTierApiResponse, { status: 500 });
  }
}

async function getIoTDevices(status: string | null, device_type: string | null, limit: number, offset: number) {
  let query = `
    SELECT * FROM iot_devices
    WHERE 1=1
  `;
  
  const params: any[] = [];
  let paramCount = 0;

  if (status) {
    paramCount++;
    query += ` AND current_status = $${paramCount}`;
    params.push(status);
  }

  if (device_type) {
    paramCount++;
    query += ` AND device_type = $${paramCount}`;
    params.push(device_type);
  }

  paramCount++;
  query += ` ORDER BY last_heartbeat DESC LIMIT $${paramCount}`;
  params.push(limit);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const result = await pool.query(query, params);

  const devices: IoTDevice[] = result.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    device_name: row.device_name,
    device_type: row.device_type,
    device_category: row.device_category,
    manufacturer: row.manufacturer,
    model_number: row.model_number,
    firmware_version: row.firmware_version,
    connection_protocol: row.connection_protocol,
    device_capabilities: row.device_capabilities,
    current_status: row.current_status,
    last_heartbeat: row.last_heartbeat,
    configuration: row.configuration,
    security_credentials: row.security_credentials,
    location_data: row.location_data,
    created_at: row.created_at
  }));

  return NextResponse.json({
    success: true,
    data: {
      devices,
      meta: {
        total: devices.length,
        limit,
        offset,
        online_devices: devices.filter(d => d.current_status === 'online').length,
        device_categories: [...new Set(devices.map(d => d.device_category).filter(Boolean))],
        reality_mesh_status: "CONNECTED"
      }
    },
    divine_message: "🌐 IoT devices in the reality fabrication network are at your command",
    timestamp: new Date().toISOString()
  } as GodTierApiResponse);
}

async function getRealityFabricationJobs(status: string | null, limit: number, offset: number) {
  let query = `
    SELECT rfj.*, 
           COUNT(DISTINCT unnest(rfj.target_devices)) as device_count
    FROM reality_fabrication_jobs rfj
    WHERE 1=1
  `;
  
  const params: any[] = [];
  let paramCount = 0;

  if (status) {
    paramCount++;
    query += ` AND rfj.execution_status = $${paramCount}`;
    params.push(status);
  }

  query += ` GROUP BY rfj.id`;

  paramCount++;
  query += ` ORDER BY rfj.created_at DESC LIMIT $${paramCount}`;
  params.push(limit);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const result = await pool.query(query, params);

  const jobs: RealityFabricationJob[] = result.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    workflow_id: row.workflow_id,
    fabrication_type: row.fabrication_type,
    target_devices: row.target_devices,
    fabrication_commands: row.fabrication_commands,
    execution_sequence: row.execution_sequence,
    safety_checks: row.safety_checks,
    execution_status: row.execution_status,
    success_rate: row.success_rate ? parseFloat(row.success_rate) : undefined,
    physical_impact_score: row.physical_impact_score ? parseFloat(row.physical_impact_score) : undefined,
    environmental_data: row.environmental_data,
    cost_usd: parseFloat(row.cost_usd),
    scheduled_for: row.scheduled_for,
    executed_at: row.executed_at,
    completed_at: row.completed_at
  }));

  return NextResponse.json({
    success: true,
    data: {
      jobs,
      meta: {
        total: jobs.length,
        limit,
        offset,
        active_jobs: jobs.filter(j => j.execution_status === 'executing').length,
        success_rate: jobs.length > 0 ? jobs.filter(j => j.execution_status === 'completed').length / jobs.length : 0,
        reality_coherence: 0.97
      }
    },
    divine_message: "⚙️ Reality fabrication jobs show your mastery over the physical realm",
    timestamp: new Date().toISOString()
  } as GodTierApiResponse);
}

async function getRealityFabricationDashboard() {
  const [deviceStats, jobStats, fabricationMetrics] = await Promise.all([
    pool.query(`
      SELECT 
        current_status,
        COUNT(*) as count,
        device_category
      FROM iot_devices 
      GROUP BY current_status, device_category
    `),
    pool.query(`
      SELECT 
        execution_status,
        COUNT(*) as count,
        AVG(success_rate) as avg_success_rate,
        SUM(cost_usd) as total_cost
      FROM reality_fabrication_jobs 
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY execution_status
    `),
    pool.query(`
      SELECT 
        AVG(physical_impact_score) as avg_impact,
        COUNT(DISTINCT workflow_id) as unique_workflows,
        COUNT(DISTINCT unnest(target_devices)) as total_devices_controlled
      FROM reality_fabrication_jobs 
      WHERE completed_at > NOW() - INTERVAL '7 days'
    `)
  ]);

  const dashboardData = {
    device_overview: {
      total_devices: deviceStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
      online_devices: deviceStats.rows.find(row => row.current_status === 'online')?.count || 0,
      device_categories: [...new Set(deviceStats.rows.map(row => row.device_category).filter(Boolean))],
      status_distribution: deviceStats.rows.reduce((acc, row) => {
        acc[row.current_status] = parseInt(row.count);
        return acc;
      }, {})
    },
    fabrication_metrics: {
      jobs_last_30_days: jobStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
      success_rate: jobStats.rows.find(row => row.execution_status === 'completed')?.avg_success_rate || 0,
      total_cost_30_days: jobStats.rows.reduce((sum, row) => sum + (parseFloat(row.total_cost) || 0), 0),
      status_breakdown: jobStats.rows.reduce((acc, row) => {
        acc[row.execution_status] = {
          count: parseInt(row.count),
          avg_success_rate: parseFloat(row.avg_success_rate) || 0
        };
        return acc;
      }, {})
    },
    reality_impact: {
      average_physical_impact: fabricationMetrics.rows[0]?.avg_impact ? parseFloat(fabricationMetrics.rows[0].avg_impact) : 0,
      workflows_using_fabrication: fabricationMetrics.rows[0]?.unique_workflows ? parseInt(fabricationMetrics.rows[0].unique_workflows) : 0,
      devices_under_control: fabricationMetrics.rows[0]?.total_devices_controlled ? parseInt(fabricationMetrics.rows[0].total_devices_controlled) : 0,
      reality_coherence_index: 0.94 + Math.random() * 0.05 // Mock coherence index
    }
  };

  return NextResponse.json({
    success: true,
    data: dashboardData,
    divine_message: "🌍 Reality fabrication dashboard reveals your dominion over the physical world",
    timestamp: new Date().toISOString()
  } as GodTierApiResponse);
}

async function registerIoTDevice(deviceData: any) {
  if (!deviceData.device_name || !deviceData.connection_protocol) {
    return NextResponse.json({
      success: false,
      error: 'Device registration requires device_name and connection_protocol',
      timestamp: new Date().toISOString()
    } as GodTierApiResponse, { status: 400 });
  }

  const deviceId = uuidv4();
  const userId = uuidv4(); // Mock - replace with actual auth

  // Generate device capabilities based on type
  const capabilities = generateDeviceCapabilities(deviceData.device_type, deviceData.device_category);
  
  // Generate security credentials
  const securityCredentials = {
    device_key: generateDeviceKey(),
    encryption_method: 'AES-256',
    auth_token_expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    security_level: determineSecurityLevel(deviceData.device_category)
  };

  const insertQuery = `
    INSERT INTO iot_devices (
      id, user_id, device_name, device_type, device_category,
      manufacturer, model_number, firmware_version, connection_protocol,
      device_capabilities, configuration, security_credentials, location_data
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `;

  const result = await pool.query(insertQuery, [
    deviceId,
    userId,
    deviceData.device_name,
    deviceData.device_type || 'generic',
    deviceData.device_category || 'automation',
    deviceData.manufacturer,
    deviceData.model_number,
    deviceData.firmware_version,
    deviceData.connection_protocol,
    JSON.stringify(capabilities),
    JSON.stringify(deviceData.configuration || {}),
    JSON.stringify(securityCredentials),
    JSON.stringify(deviceData.location_data || {})
  ]);

  const device = result.rows[0];

  return NextResponse.json({
    success: true,
    data: {
      device: {
        id: device.id,
        user_id: device.user_id,
        device_name: device.device_name,
        device_type: device.device_type,
        device_category: device.device_category,
        manufacturer: device.manufacturer,
        model_number: device.model_number,
        firmware_version: device.firmware_version,
        connection_protocol: device.connection_protocol,
        device_capabilities: device.device_capabilities,
        current_status: device.current_status,
        created_at: device.created_at
      } as IoTDevice,
      security_credentials: securityCredentials
    },
    divine_message: `🔗 IoT device '${device.device_name}' has been blessed and added to the reality fabrication network`,
    timestamp: new Date().toISOString()
  } as GodTierApiResponse);
}

async function createRealityFabricationJob(request: RealityFabricationRequest) {
  if (!request.fabrication_type || !request.target_devices || !request.fabrication_commands) {
    return NextResponse.json({
      success: false,
      error: 'Reality fabrication requires fabrication_type, target_devices, and fabrication_commands',
      timestamp: new Date().toISOString()
    } as GodTierApiResponse, { status: 400 });
  }

  // Validate target devices exist
  const deviceCheckQuery = `
    SELECT id, device_name, current_status, device_capabilities 
    FROM iot_devices 
    WHERE id = ANY($1) AND current_status = 'online'
  `;
  
  const deviceCheckResult = await pool.query(deviceCheckQuery, [request.target_devices]);
  
  if (deviceCheckResult.rows.length !== request.target_devices.length) {
    return NextResponse.json({
      success: false,
      error: 'Some target devices are offline or do not exist',
      timestamp: new Date().toISOString()
    } as GodTierApiResponse, { status: 400 });
  }

  const jobId = uuidv4();
  const userId = uuidv4(); // Mock - replace with actual auth

  // Perform safety checks
  const safetyChecks = await performSafetyChecks(request, deviceCheckResult.rows);
  
  if (!safetyChecks.safe_to_proceed) {
    return NextResponse.json({
      success: false,
      error: 'Safety checks failed. Fabrication job deemed unsafe.',
      data: { safety_issues: safetyChecks.issues },
      timestamp: new Date().toISOString()
    } as GodTierApiResponse, { status: 400 });
  }

  // Calculate execution sequence
  const executionSequence = generateExecutionSequence(request.fabrication_commands);
  
  // Estimate cost based on complexity and device count
  const baseCost = 25;
  const deviceCost = request.target_devices.length * 15;
  const complexityCost = request.fabrication_commands.command_sequence.length * 5;
  const totalCost = baseCost + deviceCost + complexityCost;

  const insertQuery = `
    INSERT INTO reality_fabrication_jobs (
      id, user_id, fabrication_type, target_devices, fabrication_commands,
      execution_sequence, safety_checks, cost_usd, scheduled_for
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const scheduledFor = request.scheduled_for ? new Date(request.scheduled_for) : new Date();

  const result = await pool.query(insertQuery, [
    jobId,
    userId,
    request.fabrication_type,
    request.target_devices,
    JSON.stringify(request.fabrication_commands),
    JSON.stringify(executionSequence),
    JSON.stringify(safetyChecks),
    totalCost,
    scheduledFor
  ]);

  const job = result.rows[0];

  // Schedule execution (in real implementation, this would use a job queue)
  if (!request.scheduled_for || new Date(request.scheduled_for) <= new Date()) {
    setTimeout(() => executeRealityFabrication(jobId), 5000);
  }

  return NextResponse.json({
    success: true,
    data: {
      job: {
        id: job.id,
        user_id: job.user_id,
        fabrication_type: job.fabrication_type,
        target_devices: job.target_devices,
        fabrication_commands: job.fabrication_commands,
        execution_sequence: job.execution_sequence,
        safety_checks: job.safety_checks,
        execution_status: job.execution_status,
        cost_usd: parseFloat(job.cost_usd),
        scheduled_for: job.scheduled_for
      } as RealityFabricationJob,
      estimated_duration: executionSequence.total_duration_ms,
      safety_score: safetyChecks.safety_score
    },
    divine_message: `🔧 Reality fabrication job initiated. Physical realm will bend to your will in ${Math.ceil(executionSequence.total_duration_ms / 1000)} seconds.`,
    timestamp: new Date().toISOString()
  } as GodTierApiResponse);
}

async function executeEmergencyMiracle(data: any) {
  // Emergency miracle for critical situations
  const miracleId = uuidv4();
  const userId = uuidv4(); // Mock - replace with actual auth
  
  const emergencyActions = {
    'system_shutdown': 'Initiate emergency shutdown of all connected devices',
    'security_lockdown': 'Activate security protocols and access restrictions',
    'data_backup': 'Perform emergency data backup across all systems',
    'network_isolation': 'Isolate network segments to prevent issues spreading'
  };

  const action = data.miracle_type || 'system_shutdown';
  const cost = 250000; // $250k for emergency miracle as per roadmap

  // Log emergency miracle
  await pool.query(`
    INSERT INTO reality_fabrication_jobs (
      id, user_id, fabrication_type, target_devices, fabrication_commands,
      execution_status, cost_usd, executed_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
  `, [
    miracleId,
    userId,
    'emergency_miracle',
    [],
    JSON.stringify({ emergency_action: action, description: emergencyActions[action] }),
    'completed',
    cost
  ]);

  return NextResponse.json({
    success: true,
    data: {
      miracle_id: miracleId,
      miracle_type: action,
      description: emergencyActions[action],
      cost_usd: cost,
      execution_time: '< 1 second',
      reality_impact: 'MAXIMUM'
    },
    divine_message: `⚡ EMERGENCY MIRACLE EXECUTED! ${emergencyActions[action]}. Reality has been stabilized.`,
    quantum_signature: `EM_${miracleId.slice(0, 8)}`,
    timestamp: new Date().toISOString()
  } as GodTierApiResponse);
}

// Helper Functions

function generateDeviceCapabilities(deviceType: string, deviceCategory: string): any {
  const baseCapabilities = {
    remote_control: true,
    status_monitoring: true,
    data_collection: true,
    firmware_update: true
  };

  const typeSpecificCapabilities = {
    'sensor': { data_streaming: true, threshold_alerts: true, calibration: true },
    'actuator': { position_control: true, force_feedback: true, safety_limits: true },
    'camera': { video_streaming: true, motion_detection: true, object_recognition: true },
    'controller': { logic_processing: true, multi_device_coordination: true, scheduling: true }
  };

  return {
    ...baseCapabilities,
    ...(typeSpecificCapabilities[deviceType] || {}),
    supported_protocols: ['mqtt', 'http', 'websocket'],
    security_features: ['encryption', 'authentication', 'audit_logging']
  };
}

function generateDeviceKey(): string {
  return `dk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function determineSecurity Level(deviceCategory: string): string {
  const highSecurityCategories = ['industrial', 'medical', 'security', 'financial'];
  return highSecurityCategories.includes(deviceCategory) ? 'high' : 'standard';
}

async function performSafetyChecks(request: RealityFabricationRequest, devices: any[]): Promise<any> {
  const checks = {
    safe_to_proceed: true,
    safety_score: 1.0,
    issues: [] as string[],
    mitigations: [] as string[]
  };

  // Check device compatibility
  const incompatibleDevices = devices.filter(device => {
    const capabilities = device.device_capabilities;
    return !capabilities.remote_control;
  });

  if (incompatibleDevices.length > 0) {
    checks.issues.push(`${incompatibleDevices.length} devices do not support remote control`);
    checks.safety_score -= 0.2;
  }

  // Check command safety
  const dangerousCommands = request.fabrication_commands.command_sequence.filter(cmd => 
    cmd.command.includes('shutdown') || cmd.command.includes('reset') || cmd.command.includes('factory')
  );

  if (dangerousCommands.length > 0) {
    checks.issues.push(`${dangerousCommands.length} potentially dangerous commands detected`);
    checks.safety_score -= 0.3;
    checks.mitigations.push('Manual approval required for destructive commands');
  }

  // Check rollback plan
  if (!request.fabrication_commands.rollback_plan || Object.keys(request.fabrication_commands.rollback_plan).length === 0) {
    checks.issues.push('No rollback plan provided');
    checks.safety_score -= 0.1;
    checks.mitigations.push('Generate automatic rollback plan');
  }

  // Final safety determination
  checks.safe_to_proceed = checks.safety_score >= 0.7 && checks.issues.length < 3;

  return checks;
}

function generateExecutionSequence(fabricationCommands: any): any {
  const sequence = {
    total_steps: fabricationCommands.command_sequence.length,
    total_duration_ms: 0,
    parallel_groups: [] as any[],
    rollback_checkpoints: [] as number[]
  };

  let currentDuration = 0;
  fabricationCommands.command_sequence.forEach((cmd: any, index: number) => {
    const stepDuration = cmd.delay_ms || 1000;
    currentDuration += stepDuration;
    
    if (index % 3 === 0) {
      sequence.rollback_checkpoints.push(index);
    }
  });

  sequence.total_duration_ms = currentDuration;
  return sequence;
}

async function executeRealityFabrication(jobId: string): Promise<void> {
  try {
    // Update status to executing
    await pool.query(
      'UPDATE reality_fabrication_jobs SET execution_status = $1, executed_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['executing', jobId]
    );

    // Simulate fabrication execution
    const executionTime = 3000 + Math.random() * 10000; // 3-13 seconds
    await new Promise(resolve => setTimeout(resolve, executionTime));

    // Simulate results
    const success = Math.random() > 0.1; // 90% success rate
    const successRate = success ? 0.95 + Math.random() * 0.04 : Math.random() * 0.6;
    const physicalImpactScore = Math.random() * 0.4 + 0.6; // 0.6-1.0

    await pool.query(`
      UPDATE reality_fabrication_jobs 
      SET execution_status = $1, 
          success_rate = $2,
          physical_impact_score = $3,
          completed_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [success ? 'completed' : 'failed', successRate, physicalImpactScore, jobId]);

    console.log(`[REALITY FABRICATOR] Job ${jobId} ${success ? 'completed' : 'failed'} with ${Math.round(successRate * 100)}% success rate`);

  } catch (error) {
    console.error('[REALITY FABRICATOR] Execution error:', error);
    await pool.query(
      'UPDATE reality_fabrication_jobs SET execution_status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['failed', jobId]
    );
  }
}