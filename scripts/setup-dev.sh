#!/bin/bash

# Development Environment Setup Script
# Sets up the development environment for the Smart Restaurant Platform

echo "🚀 Setting up development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL is not installed. Database setup will be skipped."
else
    echo "✅ MySQL found"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ -f "package.json" ]; then
    npm install
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  Backend package.json not found"
fi
cd ..

# Install frontend-customer dependencies
echo "📦 Installing frontend-customer dependencies..."
cd frontend-customer
if [ -f "package.json" ]; then
    npm install
    echo "✅ Frontend-customer dependencies installed"
else
    echo "⚠️  Frontend-customer package.json not found"
fi
cd ..

# Install frontend-admin dependencies
echo "📦 Installing frontend-admin dependencies..."
cd frontend-admin
if [ -f "package.json" ]; then
    npm install
    echo "✅ Frontend-admin dependencies installed"
else
    echo "⚠️  Frontend-admin package.json not found"
fi
cd ..

# Install testing dependencies
echo "📦 Installing testing dependencies..."
cd testing
if [ -f "package.json" ]; then
    npm install
    echo "✅ Testing dependencies installed"
else
    echo "⚠️  Testing package.json not found"
fi
cd ..

# Setup database
echo "🗄️  Setting up database..."
if command -v mysql &> /dev/null; then
    echo "Creating database..."
    mysql -u root -p < database/init.sql
    echo "Seeding database..."
    mysql -u root -p restaurant_db < database/seed.sql
    echo "✅ Database setup complete"
else
    echo "⚠️  Skipping database setup (MySQL not found)"
fi

# Create .env files if they don't exist
echo "📝 Creating environment files..."
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from template..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "⚠️  .env.example not found"
fi

echo "✅ Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env files with your configuration"
echo "2. Run 'npm run dev' in each frontend directory"
echo "3. Run 'npm start' in backend directory"
echo "4. Access frontend at http://localhost:3000"
echo "5. Access admin at http://localhost:3001"

