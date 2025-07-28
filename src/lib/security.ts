import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@/lib/validation';

// In-memory store for rate limiting (use Redis in production)
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

class MemoryRateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetTime < now) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key);
    if (entry && entry.resetTime < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  increment(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now();
    const existing = this.get(key);
    
    if (!existing) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
        blocked: false
      };
      this.set(key, newEntry);
      return newEntry;
    }

    existing.count++;
    this.set(key, existing);
    return existing;
  }

  block(key: string, duration: number): void {
    const entry = this.get(key) || { count: 0, resetTime: Date.now(), blocked: false };
    entry.blocked = true;
    entry.resetTime = Math.max(entry.resetTime, Date.now() + duration);
    this.set(key, entry);
  }

  cleanup(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

const rateLimitStore = new MemoryRateLimitStore();

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: NextRequest) => string;
  blockDuration?: number; // Additional blocking time for excessive attempts
}

export function createRateLimiter(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const {
      windowMs,
      max,
      message = 'Too many requests',
      keyGenerator = (req) => {
        const context = getRequestContext(req);
        return context.ipAddress;
      },
      blockDuration = 0
    } = config;

    const key = keyGenerator(request);
    const entry = rateLimitStore.increment(key, windowMs);

    // Check if blocked
    if (entry.blocked && entry.resetTime > Date.now()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'IP temporarily blocked due to excessive requests',
            code: 'IP_BLOCKED',
            retryAfter: Math.ceil((entry.resetTime - Date.now()) / 1000)
          }
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
            'Retry-After': Math.ceil((entry.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Check rate limit
    if (entry.count > max) {
      // Block if configured and exceeded by significant margin
      if (blockDuration > 0 && entry.count > max * 2) {
        rateLimitStore.block(key, blockDuration);
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil((entry.resetTime - Date.now()) / 1000)
          }
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
            'Retry-After': Math.ceil((entry.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Add rate limit headers (will be added in withSecurity wrapper)
    const remaining = Math.max(0, max - entry.count);
    // Store headers in request context for later use
    (request as any).rateLimitHeaders = {
      'X-RateLimit-Limit': max.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': entry.resetTime.toString()
    };

    return null; // Continue processing
  };
}

// Pre-configured rate limiters
export const rateLimiters = {
  // General API rate limiting
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
  }),

  // Strict rate limiting for authentication
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
    blockDuration: 30 * 60 * 1000 // Block for 30 minutes after excessive attempts
  }),

  // AI generation rate limiting
  aiGeneration: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'Too many AI generation requests, please try again later.'
  }),

  // Contact form rate limiting
  contact: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many contact form submissions, please try again later.'
  }),

  // User-specific rate limiting (for authenticated requests)
  userSpecific: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50,
    keyGenerator: (request) => {
      // Extract user ID from JWT token or session
      const authHeader = request.headers.get('authorization');
      const sessionCookie = request.cookies.get('session-token');
      
      if (authHeader || sessionCookie) {
        // In a real implementation, decode the token to get user ID
        return `user:${authHeader || sessionCookie?.value}`;
      }
      
      // Fall back to IP
      const context = getRequestContext(request);
      return `ip:${context.ipAddress}`;
    },
    message: 'Too many requests for this user account.'
  })
};

// Suspicious activity detector
export class SuspiciousActivityDetector {
  private static readonly suspiciousPatterns = [
    /select.*from.*where/i, // SQL injection attempts
    /<script/i, // XSS attempts
    /javascript:/i, // JavaScript protocol
    /\.\.\//g, // Path traversal
    /cmd\.exe|powershell|bash|sh/i, // Command injection
    /union.*select/i, // SQL union attacks
    /exec\s*\(/i, // Code execution attempts
  ];

  static detectSuspiciousRequest(request: NextRequest): boolean {
    const url = request.url;
    const userAgent = request.headers.get('user-agent') || '';
    
    // Check URL for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(url)) {
        return true;
      }
    }

    // Check for suspicious user agents
    const suspiciousUAs = [
      /sqlmap/i,
      /nmap/i,
      /nikto/i,
      /dirb/i,
      /masscan/i,
      /curl/i, // In some contexts, curl might be suspicious
      /wget/i,
      /python-requests/i
    ];

    for (const pattern of suspiciousUAs) {
      if (pattern.test(userAgent)) {
        return true;
      }
    }

