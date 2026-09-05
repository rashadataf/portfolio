import { NextResponse } from "next/server";
import { dbService } from "@/modules/db/db.service";
import { setHealthCheckStatus } from "@/app/api/metrics/route";

export async function GET(): Promise<NextResponse> {
  const checks = {
    status: "healthy" as "healthy" | "degraded" | "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: false,
    },
    details: {
      database: {
        connected: false,
        pool: null as Record<string, number> | null,
      },
    },
  };

  // Check database connectivity
  try {
    const isHealthy = await dbService.healthCheck();
    checks.checks.database = isHealthy;
    checks.details.database.connected = isHealthy;
    if (isHealthy) {
      checks.details.database.pool = dbService.getPoolStats();
    }
  } catch (_error) {
    checks.checks.database = false;
    checks.details.database.connected = false;
    checks.status = "unhealthy";
  }

  // Determine overall status
  const allHealthy = Object.values(checks.checks).every(Boolean);
  if (!allHealthy) {
    checks.status = "unhealthy";
  }

  // Update metrics
  setHealthCheckStatus(checks.status);

  const statusCode = checks.status === "healthy" ? 200 : 503;

  return NextResponse.json(checks, { status: statusCode });
}