#!/bin/bash

# Deployment Script for Smart Restaurant Backend
# Usage: ./scripts/deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
NODE_ENV=${ENVIRONMENT}

echo "🚀 Starting deployment for $ENVIRONMENT environment..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current version: $(node -v)"
  exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Run database migrations
if [ "$ENVIRONMENT" = "production" ]; then
  echo "🗄️  Running database migrations..."
  npm run migrate || echo "⚠️  Migration failed or already applied"
fi

# Build (if needed)
# npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
  echo "📦 Installing PM2 globally..."
  npm install -g pm2
fi

# Stop existing processes
echo "🛑 Stopping existing processes..."
pm2 stop restaurant-backend || true
pm2 delete restaurant-backend || true

# Start with PM2
echo "▶️  Starting application with PM2..."
pm2 start ecosystem.config.js --env $ENVIRONMENT

# Save PM2 configuration
pm2 save

# Setup PM2 startup (if not already set)
if ! pm2 startup | grep -q "already setup"; then
  echo "⚙️  Setting up PM2 startup..."
  pm2 startup
fi

# Show status
echo ""
echo "✅ Deployment completed!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "📝 Useful commands:"
echo "   pm2 logs restaurant-backend    - View logs"
echo "   pm2 monit                      - Monitor application"
echo "   pm2 restart restaurant-backend - Restart application"
echo "   pm2 stop restaurant-backend    - Stop application"

