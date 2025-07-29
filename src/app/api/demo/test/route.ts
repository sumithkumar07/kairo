import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';
import { db } from '@/lib/database';
import { performanceMonitor } from '@/lib/real-time-performance';

// POST /api/demo/test - Comprehensive demo account testing
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const testResults: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    overall: 'unknown',
    duration: 0,
    recommendations: []
  };

  try {
    console.log('[DEMO TEST] Starting comprehensive demo account testing...');

    // Test 1: Database Connectivity
    console.log('[DEMO TEST] Testing database connectivity...');
    try {
      const dbStart = Date.now();
      const healthCheck = await db.healthCheck();
      const dbDuration = Date.now() - dbStart;
      
      testResults.tests.push({
        name: 'Database Connectivity',
        status: healthCheck.healthy ? 'PASS' : 'FAIL',
        duration: dbDuration,
        details: healthCheck.details || {}
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Database Connectivity',
        status: 'FAIL',
        error: error.message
      });
    }

    // Test 2: Demo Account Exists
    console.log('[DEMO TEST] Checking demo account existence...');
    try {
      const demoUser = await db.query('SELECT id, email FROM users WHERE email = $1', 
        ['demo.user.2025@kairo.test']);
      
      testResults.tests.push({
        name: 'Demo Account Exists',
        status: demoUser.length > 0 ? 'PASS' : 'FAIL',
        details: {
          found: demoUser.length > 0,
          userId: demoUser[0]?.id,
          email: demoUser[0]?.email
        }
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Demo Account Exists',
        status: 'FAIL',
        error: error.message
      });
    }

    // Test 3: Demo Account Authentication
    console.log('[DEMO TEST] Testing demo account authentication...');
    try {
      const authStart = Date.now();
      const authResult = await signIn('demo.user.2025@kairo.test', 'DemoAccess2025!');
      const authDuration = Date.now() - authStart;
      
      testResults.tests.push({
        name: 'Demo Account Authentication',
        status: authResult.user ? 'PASS' : 'FAIL',
        duration: authDuration,
        details: {
          userId: authResult.user?.id,
          hasToken: !!authResult.token,
          tokenLength: authResult.token?.length || 0
        }
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Demo Account Authentication',
        status: 'FAIL',
        error: error.message
      });
    }

    // Test 4: User Profile Access
    console.log('[DEMO TEST] Testing user profile access...');
    try {
      const profile = await db.query(`
        SELECT up.subscription_tier, up.trial_end_date, u.email 
        FROM user_profiles up 
        JOIN users u ON u.id = up.id 
        WHERE u.email = $1
      `, ['demo.user.2025@kairo.test']);
      
      testResults.tests.push({
        name: 'User Profile Access',
        status: profile.length > 0 ? 'PASS' : 'FAIL',
        details: {
          hasProfile: profile.length > 0,
          subscriptionTier: profile[0]?.subscription_tier,
          trialEndDate: profile[0]?.trial_end_date,
          isTrialActive: profile[0]?.trial_end_date ? new Date(profile[0].trial_end_date) > new Date() : false
        }
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'User Profile Access',
        status: 'FAIL',
        error: error.message
      });
    }

    // Test 5: Performance Metrics
    console.log('[DEMO TEST] Testing performance monitoring...');
    try {
      const perfStart = Date.now();
      const systemHealth = await performanceMonitor.getSystemHealth();
      const latestMetrics = performanceMonitor.getLatestMetrics();
      const perfDuration = Date.now() - perfStart;
      
      testResults.tests.push({
        name: 'Performance Monitoring',
        status: systemHealth.overall !== 'critical' ? 'PASS' : 'FAIL',
        duration: perfDuration,
        details: {
          systemHealth: systemHealth.overall,
          databaseHealthy: systemHealth.database,
          hasMetrics: !!latestMetrics,
          uptime: systemHealth.uptime
        }
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Performance Monitoring',
        status: 'FAIL',
        error: error.message
      });
    }

    // Test 6: Database Pool Health
    console.log('[DEMO TEST] Testing database pool health...');
    try {
      const poolStats = db.getPoolStats();
      const poolHealthy = poolStats.totalCount > 0 && poolStats.utilizationPercent < 90;
      
      testResults.tests.push({
        name: 'Database Pool Health',
        status: poolHealthy ? 'PASS' : 'WARNING',
        details: {
          totalConnections: poolStats.totalCount,
          activeConnections: poolStats.activeCount,
          idleConnections: poolStats.idleCount,
          utilizationPercent: poolStats.utilizationPercent,
          maxSize: poolStats.maxSize
        }
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Database Pool Health',
        status: 'FAIL',
        error: error.message
      });
    }

    // Calculate overall status
    const failedTests = testResults.tests.filter((t: any) => t.status === 'FAIL');
    const warningTests = testResults.tests.filter((t: any) => t.status === 'WARNING');
    
    if (failedTests.length === 0 && warningTests.length === 0) {
      testResults.overall = 'PASS';
    } else if (failedTests.length === 0) {
      testResults.overall = 'WARNING';
    } else {
      testResults.overall = 'FAIL';
    }

    // Generate recommendations
    if (failedTests.length > 0) {
      testResults.recommendations.push('Critical failures detected - immediate attention required');
    }
    if (warningTests.length > 0) {
      testResults.recommendations.push('Performance warnings detected - monitoring recommended');
    }
    if (testResults.overall === 'PASS') {
      testResults.recommendations.push('All systems operational - demo account ready for use');
    }

    testResults.duration = Date.now() - startTime;

    console.log(`[DEMO TEST] Testing completed in ${testResults.duration}ms with status: ${testResults.overall}`);

    return NextResponse.json({
      success: true,
      data: testResults
    });

  } catch (error: any) {
    testResults.duration = Date.now() - startTime;
    testResults.overall = 'ERROR';
    
    console.error('[DEMO TEST] Testing failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Demo testing failed',
        error: error.message,
        data: testResults
      },
      { status: 500 }
    );
  }
}

// GET /api/demo/test - Get demo account status
export async function GET(request: NextRequest) {
  try {
    const demoUser = await db.query(`
      SELECT u.id, u.email, u.created_at, up.subscription_tier, up.trial_end_date,
             up.monthly_workflow_runs, up.monthly_ai_generations
      FROM users u 
      LEFT JOIN user_profiles up ON u.id = up.id 
      WHERE u.email = $1
    `, ['demo.user.2025@kairo.test']);

    if (demoUser.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Demo account not found' },
        { status: 404 }
      );
    }

    const user = demoUser[0];
    const isTrialActive = user.trial_end_date ? new Date(user.trial_end_date) > new Date() : false;

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        subscriptionTier: user.subscription_tier || 'Free',
        trialEndDate: user.trial_end_date,
        isTrialActive,
        monthlyWorkflowRuns: user.monthly_workflow_runs || 0,
        monthlyAiGenerations: user.monthly_ai_generations || 0,
        accountCreated: user.created_at,
        status: 'active'
      }
    });

  } catch (error: any) {
    console.error('[API] Demo status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get demo status', error: error.message },
      { status: 500 }
    );
  }
}