
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('./instrumentation.node');
        const { migrationService } = await import("@/modules/db/migration.service");
        await migrationService.initializeDatabase();
    }
}