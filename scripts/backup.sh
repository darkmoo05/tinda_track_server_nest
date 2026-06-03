#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Load configuration from environment or define fallback variables
DB_NAME=${POSTGRES_DB:-"tinda_track"}
DB_USER=${POSTGRES_USER:-"postgres"}
DB_HOST=${POSTGRES_HOST:-"localhost"}
DB_PORT=${POSTGRES_PORT:-"5432"}
BACKUP_DIR="/usr/src/app/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${TIMESTAMP}.sql.gz"

echo "Starting automated database backup for ${DB_NAME} at $(date)..."

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Run pg_dump and compress the output using gzip
# Note: PGPASSWORD should be set in the environment to avoid interactive prompt
pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -F p "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "Database backup successfully saved to local file: ${BACKUP_FILE}"

# Optional: Upload backup to AWS S3 (Uncomment and configure if S3 bucket is active)
# S3_BUCKET="s3://tinda-track-backups/db"
# echo "Uploading backup to AWS S3: ${S3_BUCKET}"
# aws s3 cp "${BACKUP_FILE}" "${S3_BUCKET}/${DB_NAME}_backup_${TIMESTAMP}.sql.gz"

# Clean up local backups older than 7 days to preserve disk space
echo "Pruning local database backups older than 7 days..."
find "${BACKUP_DIR}" -name "${DB_NAME}_backup_*.sql.gz" -type f -mtime +7 -delete

echo "Backup process completed successfully at $(date)."
