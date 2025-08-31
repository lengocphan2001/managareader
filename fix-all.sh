#!/bin/bash

echo "🔧 Fixing all deployment issues..."

# Stop PM2 processes
echo "🛑 Stopping PM2 processes..."
pm2 stop all
pm2 delete all

# Clean up
echo "🧹 Cleaning up..."
cd /var/www/truyendex
rm -rf .next
rm -rf backend/node_modules/.prisma

# Copy environment templates
echo "📋 Setting up environment files..."
cp env.production.template .env.production
cp backend/env.production.template backend/.env

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install && cd ..

# Build frontend with memory limit
echo "🏗️ Building frontend..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd backend
npx prisma generate
cd ..

# Start backend
echo "🚀 Starting backend..."
pm2 start ecosystem.config.js --only truyendex-backend

# Wait a moment for backend to start
sleep 5

# Start frontend
echo "🚀 Starting frontend..."
pm2 start ecosystem.config.js --only truyendex-frontend

# Save PM2 configuration
pm2 save

echo "✅ All fixes applied! Check status with: pm2 status"
echo "📊 Check logs with: pm2 logs"