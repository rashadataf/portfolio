import { migrationService } from "@/modules/db/migration.service";

export async function register() {
    await migrationService.initializeDatabase();
}