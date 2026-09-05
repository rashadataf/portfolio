
export async function register() {
    // IMPORTANT: All imports must be dynamic and inside the nodejs branch.
    // instrumentation.ts is compiled for BOTH the Node.js and Edge runtimes.
    // Static imports of Node-only modules (process signals, ioredis, pg, etc.)
    // break the Edge build. Dynamic imports keep them out of the Edge bundle.
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { setupGracefulShutdown } = await import('@/lib/graceful-shutdown');
        const { logger } = await import('@/lib/logger');
        const { TelemetryService } = await import('@/modules/analytics/telemetry.service');
        const { migrationService } = await import("@/modules/db/migration.service");

        // Setup graceful shutdown
        setupGracefulShutdown(async () => {
            logger.info('Shutting down telemetry and database connections...');
            await TelemetryService.getInstance().shutdown();
        });

        await migrationService.initializeDatabase();
        TelemetryService.getInstance();

        logger.info('Application instrumentation initialized');
    }
}