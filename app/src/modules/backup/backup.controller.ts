'use server';

import fs from "fs/promises";
import path from "path";
import { isAdmin } from "@/lib/auth";
import { logger } from "@/lib/logger";

export interface BackupMeta {
    filename: string;
    size: number;
    createdAt: string;
}

export interface BackupLogEntry {
    timestamp: string;
    message: string;
}

const BACKUP_DIR = process.env.BACKUP_DIR || "/backups";
const BACKUP_LOG_FILE = path.join(BACKUP_DIR, "backup.log");

// Backups are created by the backup container as postgres_<db>_<timestamp>.sql.gz
const BACKUP_FILENAME_PATTERN = /^postgres_[a-zA-Z0-9_]+_\d{8}_\d{6}\.sql\.gz$/;

function extractSafeBackupFilename(filename: string) {
    // Prevent path traversal — only allow the exact backup filename pattern
    const safe = path.basename(filename);
    if (safe !== filename || !BACKUP_FILENAME_PATTERN.test(safe)) {
        throw new Error("Invalid backup filename");
    }
    return safe;
}

export async function listBackups() {
    try {
        await isAdmin();

        await fs.mkdir(BACKUP_DIR, { recursive: true });
        const dirents = await fs.readdir(BACKUP_DIR, { withFileTypes: true });

        const backups = await Promise.all(
            dirents
                .filter((d) => d.isFile() && BACKUP_FILENAME_PATTERN.test(d.name))
                .map(async (d) => {
                    const filePath = path.join(BACKUP_DIR, d.name);
                    const stat = await fs.stat(filePath);
                    const meta: BackupMeta = {
                        filename: d.name,
                        size: stat.size,
                        createdAt: stat.mtime.toISOString(),
                    };
                    return meta;
                })
        );

        // Newest first
        backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return { success: true, data: backups } as const;
    } catch (error) {
        logger.error("Error listing backups", { error: (error as Error).message });
        return { success: false, error: "Error listing backups" } as const;
    }
}

export async function getBackupFile(filename: string) {
    try {
        await isAdmin();
        const safe = extractSafeBackupFilename(filename);
        const filePath = path.join(BACKUP_DIR, safe);
        const buffer = await fs.readFile(filePath);
        return { success: true, data: buffer } as const;
    } catch (error) {
        const code = (error as NodeJS.ErrnoException | undefined)?.code;
        if (code === "ENOENT") {
            return { success: false, error: "Backup not found" } as const;
        }
        logger.error("Error reading backup", { error: (error as Error).message });
        return { success: false, error: "Error reading backup" } as const;
    }
}

export async function getBackupLog() {
    try {
        await isAdmin();
        const content = await fs.readFile(BACKUP_LOG_FILE, "utf-8");
        const lines = content.trim().split("\n").filter(Boolean);
        // Return the last 100 entries, newest last
        const entries: BackupLogEntry[] = lines.slice(-100).map((line) => {
            const match = line.match(/^\[(.+?)\]\s(.*)$/);
            return {
                timestamp: match ? match[1] : "",
                message: match ? match[2] : line,
            };
        });
        return { success: true, data: entries } as const;
    } catch (error) {
        const code = (error as NodeJS.ErrnoException | undefined)?.code;
        if (code === "ENOENT") {
            return { success: true, data: [] as BackupLogEntry[] } as const;
        }
        logger.error("Error reading backup log", { error: (error as Error).message });
        return { success: false, error: "Error reading backup log" } as const;
    }
}

export async function deleteBackup(filename: string) {
    try {
        await isAdmin();
        const safe = extractSafeBackupFilename(filename);
        const filePath = path.join(BACKUP_DIR, safe);
        await fs.unlink(filePath);
        return { success: true } as const;
    } catch (error) {
        const code = (error as NodeJS.ErrnoException | undefined)?.code;
        if (code === "ENOENT") {
            return { success: false, error: "Backup not found" } as const;
        }
        logger.error("Error deleting backup", { error: (error as Error).message });
        return { success: false, error: "Error deleting backup" } as const;
    }
}

export async function restoreBackup(filename: string) {
    try {
        await isAdmin();
        const safe = extractSafeBackupFilename(filename);
        const filePath = path.join(BACKUP_DIR, safe);

        // Verify the file exists before attempting restore
        await fs.access(filePath);

        // Parse DATABASE_URL for psql connection
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error("DATABASE_URL is not configured");
        }

        // Restore: gunzip the backup and pipe into psql
        // --set ON_ERROR_STOP=1 makes psql exit on first error instead of continuing
        // NOTE: DATABASE_URL is expanded by the shell from the inherited environment,
        // NOT interpolated in JS — this keeps the password out of error messages/logs.
        const { execFile } = await import("child_process");
        const { promisify } = await import("util");
        const execFileAsync = promisify(execFile);

        const result = await execFileAsync(
            "sh",
            [
                "-c",
                `gunzip -c "${filePath}" | psql --set ON_ERROR_STOP=1 --quiet --no-psqlrc "$DATABASE_URL"`,
            ],
            { timeout: 300000 } // 5 minute timeout
        );

        logger.info("Backup restored successfully", { filename: safe });
        return { success: true, output: result.stdout } as const;
    } catch (error) {
        logger.error("Error restoring backup", { error: (error as Error).message });
        return { success: false, error: `Restore failed: ${(error as Error).message}` } as const;
    }
}

/**
 * Force an immediate backup without affecting the nightly 02:00 UTC schedule.
 * Writes a trigger file into the shared /backups volume; the backup container's
 * scheduler picks it up within ~30 seconds and runs a backup, then removes it.
 */
export async function triggerBackupNow() {
    try {
        await isAdmin();

        const triggerFile = path.join(BACKUP_DIR, "trigger");
        await fs.writeFile(triggerFile, `${new Date().toISOString()}\n`);
        logger.info("Manual backup triggered from dashboard");
        return { success: true } as const;
    } catch (error) {
        logger.error("Error triggering backup", { error: (error as Error).message });
        return { success: false, error: "Error triggering backup" } as const;
    }
}
