import { handlers } from "@/lib/auth";
import { authRateLimit } from "@/lib/rate-limit";
import { type NextRequest } from "next/server";

const { GET: originalGET, POST: originalPOST } = handlers;

export async function GET(request: NextRequest) {
  const rateLimitResponse = await authRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  return originalGET(request);
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await authRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  return originalPOST(request);
}