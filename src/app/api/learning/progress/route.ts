import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's learning progress
    const progress = await db.query(`
      SELECT 
        course_id,
        progress_percentage,
        completed_modules,
        total_modules,
        last_accessed
      FROM user_learning_progress 
      WHERE user_id = $1
    `, [user.id]);

    // Get completed certifications
    const certifications = await db.query(`
      SELECT 
        certification_id,
        earned_date,
        score
      FROM user_certifications 
      WHERE user_id = $1
    `, [user.id]);

    return NextResponse.json({
      progress: progress.map(p => ({
        courseId: p.course_id,
        progress: p.progress_percentage,
        completedModules: p.completed_modules,
        totalModules: p.total_modules,
        lastAccessed: p.last_accessed
      })),
      certifications: certifications.map(c => ({
        certificationId: c.certification_id,
        earnedDate: c.earned_date,
        score: c.score
      }))
    });

  } catch (error) {
    console.error('Learning progress API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, moduleId, completed } = await request.json();

    // Update learning progress
    await db.query(`
      INSERT INTO user_learning_progress (user_id, course_id, completed_modules, last_accessed)
      VALUES ($1, $2, ARRAY[$3], NOW())
      ON CONFLICT (user_id, course_id)
      DO UPDATE SET 
        completed_modules = CASE 
          WHEN $4 THEN array_append(user_learning_progress.completed_modules, $3)
          ELSE array_remove(user_learning_progress.completed_modules, $3)
        END,
        last_accessed = NOW()
    `, [user.id, courseId, moduleId, completed]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Learning progress update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}