    return false;
  }

  static async logSuspiciousActivity(request: NextRequest, reason: string): Promise<void> {
    const context = getRequestContext(request);
    
    try {
      // Log to database and/or external monitoring service
      console.warn('[SECURITY] Suspicious activity detected:', {
        ...context,
        reason,
        severity: 'medium'
      });

      // In production, send to security monitoring service
      // await sendToSecurityService({
      //   type: 'suspicious_activity',
      //   ...context,
      //   reason
      // });
      
    } catch (error) {
      console.error('[SECURITY] Failed to log suspicious activity:', error);
    }
  }
}

// IP blocking utilities
class IPBlocker {
  private blockedIPs = new Set<string>();
  private suspiciousIPs = new Map<string, { count: number; lastSeen: number }>();

  blockIP(ip: string, duration?: number): void {
    this.blockedIPs.add(ip);
    
    if (duration) {
      setTimeout(() => {
        this.blockedIPs.delete(ip);
      }, duration);
    }
  }

  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  markSuspicious(ip: string): void {
    const existing = this.suspiciousIPs.get(ip);
    const now = Date.now();
    
    if (existing) {
      existing.count++;
      existing.lastSeen = now;
      
      // Auto-block after 5 suspicious activities
      if (existing.count >= 5) {
        this.blockIP(ip, 60 * 60 * 1000); // Block for 1 hour
        this.suspiciousIPs.delete(ip);
      }
    } else {
      this.suspiciousIPs.set(ip, { count: 1, lastSeen: now });
    }
  }

  getSuspiciousCount(ip: string): number {
    return this.suspiciousIPs.get(ip)?.count || 0;
  }

  cleanup(): void {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (now - data.lastSeen > oneHour) {
        this.suspiciousIPs.delete(ip);
      }
    }
  }
}

export const ipBlocker = new IPBlocker();

// Security middleware
export async function securityMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const context = getRequestContext(request);

  // Check if IP is blocked
  if (ipBlocker.isBlocked(context.ipAddress)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Access denied',
          code: 'IP_BLOCKED'
        }
      },
      { status: 403 }
    );
  }

  // Detect suspicious activity
  if (SuspiciousActivityDetector.detectSuspiciousRequest(request)) {
    await SuspiciousActivityDetector.logSuspiciousActivity(request, 'Pattern matching');
    ipBlocker.markSuspicious(context.ipAddress);
    
    // Mark as suspicious in request context
    (request as any).suspiciousActivity = true;
  }

  return null; // Continue processing
}

// API route wrapper with security and rate limiting
export function withSecurity(
  handler: (request: NextRequest) => Promise<Response>,
  options: {
    rateLimiter?: (request: NextRequest) => Promise<NextResponse | null>;
    requireAuth?: boolean;
    allowedMethods?: string[];
  } = {}
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      // Check allowed methods
      if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Method ${request.method} not allowed`,
              code: 'METHOD_NOT_ALLOWED'
            }
          },
          { status: 405 }
        );
      }

      // Apply security middleware
      const securityResponse = await securityMiddleware(request);
      if (securityResponse) {
        return securityResponse;
      }

      // Apply rate limiting
      if (options.rateLimiter) {
        const rateLimitResponse = await options.rateLimiter(request);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
      }

      // Apply authentication if required
      if (options.requireAuth) {
        const { getCurrentUserFromRequest } = await import('@/lib/auth');
        const user = await getCurrentUserFromRequest(request);
        
        if (!user) {
          return NextResponse.json(
            {
              success: false,
              error: {
                message: 'Authentication required',
                code: 'UNAUTHORIZED'
              }
            },
            { status: 401 }
          );
        }
      }

      // Execute the handler
      const response = await handler(request);
      
      // Add rate limit headers if they exist
      const rateLimitHeaders = (request as any).rateLimitHeaders;
      if (rateLimitHeaders && response instanceof NextResponse) {
        Object.entries(rateLimitHeaders).forEach(([key, value]) => {
          response.headers.set(key, value as string);
        });
      }
      
      // Add suspicious activity header if detected
      if ((request as any).suspiciousActivity && response instanceof NextResponse) {
        response.headers.set('X-Suspicious-Activity', 'detected');
      }
      
      return response;
      
    } catch (error) {
      console.error('[API] Unhandled error:', error);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR'
          }
        },
        { status: 500 }
      );
    }
  };
}

// Cleanup function for graceful shutdown
export function cleanup(): void {
  rateLimitStore.cleanup();
  ipBlocker.cleanup();
}