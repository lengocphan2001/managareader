#!/bin/bash

# Nuke Service Worker Script
# This script will completely disable service worker and force fresh loads

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

print_status "💥 NUKING SERVICE WORKER - NO MORE CACHING ISSUES!"

# Navigate to application directory
cd /var/www/truyendex

# 1. Build the application with disabled service worker
print_status "1. Building application with disabled service worker..."
if npm run build; then
    print_status "✅ Build successful!"
else
    print_error "❌ Build failed!"
    exit 1
fi

# 2. Backup current nginx config
print_status "2. Creating backup of nginx configuration..."
sudo cp /etc/nginx/sites-available/truyendex /etc/nginx/sites-available/truyendex.backup.$(date +%Y%m%d_%H%M%S)

# 3. Copy updated nginx config (no caching)
print_status "3. Updating nginx configuration (no caching)..."
sudo cp nginx.conf /etc/nginx/sites-available/truyendex

# 4. Test nginx configuration
print_status "4. Testing nginx configuration..."
if sudo nginx -t; then
    print_status "✅ Nginx configuration is valid"
else
    print_error "❌ Nginx configuration has errors!"
    print_status "Restoring backup..."
    sudo cp /etc/nginx/sites-available/truyendex.backup.* /etc/nginx/sites-available/truyendex
    exit 1
fi

# 5. Reload nginx
print_status "5. Reloading nginx..."
sudo systemctl reload nginx

# 6. Restart services
print_status "6. Restarting services..."
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

# 7. Wait for services to be ready
print_status "7. Waiting for services to be ready..."
sleep 15

# 8. Test endpoints
print_status "8. Testing endpoints..."
echo "Testing frontend..."
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000 || echo "Frontend not responding"
echo "Testing backend..."
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8000 || echo "Backend not responding"

print_status "💥 SERVICE WORKER NUKED SUCCESSFULLY!"
echo ""
print_status "✅ What this NUKES:"
echo "• ALL service worker caching - completely disabled"
echo "• ALL runtime caching - set to empty array"
echo "• ALL fetch requests - forced to fresh load"
echo "• ALL old caches - completely deleted"
echo ""
print_status "🔧 Technical changes:"
echo "• runtimeCaching: [] (empty array)"
echo "• fetch event: forces cache: 'no-cache' for ALL requests"
echo "• activate event: deletes ALL caches"
echo "• Nginx: no-cache headers for all images"
echo ""
print_status "🧪 Testing Instructions:"
echo "1. Clear browser cache completely (Ctrl+Shift+Delete)"
echo "2. Visit your site and wait for manga covers to load"
echo "3. Press Ctrl+R (normal refresh) - should work now!"
echo "4. Check browser console for 'DISABLED MODE' logs"
echo "5. No more Ctrl+Shift+R needed!"
echo ""
print_status "📋 Expected behavior:"
echo "• Ctrl+R works normally - no more hard refresh needed"
echo "• Images load fresh every time"
echo "• No more disappearing images"
echo "• Service worker logs 'DISABLED MODE'"
echo ""
print_status "🚨 If you STILL need Ctrl+Shift+R:"
echo "• Check if service worker is still active in DevTools"
echo "• Look for 'DISABLED MODE' logs in console"
echo "• Verify nginx config was reloaded"
echo "• Check if there are other caching layers"
echo ""
print_status "💡 Alternative: Completely remove service worker"
echo "If this still doesn't work, we can completely remove the service worker file"
