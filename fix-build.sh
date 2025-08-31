#!/bin/bash

echo "🔧 Fixing frontend build with increased memory..."

# Stop frontend
pm2 stop truyendex-frontend

# Remove old build
echo "🧹 Cleaning old build..."
rm -rf .next

# Build with increased memory
echo "🔨 Building frontend with 4GB memory limit..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Check if build was successful
if [ -d ".next" ]; then
    echo "✅ Build successful!"
    
    # Start frontend (standalone mode)
    echo "🚀 Starting frontend..."
    pm2 start "node .next/standalone/server.js" --name "truyendex-frontend"
    
    # Show status
    echo "📊 PM2 Status:"
    pm2 status
    
    echo "📝 Frontend logs:"
    pm2 logs truyendex-frontend --lines 10
else
    echo "❌ Build failed!"
    exit 1
fi
