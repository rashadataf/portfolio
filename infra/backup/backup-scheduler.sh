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
# The scheduler logs on every wake-up and never restarts, so an unrotated log
# grows without bound on the same volume the backups live on.
LOG_MAX_BYTES=1048576

rotate_log_if_needed() {
    [[ -f "${LOG_FILE}" ]] || return 0
    local size
    size=$(stat -c %s "${LOG_FILE}" 2>/dev/null || echo 0)
    if [[ ${size} -gt ${LOG_MAX_BYTES} ]]; then
        mv -f "${LOG_FILE}" "${LOG_FILE}.1"
        echo "[$(date -u +"%Y-%m-%d %H:%M:%S UTC")] Log rotated (previous log at ${LOG_FILE}.1)" > "${LOG_FILE}"
    fi
}

log() {
    rotate_log_if_needed
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
# Owner is backup (uid 1000, this container); group is 1001, which is the
# `nodejs` group the app container's `nextjs` user belongs to. That lets the
# admin dashboard write the trigger file and delete backups over 775, without
# making database dumps world-writable the way the old chmod 777 did.
if [[ -d /backups ]]; then
    chown -R 1000:1001 /backups
    # 2775, not 775: the setgid bit makes everything created in here inherit
    # group 1001. Without it, pg_dump (running as `backup`, gid 1000) would
    # write dumps as 1000:1000, and the app — which is uid 1001, not root —
    # could no longer read them to serve a download.
    chmod 2775 /backups
    # Dumps are owner+group only; `other` has no business reading a database
    # dump. Safe because the group is now the app's.
    find /backups -maxdepth 1 -type f -name '*.sql.gz' -exec chmod 640 {} + 2>/dev/null || true
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
    # 10# forces base 10. `date` zero-pads, and bash reads a leading-zero
    # operand as octal — so at 08 or 09 minutes/seconds past, the bare
    # arithmetic aborted with "value too great for base". Under `set -e` that
    # killed the scheduler outright; `restart: always` then masked it as a
    # container restart rather than an obvious failure.
    SECONDS_NOW=$((10#${CURRENT_HOUR} * 3600 + 10#${CURRENT_MIN} * 60 + 10#${CURRENT_SEC}))
    TARGET_SECONDS=$((TARGET_HOUR * 3600))

    if [[ ${SECONDS_NOW} -lt ${TARGET_SECONDS} ]]; then
        WAIT_SECONDS=$((TARGET_SECONDS - SECONDS_NOW))
    else
        WAIT_SECONDS=$((86400 - SECONDS_NOW + TARGET_SECONDS))
    fi

    log "Waiting ${WAIT_SECONDS} seconds until next backup at 02:00 UTC..."

    # Tracks why the sleep loop ended. A manual trigger must NOT also fire the
    # scheduled backup below — that made every dashboard-triggered backup run
    # twice back to back.
    MANUALLY_TRIGGERED=0

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
            MANUALLY_TRIGGERED=1
            break # Recalculate wait time in the outer loop
        fi
    done

    # Only when the wait actually elapsed — i.e. it is now 02:00 UTC.
    if [[ ${MANUALLY_TRIGGERED} -eq 0 ]]; then
        run_backup
    fi
done
