#!/bin/bash

echo "🔧 Comprehensive TruyenDex Fix"
echo "=============================="

# Stop all PM2 processes
echo "🛑 Stopping all processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Clean everything thoroughly
echo "🧹 Deep cleaning..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf backend/node_modules/.prisma
rm -rf backend/.env.production 2>/dev/null || true

# Copy environment files
echo "📝 Setting up environment files..."
cp backend/env.production.template backend/.env.production 2>/dev/null || true
cp env.production.template .env.production 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend
npm install
cd ..

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd backend
npx prisma generate
cd ..

# Build frontend with memory limit and force dynamic
echo "🔨 Building frontend (force dynamic)..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Check if build was successful
if [ ! -d ".next" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

# Start backend
echo "🚀 Starting backend..."
cd backend
pm2 start src/server.js --name "truyendex-backend" --env production
cd ..

# Start frontend
echo "🚀 Starting frontend..."
pm2 start npm --name "truyendex-frontend" -- start

# Save PM2 config
pm2 save

echo "✅ Fix complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "📝 Recent logs:"
pm2 logs --lines 3
echo ""
echo "🌐 Test your site: https://ninetails.site"
echo "🔍 Check logs: pm2 logs"
