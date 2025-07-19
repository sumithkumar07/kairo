// Client-side authentication utilities
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// Enhanced client-side authentication functions
export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json'
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

export async function signUp(email: string, password: string): Promise<{ user: User; message: string }> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Signup failed');
  }
  
  return data;
}

export async function signIn(email: string, password: string): Promise<{ user: User; message: string }> {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  
  return data;
}

export async function signOut(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error during logout:', error);
  }
  
  // Force reload to clear any client-side state
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

// Health check function
export async function checkAuthHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}