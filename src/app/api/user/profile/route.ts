import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get user profile with subscription data (simplified columns)
    const profileData = await db.query(`
      SELECT 
        up.id,
        up.subscription_tier,
        up.trial_end_date,
        up.monthly_workflow_runs,
        up.monthly_ai_generations,
        up.created_at,
        up.updated_at,
        u.email,
        u.created_at as user_created_at
      FROM user_profiles up 
      JOIN users u ON u.id = up.id 
      WHERE up.id = $1
    `, [user.id]);
    
    if (profileData.length === 0) {
      // Create default profile if it doesn't exist
      await db.query(`
        INSERT INTO user_profiles (id, subscription_tier, trial_end_date)
        VALUES ($1, 'Free', NOW() + interval '15 days')
        ON CONFLICT (id) DO NOTHING
      `, [user.id]);
      
      // Return default profile
      return NextResponse.json({
        id: user.id,
        email: user.email,
        subscription_tier: 'Free',
        trial_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        monthly_workflow_runs: 0,
        monthly_ai_generations: 0,
        last_login_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    const profile = profileData[0];
    
    return NextResponse.json({
      id: profile.id,
      email: profile.email,
      subscription_tier: profile.subscription_tier,
      trial_end_date: profile.trial_end_date,
      monthly_workflow_runs: profile.monthly_workflow_runs,
      monthly_ai_generations: profile.monthly_ai_generations,
      last_login_at: profile.last_login_at,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      user_created_at: profile.user_created_at
    });
  } catch (error: any) {
    console.error('[API] Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch profile', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const updates = await request.json();
    
    // Update user profile
    await db.query(`
      UPDATE user_profiles 
      SET 
        subscription_tier = COALESCE($2, subscription_tier),
        updated_at = NOW()
      WHERE id = $1
    `, [user.id, updates.subscription_tier]);
    
    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('[API] Profile update error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile', error: error.message },
      { status: 500 }
    );
  }
}