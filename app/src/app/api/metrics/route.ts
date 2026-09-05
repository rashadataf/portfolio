import { NextResponse } from "next/server";

// Simple in-memory metrics store (in production, use Prometheus client library)
const metricsStore = {
  httpRequestsTotal: new Map<string, number>(),
  httpRequestDuration: new Map<string, number[]>(),
  activeConnections: 0,
  dbQueriesTotal: 0,
  dbQueryErrors: 0,
  healthCheckStatus: "healthy" as "healthy" | "degraded" | "unhealthy",
};

export async function GET(): Promise<NextResponse> {
  // Collect system metrics
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  // Format metrics in Prometheus exposition format
  const lines: string[] = [
    '# HELP process_uptime_seconds Process uptime in seconds',
    '# TYPE process_uptime_seconds gauge',
    `process_uptime_seconds ${process.uptime()}`,
    '',
    '# HELP process_memory_usage_bytes Memory usage in bytes',
    '# TYPE process_memory_usage_bytes gauge',
    `process_memory_usage_bytes{type="rss"} ${memUsage.rss}`,
    `process_memory_usage_bytes{type="heap_used"} ${memUsage.heapUsed}`,
    `process_memory_usage_bytes{type="heap_total"} ${memUsage.heapTotal}`,
    `process_memory_usage_bytes{type="external"} ${memUsage.external}`,
    '',
    '# HELP process_cpu_usage_seconds_total CPU usage in seconds',
    '# TYPE process_cpu_usage_seconds_total counter',
    `process_cpu_usage_seconds_total{type="user"} ${cpuUsage.user / 1e6}`,
    `process_cpu_usage_seconds_total{type="system"} ${cpuUsage.system / 1e6}`,
    '',
    '# HELP app_http_requests_total Total HTTP requests',
    '# TYPE app_http_requests_total counter',
  ];

  // Add HTTP request metrics
  for (const [key, value] of metricsStore.httpRequestsTotal.entries()) {
    const [method, path, status] = key.split('|');
    lines.push(`app_http_requests_total{method="${method}",path="${path}",status="${status}"} ${value}`);
  }

  lines.push('');
  lines.push('# HELP app_db_queries_total Total database queries');
  lines.push('# TYPE app_db_queries_total counter');
  lines.push(`app_db_queries_total{result="success"} ${metricsStore.dbQueriesTotal - metricsStore.dbQueryErrors}`);
  lines.push(`app_db_queries_total{result="error"} ${metricsStore.dbQueryErrors}`);
  lines.push('');
  lines.push('# HELP app_active_connections Active connections');
  lines.push('# TYPE app_active_connections gauge');
  lines.push(`app_active_connections ${metricsStore.activeConnections}`);
  lines.push('');
  lines.push('# HELP app_health_check_status Health check status (1=healthy, 0=unhealthy)');
  lines.push('# TYPE app_health_check_status gauge');
  lines.push(`app_health_check_status{status="healthy"} ${metricsStore.healthCheckStatus === "healthy" ? 1 : 0}`);
  lines.push(`app_health_check_status{status="unhealthy"} ${metricsStore.healthCheckStatus === "unhealthy" ? 1 : 0}`);

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
    },
  });
}

// Helper functions to record metrics (can be imported by other modules)
export function recordHttpRequest(method: string, path: string, status: number, durationMs: number) {
  const key = `${method}|${path}|${status}`;
  metricsStore.httpRequestsTotal.set(key, (metricsStore.httpRequestsTotal.get(key) || 0) + 1);

  const durations = metricsStore.httpRequestDuration.get(key) || [];
  durations.push(durationMs);
  // Keep only last 100 durations per endpoint
  if (durations.length > 100) durations.shift();
  metricsStore.httpRequestDuration.set(key, durations);
}

export function recordDbQuery(success: boolean) {
  metricsStore.dbQueriesTotal++;
  if (!success) metricsStore.dbQueryErrors++;
}

export function setActiveConnections(count: number) {
  metricsStore.activeConnections = count;
}

export function setHealthCheckStatus(status: "healthy" | "degraded" | "unhealthy") {
  metricsStore.healthCheckStatus = status;
}