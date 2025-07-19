import { NextRequest, NextResponse } from 'next/server';
import { db, hashPassword, verifyPassword, generateSessionToken, isValidEmail } from './database-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Session {
  user: User;
  token: string;
  expires_at: Date;
}

// Enhanced session management with database storage
export async function createSession(user: User, userAgent?: string, ipAddress?: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  // Create JWT token
  const jwtToken = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      sessionToken: token,
      exp: Math.floor(expiresAt.getTime() / 1000)
    },
    JWT_SECRET
  );

  // Store session in database
  await db.query(
    `INSERT INTO user_sessions (user_id, token_hash, expires_at, user_agent, ip_address) 
     VALUES ($1, $2, $3, $4, $5)`,
    [user.id, token, expiresAt, userAgent, ipAddress]
  );
  
  return jwtToken;
}

export async function verifySession(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    // Verify session exists in database and is not expired
    const sessions = await db.query(
      `SELECT s.user_id, u.email, u.created_at 
       FROM user_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
      [decoded.sessionToken]
    );
    
    if (sessions.length === 0) {
      return null;
    }

    // Update last accessed time
    await db.query(
      `UPDATE user_sessions SET last_accessed = NOW() WHERE token_hash = $1`,
      [decoded.sessionToken]
    );
    
    return {
      id: sessions[0].user_id,
      email: sessions[0].email,
      created_at: sessions[0].created_at
    };
  } catch (error) {
    console.error('[AUTH] Error verifying session:', error);
    return null;
  }
}

export async function getCurrentUserFromRequest(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get('session-token')?.value;
  
  if (!token) {
    return null;
  }
  
  return await verifySession(token);
}

export async function invalidateSession(token: string): Promise<void> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    await db.query(
      `DELETE FROM user_sessions WHERE token_hash = $1`,
      [decoded.sessionToken]
    );
  } catch (error) {
    console.error('[AUTH] Error invalidating session:', error);
  }
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  try {
    await db.query(
      `DELETE FROM user_sessions WHERE user_id = $1`,
      [userId]
    );
  } catch (error) {
    console.error('[AUTH] Error invalidating user sessions:', error);
  }
}

// Enhanced authentication functions
export async function signUp(email: string, password: string, userAgent?: string, ipAddress?: string): Promise<{ user: User; token: string }> {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Password strength validation
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }
  
  // Check if user already exists
  const existingUsers = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  
  if (existingUsers.length > 0) {
    throw new Error('User already exists with this email');
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Create user in transaction
  const result = await db.transaction(async (client) => {
    const users = await client.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email.toLowerCase(), passwordHash]
    );
    
    const user = users.rows[0];
    
    // Create session
    const token = await createSession(user, userAgent, ipAddress);
    
    return { user, token };
  });
  
  return result;
}

export async function signIn(email: string, password: string, userAgent?: string, ipAddress?: string): Promise<{ user: User; token: string }> {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  // Get user with password
  const users = await db.query(
    'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  
  if (users.length === 0) {
    throw new Error('Invalid email or password');
  }
  
  const user = users[0];
  
  // Verify password
  const isValidPassword = await verifyPassword(password, user.password_hash);
  
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }
  
  // Create session
  const token = await createSession({
    id: user.id,
    email: user.email,
    created_at: user.created_at
  }, userAgent, ipAddress);
  
  return { 
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    }, 
    token 
  };
}

// Route protection with enhanced security
export function requireAuth(handler: (user: User) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const user = await getCurrentUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return handler(user);
  };
}

// User profile utilities with caching
const profileCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getUserProfile(userId: string): Promise<{ 
  subscription_tier: string; 
  trial_end_date: string | null;
  monthly_workflow_runs: number;
  monthly_ai_generations: number;
} | null> {
  // Check cache first
  const cacheKey = `profile_${userId}`;
  const cached = profileCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const profiles = await db.query(
    `SELECT subscription_tier, trial_end_date, monthly_workflow_runs, monthly_ai_generations 
     FROM user_profiles WHERE id = $1`,
    [userId]
  );
  
  if (profiles.length === 0) {
    return null;
  }

  const profile = profiles[0];
  
  // Cache the result
  profileCache.set(cacheKey, {
    data: profile,
    timestamp: Date.now()
  });
  
  return profile;
}

export async function updateUserProfile(userId: string, data: { 
  subscription_tier?: string; 
  trial_end_date?: string | null;
  monthly_workflow_runs?: number;
  monthly_ai_generations?: number;
}): Promise<void> {
  const updates = [];
  const values = [];
  let paramIndex = 1;
  
  if (data.subscription_tier) {
    updates.push(`subscription_tier = $${paramIndex++}`);
    values.push(data.subscription_tier);
  }
  
  if (data.trial_end_date !== undefined) {
    updates.push(`trial_end_date = $${paramIndex++}`);
    values.push(data.trial_end_date);
  }

  if (data.monthly_workflow_runs !== undefined) {
    updates.push(`monthly_workflow_runs = $${paramIndex++}`);
    values.push(data.monthly_workflow_runs);
  }

  if (data.monthly_ai_generations !== undefined) {
    updates.push(`monthly_ai_generations = $${paramIndex++}`);
    values.push(data.monthly_ai_generations);
  }
  
  if (updates.length === 0) {
    return;
  }
  
  updates.push(`updated_at = NOW()`);
  values.push(userId);
  
  const query = `UPDATE user_profiles SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
  
  await db.query(query, values);
  
  // Clear cache
  profileCache.delete(`profile_${userId}`);
}

// Audit logging for CARES framework
export async function logUserAction(
  userId: string | null,
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, action, resourceType, resourceId, JSON.stringify(details), ipAddress, userAgent]
    );
  } catch (error) {
    console.error('[AUTH] Error logging user action:', error);
  }
}

// Session cleanup function
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const result = await db.query(`DELETE FROM user_sessions WHERE expires_at < NOW()`);
    console.log(`[AUTH] Cleaned up ${result.length} expired sessions`);
  } catch (error) {
    console.error('[AUTH] Error cleaning up expired sessions:', error);
  }
}