import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest, getUserProfile } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const profile = await getUserProfile(user.id);
    
    if (!profile) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}