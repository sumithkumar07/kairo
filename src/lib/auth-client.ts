// Client-side authentication utilities
export interface User {
  id: string;
  email: string;
  created_at: string;
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

// Client-side authentication functions
export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const token = getCookie('session-token');
  
  if (!token) {
    return null;
  }
  
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function signUp(email: string, password: string): Promise<{ user: User; token: string }> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }
  
  return await response.json();
}

export async function signIn(email: string, password: string): Promise<{ user: User; token: string }> {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  return await response.json();
}

export async function signOut(): Promise<void> {
  // Clear cookie on client side
  clearCookie('session-token');
}