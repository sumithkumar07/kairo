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
    const courseId = searchParams.get('courseId');

    let progressQuery = `
      SELECT 
        course_id,
        progress_percentage,
        completed_modules,
        total_modules,
        last_accessed,
        created_at,
        updated_at
      FROM user_learning_progress 
      WHERE user_id = $1
    `;
    
    const params = [user.id];
    
    if (courseId) {
      progressQuery += ` AND course_id = $2`;
      params.push(courseId);
    }
    
    progressQuery += ` ORDER BY last_accessed DESC`;

    // Get user's learning progress
    const progress = await db.query(progressQuery, params);

    // Get completed certifications
    const certifications = await db.query(`
      SELECT 
        certification_id,
        earned_date,
        score,
        certificate_url
      FROM user_certifications 
      WHERE user_id = $1
      ORDER BY earned_date DESC
    `, [user.id]);

    // Calculate overall statistics
    const totalCourses = progress.length;
    const completedCourses = progress.filter(p => p.progress_percentage >= 100).length;
    const averageProgress = totalCourses > 0 
      ? Math.round(progress.reduce((sum, p) => sum + p.progress_percentage, 0) / totalCourses)
      : 0;

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        progress: progress.map(p => ({
          courseId: p.course_id,
          progress: p.progress_percentage,
          completedModules: p.completed_modules || [],
          totalModules: p.total_modules || 0,
          lastAccessed: p.last_accessed,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        })),
        certifications: certifications.map(c => ({
          certificationId: c.certification_id,
          earnedDate: c.earned_date,
          score: c.score,
          certificateUrl: c.certificate_url
        })),
        statistics: {
          totalCourses,
          completedCourses,
          averageProgress,
          totalCertifications: certifications.length
        }
      },
      performance: {
        responseTime: `${responseTime}ms`,
        cached: false
      }
    });

  } catch (error) {
    console.error('Learning progress API error:', error);
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

    const { courseId, moduleId, completed, totalModules } = await request.json();

    if (!courseId || !moduleId || typeof completed !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: { message: 'Course ID, module ID, and completed status are required', code: 'VALIDATION_ERROR' }
      }, { status: 400 });
    }

    // Update learning progress with transaction for consistency
    const result = await db.query(`
      WITH upsert AS (
        INSERT INTO user_learning_progress (user_id, course_id, completed_modules, total_modules, last_accessed)
        VALUES ($1, $2, ARRAY[$3], $5, NOW())
        ON CONFLICT (user_id, course_id)
        DO UPDATE SET 
          completed_modules = CASE 
            WHEN $4 THEN 
              CASE 
                WHEN $3 = ANY(user_learning_progress.completed_modules) THEN user_learning_progress.completed_modules
                ELSE array_append(user_learning_progress.completed_modules, $3)
              END
            ELSE array_remove(user_learning_progress.completed_modules, $3)
          END,
          total_modules = GREATEST(user_learning_progress.total_modules, $5),
          last_accessed = NOW(),
          updated_at = NOW()
        RETURNING *
      )
      UPDATE user_learning_progress
      SET progress_percentage = CASE 
        WHEN total_modules > 0 THEN LEAST(100, ROUND((array_length(completed_modules, 1) * 100.0) / total_modules))
        ELSE 0
      END
      FROM upsert
      WHERE user_learning_progress.user_id = upsert.user_id 
        AND user_learning_progress.course_id = upsert.course_id
      RETURNING user_learning_progress.*, upsert.completed_modules as new_completed_modules
    `, [user.id, courseId, moduleId, completed, totalModules || 0]);

    const responseTime = Date.now() - startTime;

    return NextResponse.json({ 
      success: true,
      data: {
        courseId,
        moduleId,
        completed,
        progress: result[0]?.progress_percentage || 0,
        completedModules: result[0]?.new_completed_modules || []
      },
      performance: {
        responseTime: `${responseTime}ms`
      }
    });

  } catch (error) {
    console.error('Learning progress update error:', error);
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

// New endpoint for earning certifications
export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const user = await getCurrentUserFromRequestOptimized(request);
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }
      }, { status: 401 });
    }

    const { certificationId, score, certificateUrl } = await request.json();

    if (!certificationId || typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json({
        success: false,
        error: { message: 'Valid certification ID and score (0-100) are required', code: 'VALIDATION_ERROR' }
      }, { status: 400 });
    }

    // Award certification
    const result = await db.query(`
      INSERT INTO user_certifications (user_id, certification_id, score, certificate_url, earned_date)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, certification_id)
      DO UPDATE SET 
        score = GREATEST(user_certifications.score, $3),
        certificate_url = COALESCE($4, user_certifications.certificate_url),
        earned_date = NOW()
      RETURNING *
    `, [user.id, certificationId, score, certificateUrl]);

    const responseTime = Date.now() - startTime;

    return NextResponse.json({ 
      success: true,
      data: {
        certificationId: result[0].certification_id,
        score: result[0].score,
        earnedDate: result[0].earned_date,
        certificateUrl: result[0].certificate_url
      },
      performance: {
        responseTime: `${responseTime}ms`
      }
    });

  } catch (error) {
    console.error('Certification award error:', error);
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