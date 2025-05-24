// app/lib/auth-helpers.ts - Enhanced version for Next.js 15

import { jwtDecode } from "jwt-decode";
import { auth } from "@/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://pmcs.site");

/**
 * Helper function to refresh the access token using the refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Refresh token failed: ${response.status}`);
    }

    const refreshedTokens = await response.json();

    if (!refreshedTokens.access) {
      throw new Error('Refresh response did not contain access token');
    }

    // Calculate expiry time from JWT
    const decoded = jwtDecode(refreshedTokens.access);
    const expiresAt = decoded.exp ? decoded.exp * 1000 : Date.now() + 60 * 60 * 1000; // Default 1 hour

    return {
      accessToken: refreshedTokens.access,
      refreshToken: refreshedTokens.refresh || refreshToken, // Use new refresh token if provided
      accessTokenExpires: expiresAt,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      error: 'RefreshAccessTokenError',
    };
  }
}

/**
 * Get authentication headers for API requests
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await auth();
    
    if (!session) {
      console.warn('No active session found');
      return { 'Content-Type': 'application/json' };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if we have an access token
    if (session.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    // Add user ID if available
    if (session.user?.id) {
      headers['X-User-ID'] = session.user.id;
    }

    // Add user email for additional identification
    if (session.user?.email) {
      headers['X-User-Email'] = session.user.email;
    }

    return headers;
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return { 'Content-Type': 'application/json' };
  }
}

/**
 * Check if the current session is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await auth();
    return !!session?.user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Get the current user's session
 */
export async function getCurrentSession() {
  try {
    return await auth();
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp ? decoded.exp < currentTime : true;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
}

/**
 * Make an authenticated request to Django backend
 */
export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await getCurrentSession();
  
  if (!session) {
    throw new Error('No authentication session found');
  }

  // Prepare headers
  const headers = new Headers(options.headers);
  
  // Add authentication headers
  if (session.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }
  
  if (session.user?.id) {
    headers.set('X-User-ID', session.user.id);
  }

  // Set default content type if not specified
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const requestOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Include cookies for session management
  };

  try {
    const response = await fetch(url, requestOptions);
    
    // If we get a 401, the token might be expired
    if (response.status === 401 && session.refreshToken) {
      console.log('Access token might be expired, attempting refresh...');
      
      const refreshResult = await refreshAccessToken(session.refreshToken);
      
      if ('error' in refreshResult) {
        throw new Error('Failed to refresh authentication token');
      }
      
      // Retry the request with the new token
      headers.set('Authorization', `Bearer ${refreshResult.accessToken}`);
      return fetch(url, { ...requestOptions, headers });
    }
    
    return response;
  } catch (error) {
    console.error('Error making authenticated request:', error);
    throw error;
  }
}

/**
 * Client-side authentication utilities
 */
export const clientAuth = {
  /**
   * Get stored tokens from localStorage (client-side only)
   */
  getStoredTokens: () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      return accessToken && refreshToken ? { accessToken, refreshToken } : null;
    } catch (error) {
      console.error('Error getting stored tokens:', error);
      return null;
    }
  },

  /**
   * Store tokens in localStorage (client-side only)
   */
  storeTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  },

  /**
   * Clear stored tokens (client-side only)
   */
  clearTokens: () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },

  /**
   * Check if user is authenticated (client-side)
   */
  isAuthenticated: () => {
    const tokens = clientAuth.getStoredTokens();
    return !!(tokens?.accessToken && !isTokenExpired(tokens.accessToken));
  }
};