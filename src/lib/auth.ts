import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, hashPassword, verifyPassword } from './database';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

// Enhanced sign up with better error handling
export async function signUp(
  email: string, 
  password: string, 
  userAgent?: string, 
  ipAddress?: string
): Promise<AuthResult> {
  try {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    // Check if user already exists
    const existingUsers = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    
    console.log('[DEBUG] Checking user:', email.trim().toLowerCase(), 'Found:', existingUsers.length);
    
    if (existingUsers.length > 0) {
      throw new Error('An account with this email address already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = uuidv4();

    // Create user with direct queries (simplified for debugging)
    try {
      // Insert user
      await db.query(`
        INSERT INTO users (id, email, password_hash, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
      `, [userId, email.toLowerCase(), passwordHash]);

      // Insert user profile with trial
      await db.query(`
        INSERT INTO user_profiles (id, subscription_tier, trial_end_date, created_at, updated_at)
        VALUES ($1, 'Free', NOW() + interval '15 days', NOW(), NOW())
      `, [userId]);
    } catch (dbError: any) {
      console.error('[AUTH] Database insert error:', dbError);
      
      // Handle specific database errors
      if (dbError.code === '23505') { // Unique violation
        throw new Error('An account with this email address already exists');
      }
      
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Generate JWT token
    const token = jwt.sign({ userId, email: email.toLowerCase() }, JWT_SECRET, { 
      expiresIn: '7d',
      issuer: 'kairo-ai',
      subject: userId,
      audience: 'kairo-users'
    });

    const user: User = {
      id: userId,
      email: email.toLowerCase(),
      created_at: new Date().toISOString()
    };

    // Log the signup for audit
    await logUserAction(userId, 'signup', 'user', userId, {
      method: 'email_password',
      userAgent,
      ipAddress
    }, ipAddress, userAgent);

    return { user, token };
  } catch (error: any) {
    console.error('[AUTH] Signup error:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique violation
      throw new Error('An account with this email address already exists');
    }
    
    throw error;
  }
}

// Enhanced sign in with better error handling
export async function signIn(
  email: string, 
  password: string, 
  userAgent?: string, 
  ipAddress?: string
): Promise<AuthResult> {
  try {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user
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

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { 
      expiresIn: '7d',
      issuer: 'kairo-ai',
      subject: user.id,
      audience: 'kairo-users'
    });

    // Update last login (simplified to avoid column issues)
    try {
      await db.query(`
        UPDATE user_profiles 
        SET updated_at = NOW() 
        WHERE id = $1
      `, [user.id]);
    } catch (updateError) {
      console.warn('[AUTH] Failed to update login time:', updateError);
      // Don't fail signin if this fails
    }

    const userResult: User = {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    };

    // Log the signin for audit
    await logUserAction(user.id, 'signin', 'user', user.id, {
      method: 'email_password',
      userAgent,
      ipAddress
    }, ipAddress, userAgent);

    return { user: userResult, token };
  } catch (error: any) {
    console.error('[AUTH] Signin error:', error);
    throw error;
  }
}

// Enhanced token verification
export async function getCurrentUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    // Get token from cookie
    const token = request.cookies.get('session-token')?.value;
    
    if (!token) {
      return null;
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'kairo-ai',
      audience: 'kairo-users'
    }) as any;
    
    if (!decoded || !decoded.userId) {
      return null;
    }

    // Get user from database to ensure they still exist
    const users = await db.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (users.length === 0) {
      return null;
    }

    return {
      id: users[0].id,
      email: users[0].email,
      created_at: users[0].created_at
    };
  } catch (error: any) {
    console.error('[AUTH] Token verification error:', error);
    return null;
  }
}

// Enhanced audit logging
export async function logUserAction(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await db.query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, details, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `, [userId, action, resourceType, resourceId, ipAddress, userAgent, details ? JSON.stringify(details) : null]);
  } catch (error) {
    console.error('[AUTH] Failed to log user action:', error);
    // Don't throw - logging failure shouldn't break auth flow
  }
}