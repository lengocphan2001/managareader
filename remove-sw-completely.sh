#!/bin/bash

# Completely Remove Service Worker Script
# This script will remove the service worker file entirely if disabled version doesn't work

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

print_status "🗑️ COMPLETELY REMOVING SERVICE WORKER - NUCLEAR OPTION!"

# Navigate to application directory
cd /var/www/truyendex

# 1. Backup service worker file
print_status "1. Creating backup of service worker..."
if [ -f "src/app/sw.ts" ]; then
    cp src/app/sw.ts src/app/sw.ts.backup.$(date +%Y%m%d_%H%M%S)
    print_status "✅ Service worker backed up"
else
    print_warning "⚠️ Service worker file not found"
fi

# 2. Remove service worker file completely
print_status "2. Removing service worker file..."
if [ -f "src/app/sw.ts" ]; then
    rm src/app/sw.ts
    print_status "✅ Service worker file removed"
else
    print_warning "⚠️ Service worker file already removed"
fi

# 3. Remove service worker from next.config.js
print_status "3. Removing service worker from next.config.js..."
if [ -f "next.config.js" ]; then
    # Create backup
    cp next.config.js next.config.js.backup.$(date +%Y%m%d_%H%M%S)
    
    # Remove serwist configuration
    sed -i '/withSerwist/d' next.config.js
    sed -i '/serwist/d' next.config.js
    
    print_status "✅ Service worker removed from next.config.js"
else
    print_warning "⚠️ next.config.js not found"
fi

# 4. Build the application without service worker
print_status "4. Building application without service worker..."
if npm run build; then
    print_status "✅ Build successful without service worker!"
else
    print_error "❌ Build failed!"
    print_status "Restoring service worker..."
    if [ -f "src/app/sw.ts.backup"* ]; then
        cp src/app/sw.ts.backup.* src/app/sw.ts
    fi
    if [ -f "next.config.js.backup"* ]; then
        cp next.config.js.backup.* next.config.js
    fi
    exit 1
fi

# 5. Restart services
print_status "5. Restarting services..."
if command -v pm2 &> /dev/null; then
    pm2 restart truyendex-frontend
    pm2 restart truyendex-backend
    print_status "✅ PM2 services restarted"
elif command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.prod.yml restart
    print_status "✅ Docker services restarted"
else
    print_warning "⚠️ No service manager found"
fi

# 6. Wait for services to be ready
print_status "6. Waiting for services to be ready..."
sleep 15

# 7. Test endpoints
print_status "7. Testing endpoints..."
echo "Testing frontend..."
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000 || echo "Frontend not responding"
echo "Testing backend..."
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8000 || echo "Backend not responding"

print_status "🗑️ SERVICE WORKER COMPLETELY REMOVED!"
echo ""
print_status "✅ What this REMOVES:"
echo "• Service worker file completely deleted"
echo "• Serwist configuration removed from next.config.js"
echo "• No more service worker registration"
echo "• No more caching at all"
echo ""
print_status "🔧 Technical changes:"
echo "• src/app/sw.ts - DELETED"
echo "• next.config.js - serwist config removed"
echo "• Build without service worker"
echo "• Nginx still has no-cache headers"
echo ""
print_status "🧪 Testing Instructions:"
echo "1. Clear browser cache completely (Ctrl+Shift+Delete)"
echo "2. Visit your site and wait for manga covers to load"
echo "3. Press Ctrl+R (normal refresh) - should work now!"
echo "4. Check DevTools - no service worker should be active"
echo "5. No more Ctrl+Shift+R needed!"
echo ""
print_status "📋 Expected behavior:"
echo "• Ctrl+R works normally - no more hard refresh needed"
echo "• Images load fresh every time"
echo "• No more disappearing images"
echo "• No service worker in DevTools"
echo ""
print_status "🚨 If you STILL need Ctrl+Shift+R:"
echo "• Check if there are other caching layers"
echo "• Look for browser-level caching"
echo "• Check nginx caching headers"
echo "• Verify the service worker is really gone"
echo ""
print_status "💡 To restore service worker later:"
echo "• Run: cp src/app/sw.ts.backup.* src/app/sw.ts"
echo "• Run: cp next.config.js.backup.* next.config.js"
echo "• Rebuild and redeploy"
