#!/bin/bash

echo "🔧 Fixing TruyenDex deployment..."

# Stop all PM2 processes
echo "🛑 Stopping all processes..."
pm2 stop all
pm2 delete all

# Clean everything
echo "🧹 Cleaning build artifacts..."
rm -rf .next
rm -rf backend/node_modules/.prisma

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

# Build frontend with memory limit
echo "🔨 Building frontend..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Check if build was successful
if [ ! -d ".next" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

# Copy static files to public directory for standalone mode
echo "📁 Copying static files..."
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
cp -r public .next/standalone/ 2>/dev/null || true

# Start backend
echo "🚀 Starting backend..."
cd backend
pm2 start src/server.js --name "truyendex-backend" --env production
cd ..

# Start frontend (regular mode)
echo "🚀 Starting frontend..."
pm2 start npm --name "truyendex-frontend" -- start

# Save PM2 config
pm2 save

echo "✅ Deployment complete!"
echo ""
echo "📊 Status:"
pm2 status
echo ""
echo "📝 Logs:"
pm2 logs --lines 5
