import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { performanceMonitor } from '@/lib/real-time-performance';

// GET /api/performance/metrics - Get current performance metrics
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const latest = performanceMonitor.getLatestMetrics();
    const averages = performanceMonitor.getAverageMetrics(5); // Last 5 minutes
    const history = performanceMonitor.getMetricsHistory(20); // Last 20 data points
    const recommendations = performanceMonitor.getOptimizationRecommendations();
    const systemHealth = await performanceMonitor.getSystemHealth();

    return NextResponse.json({
      success: true,
      data: {
        current: latest,
        averages,
        history,
        recommendations,
        systemHealth,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('[API] Performance metrics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch performance metrics',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// POST /api/performance/metrics - Record performance event
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { type, duration, success } = await request.json();

    // Record the performance event
    if (type === 'request') {
      performanceMonitor.recordRequest();
      if (!success) {
        performanceMonitor.recordError();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Performance event recorded'
    });
  } catch (error: any) {
    console.error('[API] Performance event recording error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to record performance event',
        error: error.message 
      },
      { status: 500 }
    );
  }
}