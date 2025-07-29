import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequestOptimized, logAuthPerformance } from '@/lib/auth-optimized';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const user = await getCurrentUserFromRequestOptimized(request);
    
    if (!user) {
      logAuthPerformance('auth/me', startTime);
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    logAuthPerformance('auth/me', startTime);
    
    return NextResponse.json({
      success: true,
      data: user,
      performance: {
        responseTime: `${Date.now() - startTime}ms`,
        cached: true // This will be set by the optimized function
      }
    });
  } catch (error: any) {
    logAuthPerformance('auth/me', startTime);
    console.error('[AUTH/ME] Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          message: error.message || 'Authentication failed',
          code: 'AUTH_ERROR',
          timestamp: new Date().toISOString()
        }
      },
      { status: 401 }
    );
  }
}