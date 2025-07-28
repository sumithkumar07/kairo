import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Test basic database connection
    const testResult = await db.query('SELECT 1 as test');
    
    // Count users
    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    
    // Get sample users (without sensitive data)
    const sampleUsers = await db.query('SELECT id, email, created_at FROM users LIMIT 5');
    
    return NextResponse.json({
      success: true,
      data: {
        dbConnected: testResult.length > 0,
        userCount: userCount[0]?.count || 0,
        sampleUsers: sampleUsers || []
      }
    });
  } catch (error: any) {
    console.error('[TEST] Database error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: 'DB_ERROR'
      }
    }, { status: 500 });
  }
}