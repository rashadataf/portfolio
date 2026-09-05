#!/bin/bash
# PostgreSQL Backup Script for Production
# Run via cron daily at 02:00 UTC

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-rashad}"
POSTGRES_DB="${POSTGRES_DB:-portfolio}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Timestamp
TIMESTAMP=$(date -u +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/postgres_${POSTGRES_DB}_${TIMESTAMP}.sql.gz"
LATEST_LINK="${BACKUP_DIR}/postgres_${POSTGRES_DB}_latest.sql.gz"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Log function
log() {
    echo "[$(date -u +"%Y-%m-%d %H:%M:%S UTC")] $*"
}

# Check required environment variables
if [[ -z "${POSTGRES_PASSWORD}" ]]; then
    log "ERROR: POSTGRES_PASSWORD environment variable is required"
    exit 1
fi

log "Starting backup of ${POSTGRES_DB}..."

# Perform backup (plain SQL format, compressed with gzip)
export PGPASSWORD="${POSTGRES_PASSWORD}"
if pg_dump \
    -h "${POSTGRES_HOST}" \
    -p "${POSTGRES_PORT}" \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    --no-password \
    --verbose \
    --format=plain \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    | gzip > "${BACKUP_FILE}"; then
    
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log "Backup completed successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"
    
    # Update latest symlink
    ln -sf "$(basename "${BACKUP_FILE}")" "${LATEST_LINK}"
    log "Updated latest symlink: ${LATEST_LINK}"
else
    log "ERROR: Backup failed"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# Cleanup old local backups
log "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "postgres_${POSTGRES_DB}_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
log "Cleanup completed"

log "Backup process completed successfully"
