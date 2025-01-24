
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { TelemetryService } = await import('@/modules/analytics/telemetry.service');
        const { migrationService } = await import("@/modules/db/migration.service");
        await migrationService.initializeDatabase();
        TelemetryService.getInstance();
    }
}