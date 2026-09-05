import { auth } from "@/lib/auth";
// NOTE: middleware runs on the Edge Runtime, which does not support Node-only
// modules like ioredis. Use the in-memory limiter here; the Redis-backed
// limiter (rate-limit-redis) is for Node.js API routes only.
import { apiRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security headers
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { 
    key: "Content-Security-Policy", 
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  },
];

function applySecurityHeaders(response: NextResponse) {
  securityHeaders.forEach((header) => {
    response.headers.set(header.key, header.value);
  });
  return response;
}

// Chain middleware: rate limit -> auth -> security headers
// Use any to bypass type issues with NextAuth v5 middleware
const authMiddleware = auth as unknown as (request: NextRequest) => Promise<NextResponse | undefined>;

export async function middleware(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rateLimitResponse = await apiRateLimit(request);
    if (rateLimitResponse) {
      return applySecurityHeaders(rateLimitResponse);
    }
  }

  // Run NextAuth middleware
  const authResponse = await authMiddleware(request);
  
  // If auth returns a response (redirect, etc.), apply headers
  if (authResponse) {
    return applySecurityHeaders(authResponse);
  }
  
  // Otherwise, create a response and apply headers
  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};