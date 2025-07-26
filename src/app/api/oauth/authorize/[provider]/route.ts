import { NextRequest, NextResponse } from 'next/server';
import { OAuthService } from '@/lib/oauth';

/**
 * OAuth Authorization Initiation
 * GET /api/oauth/authorize/[provider]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const params = await context.params;
  try {
    const { provider } = params;
    const { searchParams } = new URL(request.url);
    
    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    
    // Store state in session or database for verification
    // For now, we'll include it in the redirect
    
    const authUrl = OAuthService.generateAuthUrl(provider, state);
    
    return NextResponse.json({
      success: true,
      authUrl,
      state,
      provider
    });
    
  } catch (error) {
    console.error('OAuth authorization error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate authorization URL',
        details: error.message 
      },
      { status: 400 }
    );
  }
}