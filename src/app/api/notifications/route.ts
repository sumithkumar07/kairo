import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequestOptimized } from '@/lib/auth-optimized';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const user = await getCurrentUserFromRequestOptimized(request);
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    // Get user notifications with optimized query
    const notifications = await db.query(`
      SELECT 
        id,
        type,
        title,
        message,
        read_at,
        created_at,
        metadata
      FROM user_notifications 
      WHERE user_id = $1
        ${unreadOnly ? 'AND read_at IS NULL' : ''}
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [user.id, limit, offset]);

    // Get total count for pagination
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM user_notifications 
      WHERE user_id = $1 ${unreadOnly ? 'AND read_at IS NULL' : ''}
    `, [user.id]);

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.read_at !== null,
          createdAt: n.created_at,
          metadata: n.metadata || {}
        })),
        pagination: {
          total: parseInt(countResult[0]?.total || '0'),
          limit,
          offset,
          hasMore: (offset + limit) < parseInt(countResult[0]?.total || '0')
        }
      },
      performance: {
        responseTime: `${responseTime}ms`,
        cached: false
      }
    });

  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ 
      success: false,
      error: { 
        message: 'Internal server error', 
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const user = await getCurrentUserFromRequestOptimized(request);
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }
      }, { status: 401 });
    }

    const { type, title, message, metadata } = await request.json();

    if (!type || !title || !message) {
      return NextResponse.json({
        success: false,
        error: { message: 'Type, title, and message are required', code: 'VALIDATION_ERROR' }
      }, { status: 400 });
    }

    // Create notification
    const result = await db.query(`
      INSERT INTO user_notifications (user_id, type, title, message, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, created_at
    `, [user.id, type, title, message, JSON.stringify(metadata || {})]);

    const responseTime = Date.now() - startTime;

    return NextResponse.json({ 
      success: true,
      data: {
        notificationId: result[0].id,
        createdAt: result[0].created_at
      },
      performance: {
        responseTime: `${responseTime}ms`
      }
    });

  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json({ 
      success: false,
      error: { 
        message: 'Internal server error', 
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const user = await getCurrentUserFromRequestOptimized(request);
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }
      }, { status: 401 });
    }

    const { notificationId, read } = await request.json();

    if (!notificationId) {
      return NextResponse.json({
        success: false,
        error: { message: 'Notification ID is required', code: 'VALIDATION_ERROR' }
      }, { status: 400 });
    }

    // Mark notification as read/unread
    const result = await db.query(`
      UPDATE user_notifications 
      SET read_at = CASE WHEN $3 THEN NOW() ELSE NULL END,
          updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING id, read_at
    `, [notificationId, user.id, read]);

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: { message: 'Notification not found', code: 'NOT_FOUND' }
      }, { status: 404 });
    }

    const responseTime = Date.now() - startTime;

    return NextResponse.json({ 
      success: true,
      data: {
        notificationId: result[0].id,
        read: result[0].read_at !== null
      },
      performance: {
        responseTime: `${responseTime}ms`
      }
    });

  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json({ 
      success: false,
      error: { 
        message: 'Internal server error', 
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}