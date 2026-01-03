# Database Backups

This directory stores database backup files.

## 📁 Backup Files

- `mysql_<env>_<timestamp>.sql.gz` - MySQL database backups (compressed)
- `redis_<env>_<timestamp>.rdb` - Redis data backups
- `full_<env>_<timestamp>/` - Full system backup directories
- `full_<env>_<timestamp>.tar.gz` - Compressed full backups

## 🔧 Backup Scripts

Backups are created using scripts in `../../scripts/`:

- `backup.sh` - Daily database backup
- `full-backup.sh` - Complete system backup
- `restore.sh` - Restore from backup

See [scripts/README.md](../../scripts/README.md) for usage instructions.

## 📅 Retention Policy

- **Daily backups**: Kept for 7 days
- **Full backups**: Kept for 30 days (manual cleanup)
- **Old backups**: Automatically deleted by backup scripts

## 🔐 Security

⚠️ **Important Security Notes:**

1. **Backup files contain sensitive data** - Never commit to Git
2. **Set proper permissions:**
   ```bash
   chmod 600 *.sql.gz
   chmod 600 *.rdb
   ```
3. **Encrypt backups** before uploading to cloud storage
4. **Store backups securely** - Use encrypted storage for production backups

## 📦 Restore Instructions

### Restore MySQL Database

```bash
# From project root
./scripts/restore.sh database/backups/mysql_dev_20250115_120000.sql.gz dev
```

### Restore Redis Data

```bash
# Copy Redis dump file to container
docker cp database/backups/redis_dev_20250115_120000.rdb qr-order-redis:/data/dump.rdb

# Restart Redis container
docker restart qr-order-redis
```

## ☁️ Cloud Backup (Optional)

For production, consider uploading backups to cloud storage:

- **AWS S3**: Configure in `backup.sh`
- **Google Cloud Storage**: Use `gsutil`
- **Azure Blob Storage**: Use Azure CLI

Example S3 upload (uncomment in `backup.sh`):
```bash
aws s3 cp backup.sql.gz s3://your-backup-bucket/mysql/
```

## 📚 Related Documentation

- [Backup Scripts](../../scripts/README.md)
- [Docker Guide - Backup & Recovery](../../docs/deployment/docker-guide.md#7-backup--recovery)
- [System Design - Disaster Recovery](../../docs/architecture/system-design.md#7-disaster-recovery)

