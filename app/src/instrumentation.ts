export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { migrationService } = await import("@/modules/db/migration.service");
        await migrationService.initializeDatabase();
    }
}