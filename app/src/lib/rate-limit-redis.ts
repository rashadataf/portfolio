import { type NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

// Redis client (singleton)
let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redisClient.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
  }
  return redisClient;
}

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
};

export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultOptions, ...options };

  return async function rateLimitMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    // In development, fall back to in-memory if Redis not available
    if (process.env.NODE_ENV === "development" && !process.env.REDIS_URL) {
      return inMemoryRateLimit(request, opts);
    }

    const redis = getRedisClient();
    
    // Generate key for this client
    const key = opts.keyGenerator
      ? opts.keyGenerator(request)
      : `ratelimit:${request.headers.get("x-forwarded-for") || "anonymous"}`;

    const now = Date.now();
    const windowSec = Math.ceil(opts.windowMs / 1000);
    const windowStart = now - opts.windowMs;

    try {
      // Use Redis sorted set for sliding window rate limiting
      const pipeline = redis.pipeline();
      
      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests in window
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, now, `${now}:${Math.random()}`);
      
      // Set expiry on the key
      pipeline.expire(key, windowSec + 1);
      
      const results = await pipeline.exec();
      
      if (!results) {
        throw new Error("Redis pipeline returned no results");
      }

      const currentCount = (results[1][1] as number) + 1; // +1 for the request we just added

      // Check if limit exceeded
      if (currentCount > opts.maxRequests) {
        // Get the oldest request to calculate retry-after
        const oldestMembers = await redis.zrange(key, "0", "0");
        const retryAfter = oldestMembers.length > 0
          ? (async () => {
              const scoreArray = await redis.zmscore(key, oldestMembers[0]);
              const score = scoreArray[0];
              return Math.ceil((parseInt(score ?? "0") + opts.windowMs - now) / 1000);
            })()
          : windowSec;
          
        // If retryAfter is a promise, await it
        const finalRetryAfter = retryAfter instanceof Promise ? await retryAfter : retryAfter;

        return new NextResponse(
          JSON.stringify({
            error: "Too Many Requests",
            message: `Rate limit exceeded. Try again in ${finalRetryAfter} seconds.`,
            retryAfter: finalRetryAfter,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": finalRetryAfter.toString(),
              "X-RateLimit-Limit": opts.maxRequests.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": Math.ceil((now + opts.windowMs) / 1000).toString(),
            },
          }
        );
      }

      // Add rate limit headers to response
      const response = NextResponse.next();
      response.headers.set("X-RateLimit-Limit", opts.maxRequests.toString());
      response.headers.set(
        "X-RateLimit-Remaining",
        (opts.maxRequests - currentCount).toString()
      );
      response.headers.set(
        "X-RateLimit-Reset",
        Math.ceil((now + opts.windowMs) / 1000).toString()
      );

      return null; // Continue to next middleware
    } catch (error) {
      console.error("Rate limit error, falling back to in-memory:", error);
      // Fallback to in-memory on Redis failure
      return inMemoryRateLimit(request, opts);
    }
  };
}

// In-memory fallback (same as original rate-limit.ts)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

async function inMemoryRateLimit(
  request: NextRequest,
  opts: RateLimitOptions
): Promise<NextResponse | null> {
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
        retryAfter,
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
  response.headers.set(
    "X-RateLimit-Remaining",
    (opts.maxRequests - record.count).toString()
  );
  response.headers.set(
    "X-RateLimit-Reset",
    Math.ceil(record.resetTime / 1000).toString()
  );

  return null;
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

// Graceful shutdown
export async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}