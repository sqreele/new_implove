// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse, NextRequest } from 'next/server';

// Constants for better maintainability
const SIGN_IN_PATH = '/auth/signin';
const ERROR_TYPES = {
  SESSION_EXPIRED: 'session_expired',
  ACCESS_DENIED: 'access_denied'
} as const;

// Helper function to create redirect URL with proper error handling
function createSignInRedirect(req: NextRequest, error?: string): NextResponse {
  const signInUrl = new URL(SIGN_IN_PATH, req.url);
  
  if (error) {
    signInUrl.searchParams.set('error', error);
  }
  
  // Preserve the original URL for post-login redirect
  signInUrl.searchParams.set('callbackUrl', encodeURIComponent(req.url));
  
  return NextResponse.redirect(signInUrl);
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    
    // Handle various token error states
    if (token?.error) {
      switch (token.error) {
        case 'RefreshAccessTokenError':
          return createSignInRedirect(req, ERROR_TYPES.SESSION_EXPIRED);
        
        case 'OAuthAccountNotLinked':
        case 'AccessDenied':
          return createSignInRedirect(req, ERROR_TYPES.ACCESS_DENIED);
        
        default:
          // Log unknown errors for debugging (consider using proper logging service)
          console.warn('Unknown token error:', token.error);
          return createSignInRedirect(req, ERROR_TYPES.SESSION_EXPIRED);
      }
    }
    
    // Optional: Add role-based access control
    // Example: Restrict admin routes to admin users
    if (req.nextUrl.pathname.startsWith('/admin') && token?.role !== 'admin') {
      return createSignInRedirect(req, ERROR_TYPES.ACCESS_DENIED);
    }
    
    // Optional: Add session expiry check
    if (token?.exp && Date.now() >= token.exp * 1000) {
      return createSignInRedirect(req, ERROR_TYPES.SESSION_EXPIRED);
    }
    
    // Add security headers
    const response = NextResponse.next();
    
    // Prevent embedding in frames (clickjacking protection)
    response.headers.set('X-Frame-Options', 'DENY');
    
    // XSS protection
    response.headers.set('X-Content-Type-Options', 'nosniff');
    
    // Add user info to headers for easier access in components (optional)
    if (token?.sub) {
      response.headers.set('X-User-ID', token.sub);
    }
    
    return response;
  },
  {
    callbacks: {
      // More robust authorization check
      authorized: ({ token, req }) => {
        // Allow access if token exists and is not expired
        if (!token) return false;
        
        // Check for token errors
        if (token.error) return false;
        
        // Optional: Additional authorization logic
        // Example: Check if user has required permissions for specific routes
        const pathname = req.nextUrl.pathname;
        
        if (pathname.startsWith('/admin') && token.role !== 'admin') {
          return false;
        }
        
        return true;
      },
    },
    pages: {
      signIn: SIGN_IN_PATH,
      error: '/auth/error', // Custom error page
    },
  }
);

// Improved matcher with more specific patterns
export const config = {
  matcher: [
    // Protected dashboard routes
    '/dashboard/:path*',
    '/profile/:path*',
    
    // Admin routes (if you have them)
    '/admin/:path*',
    
    // API routes that need authentication
    '/api/user/:path*',
    '/api/protected/:path*',
    
    // Exclude static files and public routes
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|auth/signin|auth/error).*)',
  ],
};

// Optional: Export types for better TypeScript support
export interface ExtendedToken {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  error?: string;
}