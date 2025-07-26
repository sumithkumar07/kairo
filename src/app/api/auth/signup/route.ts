import { NextRequest, NextResponse } from 'next/server';
import { signUp, logUserAction } from '@/lib/auth';
import { validateRequest, schemas, APIResponse } from '@/lib/validation';
import { withSecurity, rateLimiters } from '@/lib/security';

async function handleSignup(request: NextRequest) {
  try {
    // Validate request data
    const validation = await validateRequest(schemas.signup)(request);
    if (validation.error) {
      return APIResponse.validation([validation.error]);
    }

    const { email, password, name, company } = validation.data;

    // Get client info for security logging
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
      { 
        method: 'email_password',
        name: name || undefined,
        company: company || undefined
      },
      ipAddress,
      userAgent || undefined
    );

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: result.user,
        message: 'Account created successfully'
      }
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
    
    return APIResponse.error(
      error.message || 'Signup failed',
      'SIGNUP_FAILED',
      400,
      { originalError: process.env.NODE_ENV === 'development' ? error.stack : undefined }
    );
  }
}

export const POST = withSecurity(handleSignup, {
  rateLimiter: rateLimiters.auth,
  allowedMethods: ['POST']
});