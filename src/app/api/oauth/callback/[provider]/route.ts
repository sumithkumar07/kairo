import { NextRequest, NextResponse } from 'next/server';
import { OAuthService, OAuthCredentialManager } from '@/lib/oauth';

/**
 * OAuth Callback Handler
 * GET /api/oauth/callback/[provider]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const { searchParams } = new URL(request.url);
    
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description');
      console.error(`OAuth error for ${provider}:`, error, errorDescription);
      
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=${encodeURIComponent(error)}&provider=${provider}`
      );
    }
    
    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=no_code&provider=${provider}`
      );
    }
    
    // TODO: Verify state parameter against stored value
    
    // Exchange authorization code for access token
    const credentials = await OAuthService.exchangeCodeForToken(provider, code, state);
    
    // TODO: Get current user ID from session/JWT
    const userId = 'temp_user_id'; // Replace with actual user ID
    
    // Store credentials in database
    const credentialId = await OAuthCredentialManager.storeCredentials(
      userId,
      provider,
      credentials
    );
    
    // Redirect to success page with provider info
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?success=true&provider=${provider}&credential_id=${credentialId}`
    );
    
  } catch (error) {
    console.error(`OAuth callback error for ${params.provider}:`, error);
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=${encodeURIComponent(error.message)}&provider=${params.provider}`
    );
  }
}