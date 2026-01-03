#!/bin/bash
# ============================================
# QR Order Platform - Database Backup Script
# ============================================
# This script backs up MySQL and Redis data
# Usage: ./backup.sh [environment]
# Environment: dev, staging, prod (default: dev)
# ============================================

set -e

# Configuration
ENVIRONMENT=${1:-dev}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/database/backups"

# Environment-specific configuration
case $ENVIRONMENT in
  dev)
    MYSQL_CONTAINER="qr-order-mysql"
    REDIS_CONTAINER="qr-order-redis"
    DB_NAME="qr_order_db"
    DB_USER="root"
    DB_PASSWORD="${DB_ROOT_PASSWORD:-rootpassword}"
    ;;
  staging)
    MYSQL_CONTAINER="qr-order-mysql-staging"
    REDIS_CONTAINER="qr-order-redis-staging"
    DB_NAME="qr_order_staging"
    DB_USER="root"
    DB_PASSWORD="${DB_ROOT_PASSWORD}"
    ;;
  prod)
    MYSQL_CONTAINER="qr-order-mysql-prod"
    REDIS_CONTAINER="qr-order-redis-prod"
    DB_NAME="qr_order_prod"
    DB_USER="root"
    DB_PASSWORD="${DB_ROOT_PASSWORD}"
    ;;
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    echo "Usage: $0 [dev|staging|prod]"
    exit 1
    ;;
esac

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo "============================================"
echo "🚀 Starting backup for environment: $ENVIRONMENT"
echo "📅 Timestamp: $TIMESTAMP"
echo "📁 Backup directory: $BACKUP_DIR"
echo "============================================"

# Check if containers are running
if ! docker ps --format '{{.Names}}' | grep -q "^${MYSQL_CONTAINER}$"; then
  echo "⚠️  Warning: MySQL container '${MYSQL_CONTAINER}' is not running"
  echo "   Attempting backup with direct MySQL connection..."
  USE_DOCKER=false
else
  USE_DOCKER=true
fi

# Backup MySQL database
echo ""
echo "📦 Backing up MySQL database..."
MYSQL_BACKUP_FILE="${BACKUP_DIR}/mysql_${ENVIRONMENT}_${TIMESTAMP}.sql.gz"

if [ "$USE_DOCKER" = true ]; then
  docker exec ${MYSQL_CONTAINER} mysqldump \
    -u ${DB_USER} \
    -p${DB_PASSWORD} \
    --single-transaction \
    --quick \
    --lock-tables=false \
    --routines \
    --triggers \
    --events \
    ${DB_NAME} | gzip > "${MYSQL_BACKUP_FILE}"
else
  # Direct MySQL connection (if not using Docker)
  mysqldump \
    -h ${DB_HOST:-localhost} \
    -P ${DB_PORT:-3306} \
    -u ${DB_USER} \
    -p${DB_PASSWORD} \
    --single-transaction \
    --quick \
    --lock-tables=false \
    --routines \
    --triggers \
    --events \
    ${DB_NAME} | gzip > "${MYSQL_BACKUP_FILE}"
fi

if [ -f "${MYSQL_BACKUP_FILE}" ] && [ -s "${MYSQL_BACKUP_FILE}" ]; then
  MYSQL_SIZE=$(du -h "${MYSQL_BACKUP_FILE}" | cut -f1)
  echo "✅ MySQL backup completed: ${MYSQL_BACKUP_FILE} (${MYSQL_SIZE})"
else
  echo "❌ MySQL backup failed!"
  exit 1
fi

# Backup Redis data
echo ""
echo "📦 Backing up Redis data..."
REDIS_BACKUP_FILE="${BACKUP_DIR}/redis_${ENVIRONMENT}_${TIMESTAMP}.rdb"

if docker ps --format '{{.Names}}' | grep -q "^${REDIS_CONTAINER}$"; then
  # Trigger Redis save
  docker exec ${REDIS_CONTAINER} redis-cli SAVE > /dev/null 2>&1 || true
  
  # Copy Redis dump file
  if docker cp ${REDIS_CONTAINER}:/data/dump.rdb "${REDIS_BACKUP_FILE}" 2>/dev/null; then
    REDIS_SIZE=$(du -h "${REDIS_BACKUP_FILE}" | cut -f1)
    echo "✅ Redis backup completed: ${REDIS_BACKUP_FILE} (${REDIS_SIZE})"
  else
    echo "⚠️  Warning: Redis backup skipped (no data or container not accessible)"
  fi
else
  echo "⚠️  Warning: Redis container '${REDIS_CONTAINER}' is not running, skipping Redis backup"
fi

# Cleanup old backups (keep last 7 days)
echo ""
echo "🧹 Cleaning up old backups (keeping last 7 days)..."
find "${BACKUP_DIR}" -name "mysql_${ENVIRONMENT}_*.sql.gz" -mtime +7 -delete 2>/dev/null || true
find "${BACKUP_DIR}" -name "redis_${ENVIRONMENT}_*.rdb" -mtime +7 -delete 2>/dev/null || true
echo "✅ Cleanup completed"

# Optional: Upload to S3 (uncomment if using AWS S3)
# if [ -n "${AWS_S3_BACKUP_BUCKET}" ]; then
#   echo ""
#   echo "☁️  Uploading to S3..."
#   aws s3 cp "${MYSQL_BACKUP_FILE}" "s3://${AWS_S3_BACKUP_BUCKET}/mysql/" || echo "⚠️  S3 upload failed"
#   if [ -f "${REDIS_BACKUP_FILE}" ]; then
#     aws s3 cp "${REDIS_BACKUP_FILE}" "s3://${AWS_S3_BACKUP_BUCKET}/redis/" || echo "⚠️  S3 upload failed"
#   fi
# fi

echo ""
echo "============================================"
echo "✅ Backup completed successfully!"
echo "📁 MySQL: ${MYSQL_BACKUP_FILE}"
if [ -f "${REDIS_BACKUP_FILE}" ]; then
  echo "📁 Redis: ${REDIS_BACKUP_FILE}"
fi
echo "============================================"

