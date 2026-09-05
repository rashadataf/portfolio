#!/bin/bash
# Simple backup scheduler — replaces dcron to avoid setpgid issues in Docker.
# Runs an infinite loop: wait until 02:00 UTC, run backup, repeat.
# Also watches for a trigger file (/backups/trigger) so the admin dashboard
# can force an immediate backup without affecting the nightly schedule.
set -euo pipefail

BACKUP_SCRIPT="/usr/local/bin/backup-postgres.sh"
# Log to the shared /backups volume so the app container can read it
LOG_FILE="/backups/backup.log"
TRIGGER_FILE="/backups/trigger"

log() {
    echo "[$(date -u +"%Y-%m-%d %H:%M:%S UTC")] $*" | tee -a "${LOG_FILE}"
}

run_backup() {
    log "Triggering backup..."
    if su backup -s /bin/bash -c "${BACKUP_SCRIPT}" >> "${LOG_FILE}" 2>&1; then
        log "Backup trigger completed successfully."
    else
        log "ERROR: Backup trigger failed with exit code $?"
    fi
}

# Fix /backups ownership (Docker volumes mount as root:root by default).
# chmod 777 lets the app container (which runs as a different UID) write the
# trigger file and delete backup files via the admin dashboard. The volume is
# only mounted by the backup and app containers, so this is acceptable here.
if [[ -d /backups ]]; then
    chown backup:backup /backups
    chmod 777 /backups
fi

log "Backup scheduler started. Nightly backup at 02:00 UTC. Watching for trigger file."

while true; do
    # --- Manual trigger check (runs every loop iteration) ---
    if [[ -f "${TRIGGER_FILE}" ]]; then
        log "Manual backup trigger detected."
        rm -f "${TRIGGER_FILE}"
        run_backup
    fi

    # Calculate seconds until next 02:00 UTC
    CURRENT_HOUR=$(date -u +"%H")
    CURRENT_MIN=$(date -u +"%M")
    CURRENT_SEC=$(date -u +"%S")

    TARGET_HOUR=2
    SECONDS_NOW=$((CURRENT_HOUR * 3600 + CURRENT_MIN * 60 + CURRENT_SEC))
    TARGET_SECONDS=$((TARGET_HOUR * 3600))

    if [[ ${SECONDS_NOW} -lt ${TARGET_SECONDS} ]]; then
        WAIT_SECONDS=$((TARGET_SECONDS - SECONDS_NOW))
    else
        WAIT_SECONDS=$((86400 - SECONDS_NOW + TARGET_SECONDS))
    fi

    log "Waiting ${WAIT_SECONDS} seconds until next backup at 02:00 UTC..."

    # Sleep in 30s increments so the container responds to SIGTERM quickly
    # AND checks the trigger file every 30 seconds.
    while [[ ${WAIT_SECONDS} -gt 0 ]]; do
        SLEEP_INTERVAL=30
        if [[ ${WAIT_SECONDS} -lt 30 ]]; then
            SLEEP_INTERVAL=${WAIT_SECONDS}
        fi
        sleep "${SLEEP_INTERVAL}"
        WAIT_SECONDS=$((WAIT_SECONDS - SLEEP_INTERVAL))

        # Check for manual trigger during the sleep
        if [[ -f "${TRIGGER_FILE}" ]]; then
            log "Manual backup trigger detected."
            rm -f "${TRIGGER_FILE}"
            run_backup
            break # Recalculate wait time in the outer loop
        fi
    done

    # Time reached 02:00 UTC — run the scheduled backup
    run_backup
done
