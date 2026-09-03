import { type NextRequest, NextResponse } from "next/server";

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
};

export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultOptions, ...options };

  return async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
    // Generate key for this client
    const key = opts.keyGenerator 
      ? opts.keyGenerator(request) 
      : request.headers.get("x-forwarded-for") || "anonymous";

    const now = Date.now();

    // Clean up old entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }

    // Get or create rate limit record
    let record = rateLimitStore.get(key);
    if (!record || record.resetTime < now) {
      record = { count: 0, resetTime: now + opts.windowMs };
      rateLimitStore.set(key, record);
    }

    // Increment counter
    record.count++;

    // Check if limit exceeded
    if (record.count > opts.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      
      return new NextResponse(
        JSON.stringify({ 
          error: "Too Many Requests", 
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter 
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": opts.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(record.resetTime / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", opts.maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", (opts.maxRequests - record.count).toString());
    response.headers.set("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000).toString());

    return null; // Continue to next middleware
  };
}

// Pre-configured rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  keyGenerator: (request) => `auth:${request.headers.get("x-forwarded-for") || "anonymous"}`,
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 uploads per hour
});

// Helper to apply rate limiting to a handler
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  limiter: ReturnType<typeof rateLimit>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return handler(request);
  };
}