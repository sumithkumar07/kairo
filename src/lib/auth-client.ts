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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
  
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (!response.ok) {
      // Enhanced error handling for different status codes
      if (response.status === 409) {
        throw new Error('An account with this email already exists. Please try signing in instead.');
      } else if (response.status === 429) {
        throw new Error('Too many signup attempts. Please try again in a few minutes.');
      } else if (response.status >= 500) {
        throw new Error('Server error occurred. Please try again in a moment.');
      }
      throw new Error(data.message || 'Signup failed');
    }
    
    return data.data || data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Signup request timed out. Please check your connection and try again.');
    }
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    
    throw error;
  }
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