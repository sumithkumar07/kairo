import { NextRequest, NextResponse } from 'next/server';
import { signIn, logUserAction } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get client info
    const userAgent = request.headers.get('user-agent');
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const result = await signIn(email, password, userAgent || undefined, ipAddress);
    
    // Log successful signin
    await logUserAction(
      result.user.id,
      'signin',
      'user',
      result.user.id,
      { method: 'email_password' },
      ipAddress,
      userAgent || undefined
    );

    // Create response with cookie
    const response = NextResponse.json({
      user: result.user,
      message: 'Login successful'
    });

    // Set secure HTTP-only cookie
    response.cookies.set('session-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    
    return response;
  } catch (error: any) {
    console.error('[AUTH] Signin error:', error);
    
    return NextResponse.json(
      { message: error.message || 'Login failed' },
      { status: 400 }
    );
  }
}