#!/bin/bash
# ============================================
# QR Order Platform - Full Backup Script
# ============================================
# This script performs a full backup including:
# - MySQL database (with all data)
# - Redis data
# - Application files (optional)
# Usage: ./full-backup.sh [environment]
# ============================================

set -e

ENVIRONMENT=${1:-dev}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/database/backups"
FULL_BACKUP_DIR="${BACKUP_DIR}/full_${ENVIRONMENT}_${TIMESTAMP}"

# Create full backup directory
mkdir -p "${FULL_BACKUP_DIR}"

echo "============================================"
echo "🚀 Starting FULL backup for: $ENVIRONMENT"
echo "📅 Timestamp: $TIMESTAMP"
echo "📁 Backup directory: $FULL_BACKUP_DIR"
echo "============================================"

# Run regular backup first
echo ""
echo "📦 Step 1: Database backup..."
"${SCRIPT_DIR}/backup.sh" "$ENVIRONMENT"

# Copy latest backup files to full backup directory
echo ""
echo "📦 Step 2: Copying backup files..."
LATEST_MYSQL=$(ls -t "${BACKUP_DIR}"/mysql_${ENVIRONMENT}_*.sql.gz 2>/dev/null | head -1)
LATEST_REDIS=$(ls -t "${BACKUP_DIR}"/redis_${ENVIRONMENT}_*.rdb 2>/dev/null | head -1)

if [ -n "$LATEST_MYSQL" ]; then
  cp "$LATEST_MYSQL" "${FULL_BACKUP_DIR}/"
  echo "✅ Copied MySQL backup"
fi

if [ -n "$LATEST_REDIS" ]; then
  cp "$LATEST_REDIS" "${FULL_BACKUP_DIR}/"
  echo "✅ Copied Redis backup"
fi

# Backup application configuration (optional)
echo ""
echo "📦 Step 3: Backing up configuration files..."
if [ -f "${ROOT_DIR}/.env" ]; then
  cp "${ROOT_DIR}/.env" "${FULL_BACKUP_DIR}/.env.backup" 2>/dev/null || true
  echo "✅ Backed up .env file"
fi

if [ -f "${ROOT_DIR}/docker-compose.yml" ]; then
  cp "${ROOT_DIR}/docker-compose.yml" "${FULL_BACKUP_DIR}/" 2>/dev/null || true
  echo "✅ Backed up docker-compose.yml"
fi

# Create backup manifest
echo ""
echo "📦 Step 4: Creating backup manifest..."
cat > "${FULL_BACKUP_DIR}/MANIFEST.txt" <<EOF
QR Order Platform - Full Backup Manifest
========================================
Environment: ${ENVIRONMENT}
Timestamp: ${TIMESTAMP}
Created: $(date)

Contents:
$(ls -lh "${FULL_BACKUP_DIR}")

Database:
- MySQL: $(basename "$LATEST_MYSQL" 2>/dev/null || echo "N/A")
- Redis: $(basename "$LATEST_REDIS" 2>/dev/null || echo "N/A")

Restore Instructions:
1. Extract this backup directory
2. Run: ./scripts/restore.sh <mysql_backup_file> ${ENVIRONMENT}
3. Restore Redis if needed: docker cp redis_backup.rdb <container>:/data/dump.rdb
EOF

echo "✅ Manifest created"

# Create archive (optional)
echo ""
read -p "📦 Create compressed archive? (yes/no): " CREATE_ARCHIVE
if [ "$CREATE_ARCHIVE" = "yes" ]; then
  ARCHIVE_FILE="${BACKUP_DIR}/full_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"
  tar -czf "${ARCHIVE_FILE}" -C "${BACKUP_DIR}" "full_${ENVIRONMENT}_${TIMESTAMP}"
  ARCHIVE_SIZE=$(du -h "${ARCHIVE_FILE}" | cut -f1)
  echo "✅ Archive created: ${ARCHIVE_FILE} (${ARCHIVE_SIZE})"
  
  # Remove uncompressed directory
  read -p "🗑️  Remove uncompressed directory? (yes/no): " REMOVE_DIR
  if [ "$REMOVE_DIR" = "yes" ]; then
    rm -rf "${FULL_BACKUP_DIR}"
    echo "✅ Removed uncompressed directory"
  fi
fi

echo ""
echo "============================================"
echo "✅ Full backup completed successfully!"
echo "📁 Location: ${FULL_BACKUP_DIR}"
echo "============================================"

