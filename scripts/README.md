# Scripts Directory

Utility scripts for QR Order Platform operations.

## 📋 Available Scripts

### Backup & Recovery

#### `backup.sh` - Database Backup
Backs up MySQL and Redis data.

```bash
# Development environment (default)
./scripts/backup.sh

# Staging environment
./scripts/backup.sh staging

# Production environment
./scripts/backup.sh prod
```

**Features:**
- ✅ MySQL database backup (compressed)
- ✅ Redis data backup
- ✅ Automatic cleanup (keeps last 7 days)
- ✅ Optional S3 upload support

**Output:**
- `database/backups/mysql_<env>_<timestamp>.sql.gz`
- `database/backups/redis_<env>_<timestamp>.rdb`

#### `restore.sh` - Database Restore
Restores MySQL database from backup.

```bash
# Restore from backup file
./scripts/restore.sh database/backups/mysql_dev_20250115_120000.sql.gz dev

# Or with full path
./scripts/restore.sh /path/to/backup.sql.gz prod
```

**⚠️ Warning:** This will overwrite the existing database!

#### `full-backup.sh` - Full System Backup
Creates a complete backup including database, Redis, and configuration files.

```bash
./scripts/full-backup.sh dev
```

**Includes:**
- MySQL database backup
- Redis data backup
- Configuration files (.env, docker-compose.yml)
- Backup manifest

### Automated Backups (Cron)

Add to crontab for automated backups:

```bash
# Edit crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/root/scripts/backup.sh prod >> /var/log/qr-order-backup.log 2>&1

# Weekly full backup at Sunday 3 AM
0 3 * * 0 /path/to/root/scripts/full-backup.sh prod >> /var/log/qr-order-backup.log 2>&1
```

## 🔧 Environment Variables

Set these environment variables for backup scripts:

```bash
# Database credentials
export DB_ROOT_PASSWORD="your_password"
export DB_HOST="localhost"  # For non-Docker MySQL
export DB_PORT="3306"

# AWS S3 (optional)
export AWS_S3_BACKUP_BUCKET="your-backup-bucket"
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
```

## 📁 Backup Directory Structure

```
database/backups/
├── mysql_dev_20250115_120000.sql.gz
├── mysql_dev_20250116_020000.sql.gz
├── redis_dev_20250115_120000.rdb
├── full_dev_20250115_120000/
│   ├── mysql_dev_20250115_120000.sql.gz
│   ├── redis_dev_20250115_120000.rdb
│   ├── .env.backup
│   ├── docker-compose.yml
│   └── MANIFEST.txt
└── full_dev_20250115_120000.tar.gz
```

## 🔐 Security Notes

1. **Backup files contain sensitive data** - Store securely
2. **Set proper permissions:**
   ```bash
   chmod 600 database/backups/*.sql.gz
   chmod 600 database/backups/*.rdb
   ```
3. **Encrypt backups** before uploading to cloud storage
4. **Never commit backup files** to Git (already in .gitignore)

## 📚 Related Documentation

- [Docker Guide - Backup & Recovery](../docs/deployment/docker-guide.md#7-backup--recovery)
- [Database Schema - Backup Strategy](../docs/architecture/database-schema.md#backup-strategy)
- [System Design - Disaster Recovery](../docs/architecture/system-design.md#7-disaster-recovery)

