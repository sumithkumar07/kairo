import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    // Get user notifications
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
      LIMIT 50
    `, [user.id]);

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read_at !== null,
        createdAt: n.created_at,
        metadata: n.metadata
      }))
    });

  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, title, message, metadata } = await request.json();

    // Create notification
    const result = await db.query(`
      INSERT INTO user_notifications (user_id, type, title, message, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id
    `, [user.id, type, title, message, JSON.stringify(metadata || {})]);

    return NextResponse.json({ 
      success: true, 
      notificationId: result[0].id 
    });

  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId, read } = await request.json();

    // Mark notification as read/unread
    await db.query(`
      UPDATE user_notifications 
      SET read_at = CASE WHEN $3 THEN NOW() ELSE NULL END
      WHERE id = $1 AND user_id = $2
    `, [notificationId, user.id, read]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}