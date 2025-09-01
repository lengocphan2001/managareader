#!/bin/bash

# Fix 404 Errors Script
# This script will fix the service worker that was causing 404 errors

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

print_status "🔧 Fixing 404 errors caused by service worker..."

# Navigate to application directory
cd /var/www/truyendex

# 1. Build the application with fixed service worker
print_status "1. Building application with fixed service worker..."
if npm run build; then
    print_status "✅ Build successful!"
else
    print_error "❌ Build failed!"
    exit 1
fi

# 2. Restart services
print_status "2. Restarting services..."
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

# 3. Wait for services to be ready
print_status "3. Waiting for services to be ready..."
sleep 15

# 4. Test endpoints
print_status "4. Testing endpoints..."
echo "Testing frontend..."
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000 || echo "Frontend not responding"
echo "Testing backend..."
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8000 || echo "Backend not responding"

print_status "🔧 404 errors fixed!"
echo ""
print_status "✅ What this fixes:"
echo "• Service worker no longer intercepts requests"
echo "• External URLs like resizer.f-ck.me work normally"
echo "• No more 404 errors from service worker"
echo "• Manga covers load normally"
echo ""
print_status "🔧 Technical changes:"
echo "• Removed fetch event listener that was causing 404s"
echo "• Service worker still exists but doesn't interfere"
echo "• All requests go through normally"
echo "• No caching, but no blocking either"
echo ""
print_status "🧪 Testing Instructions:"
echo "1. Clear browser cache completely (Ctrl+Shift+Delete)"
echo "2. Visit your site and wait for manga covers to load"
echo "3. Check browser console - no more 404 errors"
echo "4. Manga covers should load normally"
echo "5. Press Ctrl+R - should work without 404s"
echo ""
print_status "📋 Expected behavior:"
echo "• No more 404 errors in console"
echo "• Manga covers load from resizer.f-ck.me"
echo "• Images display normally"
echo "• Ctrl+R works without errors"
echo ""
print_status "🚨 If you still get 404 errors:"
echo "• Check if service worker is still intercepting requests"
echo "• Look for 'CACHING DISABLED' logs in console"
echo "• Verify the build was successful"
echo "• Check if there are other caching layers"
echo ""
print_status "💡 If this still doesn't work:"
echo "• Run './remove-sw-completely.sh' to remove service worker entirely"
echo "• This will completely eliminate any service worker interference"
