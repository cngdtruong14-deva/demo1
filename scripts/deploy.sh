#!/bin/bash

# Production Deployment Script
# Deploys the Smart Restaurant Platform to production

set -e  # Exit on error

echo "🚀 Starting production deployment..."

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

# Check if required tools are installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

echo "✅ PM2 version: $(pm2 --version)"

# Create backup directory
echo "📦 Creating backup..."
mkdir -p "$BACKUP_DIR"
echo "✅ Backup directory created: $BACKUP_DIR"

# Backup database
echo "💾 Backing up database..."
if command -v mysqldump &> /dev/null; then
    mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_DIR/database.sql"
    echo "✅ Database backup created"
else
    echo "⚠️  mysqldump not found. Skipping database backup."
fi

# Run database migrations
echo "🔄 Running database migrations..."
if [ -f "scripts/migrate-db.js" ]; then
    node scripts/migrate-db.js
    echo "✅ Migrations completed"
else
    echo "⚠️  Migration script not found. Skipping migrations."
fi

# Build frontend applications
echo "🏗️  Building frontend applications..."

# Build customer frontend
if [ -d "frontend-customer" ]; then
    echo "Building frontend-customer..."
    cd frontend-customer
    npm ci
    npm run build
    cd ..
    echo "✅ Frontend-customer built"
fi

# Build admin frontend
if [ -d "frontend-admin" ]; then
    echo "Building frontend-admin..."
    cd frontend-admin
    npm ci
    npm run build
    cd ..
    echo "✅ Frontend-admin built"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
if [ -d "backend" ]; then
    cd backend
    npm ci --production
    cd ..
    echo "✅ Backend dependencies installed"
fi

# Stop existing PM2 processes
echo "🛑 Stopping existing processes..."
pm2 stop all || true
pm2 delete all || true

# Start applications with PM2
echo "▶️  Starting applications with PM2..."
pm2 start config/pm2.config.js --env "$ENVIRONMENT"

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "📝 Useful commands:"
echo "   pm2 logs          - View logs"
echo "   pm2 monit         - Monitor applications"
echo "   pm2 restart all   - Restart all applications"
echo "   pm2 stop all      - Stop all applications"

