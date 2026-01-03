#!/bin/bash
# ============================================
# QR Order Platform - Database Restore Script
# ============================================
# This script restores MySQL database from backup
# Usage: ./restore.sh <backup_file> [environment]
# Example: ./restore.sh mysql_dev_20250115_120000.sql.gz dev
# ============================================

set -e

# Check arguments
if [ $# -lt 1 ]; then
  echo "❌ Error: Backup file is required"
  echo ""
  echo "Usage: $0 <backup_file> [environment]"
  echo ""
  echo "Examples:"
  echo "  $0 database/backups/mysql_dev_20250115_120000.sql.gz dev"
  echo "  $0 database/backups/mysql_prod_20250115_120000.sql.gz prod"
  echo ""
  exit 1
fi

BACKUP_FILE=$1
ENVIRONMENT=${2:-dev}

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Resolve backup file path
if [[ "$BACKUP_FILE" != /* ]]; then
  # Relative path
  if [[ "$BACKUP_FILE" == database/backups/* ]]; then
    BACKUP_FILE="${ROOT_DIR}/${BACKUP_FILE}"
  else
    BACKUP_FILE="${ROOT_DIR}/database/backups/${BACKUP_FILE}"
  fi
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Environment-specific configuration
case $ENVIRONMENT in
  dev)
    MYSQL_CONTAINER="qr-order-mysql"
    DB_NAME="qr_order_db"
    DB_USER="root"
    DB_PASSWORD="${DB_ROOT_PASSWORD:-rootpassword}"
    ;;
  staging)
    MYSQL_CONTAINER="qr-order-mysql-staging"
    DB_NAME="qr_order_staging"
    DB_USER="root"
    DB_PASSWORD="${DB_ROOT_PASSWORD}"
    ;;
  prod)
    MYSQL_CONTAINER="qr-order-mysql-prod"
    DB_NAME="qr_order_prod"
    DB_USER="root"
    DB_PASSWORD="${DB_ROOT_PASSWORD}"
    ;;
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    echo "Usage: $0 <backup_file> [dev|staging|prod]"
    exit 1
    ;;
esac

echo "============================================"
echo "🔄 Database Restore"
echo "============================================"
echo "📁 Backup file: $BACKUP_FILE"
echo "🌍 Environment: $ENVIRONMENT"
echo "🗄️  Database: $DB_NAME"
echo "============================================"
echo ""

# Confirmation prompt
read -p "⚠️  WARNING: This will overwrite the existing database. Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Restore cancelled"
  exit 0
fi

# Check if container is running
USE_DOCKER=false
if docker ps --format '{{.Names}}' | grep -q "^${MYSQL_CONTAINER}$"; then
  USE_DOCKER=true
  echo "✅ Using Docker container: ${MYSQL_CONTAINER}"
else
  echo "⚠️  Container not found, using direct MySQL connection"
fi

# Restore database
echo ""
echo "📦 Restoring database..."

if [ "$USE_DOCKER" = true ]; then
  # Check if file is compressed
  if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "   Decompressing and restoring..."
    gunzip < "$BACKUP_FILE" | docker exec -i ${MYSQL_CONTAINER} mysql \
      -u ${DB_USER} \
      -p${DB_PASSWORD} \
      ${DB_NAME}
  else
    echo "   Restoring..."
    docker exec -i ${MYSQL_CONTAINER} mysql \
      -u ${DB_USER} \
      -p${DB_PASSWORD} \
      ${DB_NAME} < "$BACKUP_FILE"
  fi
else
  # Direct MySQL connection
  if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "   Decompressing and restoring..."
    gunzip < "$BACKUP_FILE" | mysql \
      -h ${DB_HOST:-localhost} \
      -P ${DB_PORT:-3306} \
      -u ${DB_USER} \
      -p${DB_PASSWORD} \
      ${DB_NAME}
  else
    echo "   Restoring..."
    mysql \
      -h ${DB_HOST:-localhost} \
      -P ${DB_PORT:-3306} \
      -u ${DB_USER} \
      -p${DB_PASSWORD} \
      ${DB_NAME} < "$BACKUP_FILE"
  fi
fi

echo ""
echo "============================================"
echo "✅ Database restore completed successfully!"
echo "============================================"

