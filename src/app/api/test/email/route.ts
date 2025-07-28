import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: { message: 'Email is required' }
      }, { status: 400 });
    }
    
    // Check if user exists
    const existingUsers = await db.query('SELECT id, email FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    
    return NextResponse.json({
      success: true,
      data: {
        email: email.trim().toLowerCase(),
        exists: existingUsers.length > 0,
        found: existingUsers
      }
    });
  } catch (error: any) {
    console.error('[TEST] Email check error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        details: error.detail
      }
    }, { status: 500 });
  }
}