import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from './database';
import { User } from './auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Cache for user data to reduce database calls
const userCache = new Map<string, { user: User; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes cache

// Optimized getCurrentUserFromRequest with caching
export async function getCurrentUserFromRequestOptimized(request: NextRequest): Promise<User | null> {
  const startTime = Date.now();
  
  try {
    // Get token from cookie
    const token = request.cookies.get('session-token')?.value;
    
    if (!token) {
      return null;
    }

    // Verify JWT first (fast operation)
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'kairo-ai',
      audience: 'kairo-users'
    }) as any;
    
    if (!decoded || !decoded.userId) {
      return null;
    }

    // Check cache first
    const cacheKey = decoded.userId;
    const cached = userCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[AUTH] Cache hit for user ${decoded.userId} - ${Date.now() - startTime}ms`);
      return cached.user;
    }

    // If not in cache or expired, query database
    const users = await db.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (users.length === 0) {
      userCache.delete(cacheKey); // Remove from cache if user doesn't exist
      return null;
    }

    const user: User = {
      id: users[0].id,
      email: users[0].email,
      created_at: users[0].created_at
    };

    // Update cache
    userCache.set(cacheKey, {
      user,
      timestamp: Date.now()
    });

    const executionTime = Date.now() - startTime;
    console.log(`[AUTH] Database query for user ${decoded.userId} - ${executionTime}ms`);
    
    return user;
  } catch (error: any) {
    console.error('[AUTH] Token verification error:', error);
    return null;
  }
}

// Cache cleanup function
export function clearUserCache(userId?: string): void {
  if (userId) {
    userCache.delete(userId);
  } else {
    userCache.clear();
  }
}

// Periodic cache cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      userCache.delete(key);
    }
  }
}, CACHE_TTL);

// Performance monitoring for auth endpoints
export function logAuthPerformance(operation: string, startTime: number): void {
  const executionTime = Date.now() - startTime;
  if (executionTime > 500) {
    console.warn(`[AUTH] Slow ${operation} operation: ${executionTime}ms`);
  }
}