import { NextRequest, NextResponse } from 'next/server';
import { signUp, logUserAction } from '@/lib/auth';

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
    
    const result = await signUp(email, password, userAgent || undefined, ipAddress);
    
    // Log successful signup
    await logUserAction(
      result.user.id,
      'signup',
      'user',
      result.user.id,
      { method: 'email_password' },
      ipAddress,
      userAgent || undefined
    );

    // Create response with cookie
    const response = NextResponse.json({
      user: result.user,
      message: 'Account created successfully'
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
    console.error('[AUTH] Signup error:', error);
    
    return NextResponse.json(
      { message: error.message || 'Signup failed' },
      { status: 400 }
    );
  }
}