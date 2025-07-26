import { NextRequest } from 'next/server';
import { performHealthCheck } from '@/lib/validation';
import { APIResponse } from '@/lib/validation';
import { withSecurity, rateLimiters } from '@/lib/security';

async function handleHealthCheck(request: NextRequest) {
  try {
    const healthResult = await performHealthCheck();
    
    // Return appropriate status code based on health
    const status = healthResult.status === 'healthy' ? 200 : 
                   healthResult.status === 'degraded' ? 206 : 503;
    
    return APIResponse.success(healthResult, 'Health check completed', status);
  } catch (error) {
    console.error('[HEALTH] Health check failed:', error);
    
    return APIResponse.error(
      'Health check failed',
      'HEALTH_CHECK_ERROR',
      503,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withSecurity(handleHealthCheck, {
  rateLimiter: rateLimiters.general,
  allowedMethods: ['GET']
});