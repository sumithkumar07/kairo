import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest, invalidateSession, logUserAction } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const token = request.cookies.get('session-token')?.value;
    
    if (user && token) {
      // Log logout action
      await logUserAction(
        user.id,
        'logout',
        'user',
        user.id,
        {},
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || undefined
      );
      
      // Invalidate session in database
      await invalidateSession(request);
    }

    // Create response
    const response = NextResponse.json({
      message: 'Logout successful'
    });

    // Clear the session cookie
    response.cookies.set('session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    return response;
  } catch (error: any) {
    console.error('[AUTH] Logout error:', error);
    
    // Even on error, clear the cookie
    const response = NextResponse.json(
      { message: 'Logout completed' },
      { status: 200 }
    );

    response.cookies.set('session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    return response;
  }
}