import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance-monitor';
import { apiCache, databaseCache, userCache } from '@/lib/advanced-cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('range') || '30';
    const detailed = searchParams.get('detailed') === 'true';

    // Get current system health
    const systemHealth = performanceMonitor.getSystemHealth();
    
    // Get performance metrics
    const currentMetrics = performanceMonitor.getCurrentMetrics();
    const metricsHistory = performanceMonitor.getMetricsHistory(parseInt(timeRange));
    const apiMetrics = performanceMonitor.getAPIMetrics(parseInt(timeRange));

    // Get cache statistics
    const cacheStats = {
      api: apiCache.getStats(),
      database: databaseCache.getStats(),
      user: userCache.getStats()
    };

    // Calculate trends
    const trends = calculateTrends(metricsHistory);

    const response = {
      timestamp: Date.now(),
      systemHealth,
      currentMetrics,
      trends,
      cacheStats,
      ...(detailed && {
        metricsHistory,
        apiMetrics: apiMetrics.slice(-50), // Last 50 API calls
        recommendations: generateRecommendations(systemHealth, trends, cacheStats)
      })
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[PERFORMANCE API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'reset':
        performanceMonitor.resetStats();
        return NextResponse.json({ message: 'Performance stats reset successfully' });
      
      case 'clear-cache':
        apiCache.clear();
        databaseCache.clear();
        userCache.clear();
        return NextResponse.json({ message: 'All caches cleared successfully' });
      
      case 'warm-cache':
        // Implement cache warming logic here
        return NextResponse.json({ message: 'Cache warming initiated' });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[PERFORMANCE API] Action error:', error);
    return NextResponse.json(
      { error: 'Failed to execute action' },
      { status: 500 }
    );
  }
}

function calculateTrends(metrics: any[]) {
  if (metrics.length < 2) {
    return {
      responseTime: 'stable',
      errorRate: 'stable',
      cacheHitRate: 'stable',
      throughput: 'stable'
    };
  }

  const recent = metrics.slice(-10); // Last 10 metrics
  const older = metrics.slice(-20, -10); // Previous 10 metrics

  const getAverage = (data: any[], key: string) => 
    data.reduce((sum, item) => sum + item[key], 0) / data.length;

  const recentAvg = {
    responseTime: getAverage(recent, 'responseTime'),
    errorRate: getAverage(recent, 'errorRate'),
    cacheHitRate: getAverage(recent, 'cacheHitRate'),
    throughput: getAverage(recent, 'throughput')
  };

  const olderAvg = {
    responseTime: getAverage(older, 'responseTime'),
    errorRate: getAverage(older, 'errorRate'),
    cacheHitRate: getAverage(older, 'cacheHitRate'),
    throughput: getAverage(older, 'throughput')
  };

  const getTrend = (recent: number, older: number, threshold: number = 10) => {
    const change = ((recent - older) / older) * 100;
    if (Math.abs(change) < threshold) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  };

  return {
    responseTime: getTrend(recentAvg.responseTime, olderAvg.responseTime),
    errorRate: getTrend(recentAvg.errorRate, olderAvg.errorRate),
    cacheHitRate: getTrend(recentAvg.cacheHitRate, olderAvg.cacheHitRate),
    throughput: getTrend(recentAvg.throughput, olderAvg.throughput)
  };
}

function generateRecommendations(systemHealth: any, trends: any, cacheStats: any) {
  const recommendations: string[] = [];

  // Performance recommendations
  if (systemHealth.score < 80) {
    recommendations.push('System performance is below optimal. Consider scaling resources.');
  }

  if (trends.responseTime === 'increasing') {
    recommendations.push('Response times are increasing. Check for database slow queries or optimize API endpoints.');
  }

  if (trends.errorRate === 'increasing') {
    recommendations.push('Error rate is rising. Review recent deployments and error logs.');
  }

  // Cache recommendations
  const overallCacheHitRate = Object.values(cacheStats).reduce((sum: number, cache: any) => 
    sum + cache.hitRate, 0) / Object.keys(cacheStats).length;

  if (overallCacheHitRate < 70) {
    recommendations.push('Cache hit rate is low. Consider increasing cache TTL or warming cache with frequently accessed data.');
  }

  // Memory recommendations
  if (systemHealth.details && parseFloat(systemHealth.details.memoryUsage) > 85) {
    recommendations.push('High memory usage detected. Consider clearing caches or optimizing memory-intensive operations.');
  }

  if (recommendations.length === 0) {
    recommendations.push('System is performing well. No immediate optimizations needed.');
  }

  return recommendations;
}