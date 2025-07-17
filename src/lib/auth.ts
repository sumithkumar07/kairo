import { NextRequest, NextResponse } from 'next/server';
import { db, hashPassword, verifyPassword, generateSessionToken, isValidEmail } from './database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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

// Session management
export async function createSession(user: User): Promise<string> {
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    },
    JWT_SECRET
  );
  
  return token;
}

export async function verifySession(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    // Get user from database
    const users = await db.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return null;
    }
    
    return users[0];
  } catch (error) {
    console.error('[AUTH] Error verifying session:', error);
    return null;
  }
}

// Client-side authentication functions
export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const token = getCookie('session-token');
  
  if (!token) {
    return null;
  }
  
  return await verifySession(token);
}

export async function getCurrentUserFromRequest(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get('session-token')?.value;
  
  if (!token) {
    return null;
  }
  
  return await verifySession(token);
}

// Authentication functions
export async function signUp(email: string, password: string): Promise<{ user: User; token: string }> {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
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
  
  // Create user
  const users = await db.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email.toLowerCase(), passwordHash]
  );
  
  const user = users[0];
  const token = await createSession(user);
  
  return { user, token };
}

export async function signIn(email: string, password: string): Promise<{ user: User; token: string }> {
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
  });
  
  return { 
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    }, 
    token 
  };
}

export async function signOut(): Promise<void> {
  // Clear cookie on client side
  if (typeof window !== 'undefined') {
    document.cookie = 'session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
}

// Cookie utilities
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function setCookie(name: string, value: string, days = 1): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=lax`;
}

export function clearCookie(name: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

// Middleware helper
export async function withAuth(request: NextRequest): Promise<{ user: User; response?: NextResponse }> {
  const user = await getCurrentUserFromRequest(request);
  
  if (!user) {
    return {
      user: null as any,
      response: NextResponse.redirect(new URL('/login', request.url))
    };
  }
  
  return { user };
}

// Route protection
export function requireAuth(handler: (user: User) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const user = await getCurrentUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return handler(user);
  };
}

// User profile utilities
export async function getUserProfile(userId: string): Promise<{ subscription_tier: string; trial_end_date: string | null } | null> {
  const profiles = await db.query(
    'SELECT subscription_tier, trial_end_date FROM user_profiles WHERE id = $1',
    [userId]
  );
  
  if (profiles.length === 0) {
    return null;
  }
  
  return profiles[0];
}

export async function updateUserProfile(userId: string, data: { subscription_tier?: string; trial_end_date?: string | null }): Promise<void> {
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
  
  if (updates.length === 0) {
    return;
  }
  
  updates.push(`updated_at = NOW()`);
  values.push(userId);
  
  const query = `UPDATE user_profiles SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
  
  await db.query(query, values);
}